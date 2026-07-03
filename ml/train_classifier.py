"""
FruitSense Classifier — Retraining Pipeline (v2)
=================================================
Trains a MobileNetV2 classifier on 5 CLASSES:
    Apple, Orange, Tomato          <- fresh fruit
    Apple_Rotten, Orange_Rotten    <- rotten/mouldy fruit

Uses flow_from_directory on the merged dataset at:
    dataset/merged/train/
    dataset/merged/val/

Two-phase training:
  Phase 1 — freeze base, train only the new head (warm-up)
  Phase 2 — unfreeze top 30 layers of MobileNetV2 (fine-tune)
"""
import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint


TARGET_CLASSES = ['Apple', 'Apple_Rotten', 'Banana', 'Banana_Rotten', 'Orange', 'Orange_Rotten']
IMG_SIZE = (224, 224)
BATCH_SIZE = 32


def train_classifier():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

    train_dir = os.path.join(project_root, 'dataset', 'merged', 'train')
    val_dir   = os.path.join(project_root, 'dataset', 'merged', 'val')

    if not os.path.isdir(train_dir):
        print(f"[ERROR] Training directory not found: {train_dir}")
        print("  Please run the following steps first:")
        print("  1. python ml/download_rotten_dataset.py")
        print("  2. python ml/merge_datasets.py")
        return

    # ------------------------------------------------------------------
    # MobileNetV2 expects input in [-1, 1] via preprocess_input.
    # We use that directly here instead of manual rescale=1/255
    # so activation statistics match the pretrained weights exactly.
    # ------------------------------------------------------------------
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.25,
        horizontal_flip=True,
        vertical_flip=False,         # fruits don't grow upside-down
        brightness_range=[0.7, 1.3],
        channel_shift_range=10.0,    # small, to preserve color cues for rotten detection
        fill_mode='reflect',
    )

    val_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
    )

    # Check how many classes exist in train dir
    available = sorted([
        d for d in os.listdir(train_dir)
        if os.path.isdir(os.path.join(train_dir, d))
    ])
    print(f"Available classes in merged dataset: {available}")

    # Count images per class for class_weight computation
    class_counts = {}
    for cls in available:
        cls_path = os.path.join(train_dir, cls)
        count = len([f for f in os.listdir(cls_path) if not f.startswith('.')])
        class_counts[cls] = count
        print(f"  {cls:20s}: {count} images")

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=available,   # enforce consistent ordering
        shuffle=True,
    )

    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=available,
        shuffle=False,
    )

    num_classes = len(available)
    print(f"\nClass indices: {train_generator.class_indices}")

    # ------------------------------------------------------------------
    # Compute class weights to handle imbalance between fresh/rotten
    # (Fruits-360 has thousands of fresh images; rotten dataset is smaller)
    # ------------------------------------------------------------------
    total_images = sum(class_counts.values())
    class_weight = {}
    for cls, count in class_counts.items():
        idx = train_generator.class_indices[cls]
        weight = total_images / (num_classes * count) if count > 0 else 1.0
        class_weight[idx] = round(weight, 3)
    print(f"Class weights: {class_weight}")

    # ------------------------------------------------------------------
    # Build model: MobileNetV2 base + custom head
    # ------------------------------------------------------------------
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(*IMG_SIZE, 3))
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    model_dir = os.path.join(project_root, 'ml', 'models')
    os.makedirs(model_dir, exist_ok=True)
    best_model_path = os.path.join(model_dir, 'fruit_classifier_best.h5')

    # ------------------------------------------------------------------
    # Phase 1: Train head only (frozen base)
    # ------------------------------------------------------------------
    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    callbacks_p1 = [
        EarlyStopping(patience=5, restore_best_weights=True, monitor='val_accuracy', verbose=1),
        ReduceLROnPlateau(factor=0.5, patience=2, min_lr=1e-6, verbose=1),
        ModelCheckpoint(best_model_path, save_best_only=True, monitor='val_accuracy', verbose=1),
    ]

    print("\n" + "="*60)
    print("Phase 1: Training head (frozen MobileNetV2 base)...")
    print("="*60)
    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=15,
        callbacks=callbacks_p1,
        class_weight=class_weight,
    )

    # ------------------------------------------------------------------
    # Phase 2: Fine-tune top layers of MobileNetV2
    # ------------------------------------------------------------------
    print("\n" + "="*60)
    print("Phase 2: Fine-tuning top 30 layers of MobileNetV2...")
    print("="*60)
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    trainable_count = sum(1 for l in model.layers if l.trainable)
    print(f"Trainable layers: {trainable_count}")

    model.compile(
        optimizer=Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    callbacks_p2 = [
        EarlyStopping(patience=7, restore_best_weights=True, monitor='val_accuracy', verbose=1),
        ReduceLROnPlateau(factor=0.5, patience=3, min_lr=1e-7, verbose=1),
        ModelCheckpoint(best_model_path, save_best_only=True, monitor='val_accuracy', verbose=1),
    ]

    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=20,
        callbacks=callbacks_p2,
        class_weight=class_weight,
    )

    # ------------------------------------------------------------------
    # Save final model + class indices
    # ------------------------------------------------------------------
    final_model_path = os.path.join(model_dir, 'fruit_classifier.h5')
    model.save(final_model_path)
    print(f"\nFinal model saved to: {final_model_path}")
    print(f"Best checkpoint saved to: {best_model_path}")

    # Save class index mapping (int -> class name)
    idx_to_class = {str(v): k for k, v in train_generator.class_indices.items()}
    indices_path = os.path.join(model_dir, 'class_indices.json')
    with open(indices_path, 'w') as f:
        json.dump(idx_to_class, f, indent=2)
    print(f"Class indices saved to: {indices_path}")
    print(f"\nFinal class mapping: {idx_to_class}")

    # Evaluate on validation set
    print("\nEvaluating on validation set...")
    val_loss, val_acc = model.evaluate(val_generator, verbose=1)
    print(f"\nValidation Accuracy: {val_acc:.4f} ({val_acc*100:.1f}%)")
    print("\nDone! The classifier now handles both fresh and rotten fruit.")


if __name__ == "__main__":
    train_classifier()
