import os
import json
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers, backend as K
from PIL import Image
from skimage import color

# =============================================================================
# Squeeze-and-Excitation Block
# =============================================================================
def squeeze_excite_block(inputs, ratio=16):
    """
    Squeeze-and-Excitation (SE) block
    Recalibrates feature channels automatically to prioritize critical color shifts.
    """
    filters = inputs.shape[-1]
    # FIX #5: Clamp bottleneck to at least 1 to prevent zero-dimension Dense layer
    # if filters is ever smaller than ratio (e.g. filters=8, ratio=16 → 8//16 = 0 crash)
    bottleneck = max(1, filters // ratio)

    # Squeeze: Global Average Pooling
    se = layers.GlobalAveragePooling2D()(inputs)
    # Excitation: Two fully connected layers
    se = layers.Reshape((1, 1, filters))(se)
    se = layers.Dense(bottleneck, activation='relu', kernel_initializer='he_normal', use_bias=False)(se)
    se = layers.Dense(filters, activation='sigmoid', kernel_initializer='he_normal', use_bias=False)(se)
    # Recalibrate: Scale original inputs
    x = layers.Multiply()([inputs, se])
    return x

# =============================================================================
# Custom SE-CNN Model Generator
# =============================================================================
def build_secnn_regression_model(img_size=(224, 224), pretrained=False):
    """
    Builds a custom SE-CNN regression model.
    SE blocks are interspersed throughout convolutional layers to recalibrate
    channel responses — useful for picking up fruit colour/decay patterns.

    FIX #1: 'pretrained' parameter previously had no effect. It now raises a
    clear NotImplementedError if True, so callers aren't silently training from
    scratch when they expect pretrained weights.

    Outputs: [weight_loss, hardness, brittleness]
    """
    # FIX #1: Guard against silently ignoring pretrained=True
    if pretrained:
        raise NotImplementedError(
            "'pretrained=True' is not yet implemented for the custom SE-CNN. "
            "Either pass pretrained=False to train from scratch, or replace this "
            "backbone with a pretrained base (e.g. EfficientNetB0) and load weights."
        )

    inputs = keras.Input(shape=(*img_size, 3))

    # Block 1
    x = layers.Conv2D(32, (3, 3), padding='same', activation='relu', kernel_initializer='he_normal')(inputs)
    x = layers.BatchNormalization()(x)
    x = squeeze_excite_block(x, ratio=8)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)

    # Block 2
    x = layers.Conv2D(64, (3, 3), padding='same', activation='relu', kernel_initializer='he_normal')(x)
    x = layers.BatchNormalization()(x)
    x = squeeze_excite_block(x, ratio=16)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)

    # Block 3
    x = layers.Conv2D(128, (3, 3), padding='same', activation='relu', kernel_initializer='he_normal')(x)
    x = layers.BatchNormalization()(x)
    x = squeeze_excite_block(x, ratio=16)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)

    # Block 4
    x = layers.Conv2D(256, (3, 3), padding='same', activation='relu', kernel_initializer='he_normal')(x)
    x = layers.BatchNormalization()(x)
    x = squeeze_excite_block(x, ratio=16)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)

    # Regression Head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)

    x = layers.Dense(512, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.Dropout(0.2)(x)
    x = layers.Dense(64, activation='relu')(x)

    # Output: 3 continuous values (Weight Loss %, Hardness N, Brittleness)
    outputs = layers.Dense(3, activation='linear', name='regression_output')(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="Custom_SE_CNN_Regressor")
    return model, None


class FruitQualityRegressor:
    def __init__(self, model_path='./models/fruit_secnn_regressor.h5'):
        """Initialize the SE-CNN regressor with a trained model."""
        self.model_path = model_path
        self.img_size = (224, 224)

        if os.path.exists(model_path):
            # squeeze_excite_block is built from standard Keras layers, so it
            # does NOT need a custom_objects entry — passing it as a dummy lambda
            # would silently corrupt the loaded model (FIX #2 in train_model.py).
            self.model = keras.models.load_model(model_path, compile=False)
            print(f"SE-CNN Regression Model loaded from {model_path}")
        else:
            print(f"Warning: Model not found at {model_path}. Instantiating un-trained model architecture...")
            self.model, _ = build_secnn_regression_model(self.img_size)

    def preprocess_image(self, image_path):
        """
        Loads and preprocesses an image for inference.

        Returns [1, H, W, 3] float32 array (values in [0, 1]) plus an optional
        dict of mean L*a*b* and hue values for logging/debugging purposes.

        FIX #3: Removed stale MobileNet comment — this model has no MobileNet
        dependency; standard [0,1] normalisation is used throughout.
        """
        img = Image.open(image_path).convert('RGB')
        img = img.resize(self.img_size)
        img_array = np.array(img) / 255.0

        color_data = None
        # Colorimetric Analysis: logs mean L*, a*, b*, and hue angle for debugging
        try:
            lab_img = color.rgb2lab(img_array)
            L, a, b = lab_img[:, :, 0], lab_img[:, :, 1], lab_img[:, :, 2]
            hue = np.arctan2(b, a)  # hue angle in radians

            color_data = {
                'L': round(float(np.mean(L)), 2),
                'a': round(float(np.mean(a)), 2),
                'b': round(float(np.mean(b)), 2),
                'H': round(float(np.mean(np.degrees(hue))), 2)
            }
        except Exception as e:
            # FIX #4: Log the warning instead of silently swallowing it
            print(f"[Warning] Colorimetric analysis failed for '{image_path}': {e}")

        img_array = np.expand_dims(img_array, axis=0)
        return img_array, color_data

    def predict_quality(self, image_path):
        """Predict continuous quality parameters: Weight Loss, Hardness, Brittleness."""
        img_array, color_data = self.preprocess_image(image_path)

        predictions = self.model.predict(img_array, verbose=0)[0]

        weight_loss  = max(0.0, float(predictions[0]))
        hardness     = max(0.0, float(predictions[1]))
        brittleness  = max(0.0, float(predictions[2]))

        # Heuristic status derived from predicted physiological parameters
        status = "Fresh"
        is_decaying = False
        
        if weight_loss > 0.8 or hardness < 7.0:
            is_decaying = True
            
        # Add color anomaly heuristics to catch visual mould that doesn't drastically change weight
        if color_data:
            a, b = color_data.get('a', 0), color_data.get('b', 0)
            chroma = (a**2 + b**2)**0.5
            # Mouldy or severely decomposed fruit typically loses color saturation (turning grey/brown/black)
            # or loses overall brightness (low L).
            if chroma < 15.0 or color_data.get('L', 100) < 35.0:
                is_decaying = True

        if is_decaying:
            status = "Deteriorating/Rotten"

        result = {
            'predicted_weight_loss_percent': round(weight_loss, 3),
            'predicted_hardness_N':          round(hardness, 3),
            'predicted_brittleness':         round(brittleness, 3),
            'estimated_status':              status
        }

        if color_data:
            result['colorimetric_data'] = color_data

        return result


# Example usage
if __name__ == '__main__':
    regressor = FruitQualityRegressor()

    test_image = '../dataset/train/Fresh/fresh_train_00000.png'

    if os.path.exists(test_image):
        print(f"Running inference on: {test_image}")
        result = regressor.predict_quality(test_image)
        print("\nQuality Prediction Result (Regression):")
        print(json.dumps(result, indent=2))
    else:
        print(f"Test image not found at: {test_image}")
