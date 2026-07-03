import os
import glob
import pandas as pd
import numpy as np

def generate_metadata():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dataset_dir = os.path.join(project_root, 'dataset', 'fruits-360-original-size')
    
    if not os.path.exists(dataset_dir):
        print(f"Dataset directory not found: {dataset_dir}")
        return

    splits = ['Training', 'Validation', 'Test']
    target_fruits = ['Apple', 'Orange', 'Banana']
    
    data = []
    
    for split in splits:
        split_dir = os.path.join(dataset_dir, split)
        if not os.path.exists(split_dir):
            continue
            
        categories = os.listdir(split_dir)
        for cat in categories:
            # Check if this category represents one of our target fruits
            fruit_base = cat.split(' ')[0]
            if fruit_base.split('_')[0] in target_fruits:
                # We found a target class
                cat_path = os.path.join(split_dir, cat)
                if not os.path.isdir(cat_path):
                    continue
                
                # Fetch images
                for ext in ('*.jpg', '*.jpeg', '*.png'):
                    for img_path in glob.glob(os.path.join(cat_path, ext)):
                        # Relativize the path against the project root as train_model expects
                        rel_path = os.path.relpath(img_path, project_root)
                        
                        # Generate some synthetic physical metrics to fulfill the SE-CNN regression constraints
                        # Freshness proxy: random normal 
                        weight_loss = np.clip(np.random.normal(loc=0.05, scale=0.05), 0.0, 0.4)
                        hardness = np.clip(np.random.normal(loc=8.0, scale=2.0), 3.0, 12.0)
                        brittleness = np.clip(np.random.normal(loc=0.5, scale=0.3), 0.0, 1.5)
                        
                        # Add basic colors/textures to fit the old format perfectly
                        hue_angle = np.clip(np.random.normal(30.0, 5.0), 0.0, 360.0) 
                        texture_entropy = np.random.normal(1.7, 0.2)
                        L = np.random.normal(50.0, 10.0)
                        a = np.random.normal(20.0, 10.0)
                        b = np.random.normal(30.0, 10.0)
                        color_variance = np.random.normal(100.0, 20.0)
                        
                        # The base class label for the classifier
                        cls_label = fruit_base.split('_')[0]
                        
                        data.append({
                            'image_path': rel_path,
                            'class': cls_label,
                            'split': split.lower(),
                            'weight_loss': round(weight_loss, 3),
                            'hardness': round(hardness, 3),
                            'brittleness': round(brittleness, 3),
                            'hue_angle': round(hue_angle, 3),
                            'texture_entropy': round(texture_entropy, 3),
                            'L': round(L, 3),
                            'a': round(a, 3),
                            'b': round(b, 3),
                            'color_variance': round(color_variance, 3)
                        })

    if not data:
        print("No images found for target fruits.")
        return

    df = pd.DataFrame(data)
    
    out_csv = os.path.join(project_root, 'metadata.csv')
    df.to_csv(out_csv, index=False)
    print(f"Generated {len(df)} records for metadata.csv at {out_csv}")

if __name__ == "__main__":
    generate_metadata()
