"""Diagnostic script to test the fruit classifier on actual images."""
import json, numpy as np, os, glob
from PIL import Image
from tensorflow import keras

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Load classifier
model = keras.models.load_model(os.path.join(project_root, 'ml', 'models', 'fruit_classifier.h5'), compile=False)
with open(os.path.join(project_root, 'ml', 'models', 'class_indices.json')) as f:
    idx_to_label = {int(k): v for k, v in json.load(f).items()}

print("=" * 60)
print("CLASSIFIER DIAGNOSTIC")
print("=" * 60)
print(f"Class mapping: {idx_to_label}")
print(f"Model output shape: {model.output_shape}")
print()

# Test with multiple images from each class
for fruit in ['Apple', 'Orange', 'Banana']:
    # Try Test split first, then Training
    imgs = []
    for split in ['Test', 'Training', 'Validation']:
        for ext in ['*.jpg', '*.png', '*.jpeg']:
            pattern = os.path.join(project_root, 'dataset', 'fruits-360-original-size', split, f'{fruit}*', ext)
            imgs.extend(glob.glob(pattern))
        if imgs:
            break
    
    if not imgs:
        print(f"[{fruit}] No images found!")
        continue
    
    # Test 5 random images from different subdirectories 
    test_imgs = imgs[:5] if len(imgs) <= 5 else [imgs[i] for i in np.linspace(0, len(imgs)-1, 5, dtype=int)]
    
    print(f"\n--- {fruit} ({len(imgs)} total images available) ---")
    correct = 0
    for img_path in test_imgs:
        img = Image.open(img_path).convert('RGB').resize((224, 224))
        arr = np.expand_dims(np.array(img) / 255.0, axis=0)
        preds = model.predict(arr, verbose=0)[0]
        pred_idx = int(np.argmax(preds))
        pred_label = idx_to_label[pred_idx]
        conf = float(preds[pred_idx])
        is_correct = pred_label == fruit
        correct += int(is_correct)
        
        prob_str = " | ".join([f"{idx_to_label[i]}: {preds[i]:.4f}" for i in range(len(preds))])
        status = "✓" if is_correct else "✗ WRONG"
        parent_dir = os.path.basename(os.path.dirname(img_path))
        print(f"  {status} Predicted: {pred_label:8s} (conf={conf:.4f}) | {prob_str} | dir={parent_dir}")
    
    print(f"  Score: {correct}/5")

print("\n" + "=" * 60)
