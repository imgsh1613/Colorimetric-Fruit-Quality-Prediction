import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
import subprocess
import sys
from tensorflow import keras
from sklearn.model_selection import KFold
from PIL import Image
from skimage import color
from model import build_secnn_regression_model

# =============================================================================
# CONFIGURATION
# =============================================================================
IMG_SIZE    = (224, 224)
BATCH_SIZE  = 32
EPOCHS_PER_FOLD = 30
NUM_FOLDS   = 10

SCRIPT_DIR      = os.path.dirname(os.path.abspath(__file__))
METADATA_PATH   = os.path.join(SCRIPT_DIR, '..', 'metadata.csv')
BASE_DATASET_PATH = os.path.join(SCRIPT_DIR, '..')
MODELS_DIR      = os.path.join(SCRIPT_DIR, 'models')

os.makedirs(MODELS_DIR, exist_ok=True)

# =============================================================================
# Custom Data Generator for Regression
# =============================================================================
class FruitRegressionDataGenerator(keras.utils.Sequence):
    def __init__(self, metadata_df, base_path, batch_size=32, img_size=(224, 224),
                 shuffle=True, augment=False, **kwargs):
        super().__init__(**kwargs)
        self.metadata_df = metadata_df.reset_index(drop=True)
        self.base_path   = base_path
        self.batch_size  = batch_size
        self.img_size    = img_size
        self.shuffle     = shuffle
        self.augment     = augment
        self.indices     = np.arange(len(self.metadata_df))
        if self.shuffle:
            np.random.shuffle(self.indices)

    def __len__(self):
        return int(np.ceil(len(self.metadata_df) / self.batch_size))

    def __getitem__(self, index):
        batch_indices = self.indices[index * self.batch_size:(index + 1) * self.batch_size]
        batch_df = self.metadata_df.iloc[batch_indices]

        X = np.empty((len(batch_df), *self.img_size, 3), dtype=np.float32)
        y = np.empty((len(batch_df), 3), dtype=np.float32)  # [weight_loss, hardness, brittleness]

        for i, (_, row) in enumerate(batch_df.iterrows()):
            rel_path = row['image_path'].replace('\\', '/')
            img_path = os.path.join(self.base_path, rel_path)
            try:
                img = Image.open(img_path).convert('RGB')
                img = img.resize(self.img_size)

                if self.augment and np.random.rand() > 0.5:
                    img = img.transpose(Image.FLIP_LEFT_RIGHT)

                img_array = np.array(img) / 255.0
                X[i,]  = img_array
                y[i, 0] = float(row['weight_loss'])
                y[i, 1] = float(row['hardness'])
                y[i, 2] = float(row['brittleness'])
            except Exception as e:
                print(f"Error loading {img_path}: {e}")

        return X, y

    def on_epoch_end(self):
        if self.shuffle:
            np.random.shuffle(self.indices)


# =============================================================================
# R-Squared Metric for Regression
# =============================================================================
def r_squared(y_true, y_pred):
    """Custom R² metric for Keras."""
    y_true  = keras.backend.cast(y_true, 'float32')
    SS_res  = keras.backend.sum(keras.backend.square(y_true - y_pred))
    SS_tot  = keras.backend.sum(keras.backend.square(y_true - keras.backend.mean(y_true)))
    return 1 - SS_res / (SS_tot + keras.backend.epsilon())


# =============================================================================
# Training Pipeline: 10-Fold Cross Validation
# =============================================================================
print("=" * 60)
print("FRUITSENSE: SE-CNN REGRESSION TRAINING")
print("Non-Invasive Predictive Modeling using 10-Fold Cross Validation")
print("=" * 60)

print("\nLoading Metadata...")
df = pd.read_csv(METADATA_PATH)

kf = KFold(n_splits=NUM_FOLDS, shuffle=True, random_state=42)

fold_metrics  = []
all_histories = {}

for fold, (train_idx, val_idx) in enumerate(kf.split(df)):
    print("\n" + "=" * 60)
    print(f"STARTING FOLD {fold + 1} / {NUM_FOLDS}")
    print("=" * 60)

    train_df = df.iloc[train_idx]
    val_df   = df.iloc[val_idx]

    train_gen = FruitRegressionDataGenerator(train_df, BASE_DATASET_PATH, batch_size=BATCH_SIZE, augment=True)
    val_gen   = FruitRegressionDataGenerator(val_df,   BASE_DATASET_PATH, batch_size=BATCH_SIZE, augment=False)

    # FIX #1: pretrained=True was silently ignored before; now passing False explicitly.
    # To use pretrained weights in future, implement the option inside build_secnn_regression_model().
    model, _ = build_secnn_regression_model(pretrained=False)

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0005),
        loss='mse',
        metrics=['mae', r_squared]
    )

    # FIX #6: Verify the exact metric name Keras registered so callbacks fire correctly.
    # Keras names a custom metric function by its __name__, giving 'r_squared' and
    # 'val_r_squared' in history. Print keys on the first fold to confirm.
    if fold == 0:
        # Run one tiny step to materialise history keys before setting up callbacks
        dummy_history = model.fit(train_gen, epochs=1, validation_data=val_gen, verbose=0)
        metric_keys = list(dummy_history.history.keys())
        print(f"[INFO] Keras metric keys for callbacks: {metric_keys}")
        # Determine the actual validation R² key (handles any name mangling)
        val_r2_key = next((k for k in metric_keys if 'r_squared' in k and k.startswith('val_')), 'val_r_squared')
        print(f"[INFO] Using '{val_r2_key}' for ModelCheckpoint / EarlyStopping monitors.")
    # else val_r2_key carries over from fold 0

    model_save_path = os.path.join(MODELS_DIR, f'secnn_fold_{fold+1}.h5')
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            model_save_path, monitor=val_r2_key, mode='max', save_best_only=True, verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6, verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor=val_r2_key, mode='max', patience=8, restore_best_weights=True, verbose=1
        )
    ]

    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_PER_FOLD,
        callbacks=callbacks,
        verbose=1
    )

    all_histories[f'fold_{fold+1}'] = history.history

    # FIX #2: squeeze_excite_block is assembled purely from standard Keras layers
    # (GlobalAveragePooling2D, Reshape, Dense, Multiply). It is a Python builder
    # function, NOT a custom Keras object. Registering it in custom_objects with a
    # dummy lambda was wrong and would silently corrupt the loaded model.
    # Only r_squared (a true custom metric) needs to be listed here.
    best_model = keras.models.load_model(
        model_save_path,
        custom_objects={'r_squared': r_squared},
        compile=False
    )
    best_model.compile(loss='mse', metrics=['mae', r_squared])
    val_loss, val_mae, val_r2 = best_model.evaluate(val_gen, verbose=0)

    fold_metrics.append({
        'fold':         fold + 1,
        'val_loss_mse': float(val_loss),
        'val_mae':      float(val_mae),
        'val_r2':       float(val_r2)
    })

    print(f"\nFold {fold+1} Results -> Val MSE: {val_loss:.4f} | Val MAE: {val_mae:.4f} | Val R²: {val_r2:.4f}")


# =============================================================================
# Aggregate Cross-Validation Metrics
# =============================================================================
print("\n" + "=" * 60)
print("10-FOLD CROSS VALIDATION COMPLETE")
print("=" * 60)

avg_r2  = np.mean([m['val_r2']       for m in fold_metrics])
avg_mae = np.mean([m['val_mae']      for m in fold_metrics])
avg_mse = np.mean([m['val_loss_mse'] for m in fold_metrics])

print(f"\nAverage Cross-Validation Metrics across {NUM_FOLDS} Folds:")
print(f"  Mean R-Squared (R²): {avg_r2:.4f}")
print(f"  Mean Absolute Error (MAE): {avg_mae:.4f}")
print(f"  Mean Squared Error (MSE):  {avg_mse:.4f}")

if avg_r2 > 0.80:
    print("\n[SUCCESS] Model met target R² > 0.80 for decay parameter prediction.")
else:
    print("\n[WARNING] Model did not meet target R² > 0.80. Hyperparameter tuning may be required.")

eval_results = {
    'cross_validation_strategy': f'KFold {NUM_FOLDS}-Fold',
    'average_metrics': {
        'mean_r_squared': float(avg_r2),
        'mean_mae':       float(avg_mae),
        'mean_mse':       float(avg_mse)
    },
    'fold_details': fold_metrics
}

output_json = os.path.join(MODELS_DIR, 'cv_evaluation_secnn.json')
with open(output_json, 'w') as f:
    json.dump(eval_results, f, indent=2)

print(f"\nEvaluation results saved to: {output_json}")
