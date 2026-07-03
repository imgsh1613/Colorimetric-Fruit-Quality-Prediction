"""
Merges the Kaggle 'Fruits fresh and rotten' dataset with the existing Fruits-360
dataset into a unified directory structure for training.

Target classes (for FruitSense):
    Apple, Apple_Rotten    <- from Fruits-360 + Kaggle
    Orange, Orange_Rotten  <- from Fruits-360 + Kaggle
    Banana, Banana_Rotten  <- from Fruits-360 + Kaggle
    Mango                  <- from Fruits-360 (fresh only)

Usage:
    python ml/merge_datasets.py
"""
import os
import shutil
import glob
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

# Source paths
FRUITS360_TRAIN = PROJECT_ROOT / 'dataset' / 'fruits-360-original-size' / 'Training'
FRUITS360_TEST  = PROJECT_ROOT / 'dataset' / 'fruits-360-original-size' / 'Test'
KAGGLE_DATA     = PROJECT_ROOT / 'dataset' / 'rotten-fruits-raw'

# Output path
MERGED_TRAIN = PROJECT_ROOT / 'dataset' / 'merged' / 'train'
MERGED_VAL   = PROJECT_ROOT / 'dataset' / 'merged' / 'val'

# Class mapping from Kaggle folder name -> our target class
KAGGLE_FRESH_MAP = {
    'freshapples':  'Apple',
    'freshoranges': 'Orange',
    'freshbanana':  'Banana',
}
KAGGLE_ROTTEN_MAP = {
    'rottenapples':  'Apple_Rotten',
    'rottenoranges': 'Orange_Rotten',
    'rottenbanana':  'Banana_Rotten',
}

# What to look for in Fruits-360 folder names (case-insensitive prefix match)
# Tomato intentionally excluded
FRUITS360_MAP = {
    'Apple':  'Apple',
    'Orange': 'Orange',
    'Banana': 'Banana',
    'Mango':  'Mango',
}

def copy_images(src_dir, dst_dir, max_count=None):
    """Copy all images from src_dir into dst_dir (flat copy, no subfolders)."""
    dst_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        for img_path in sorted(Path(src_dir).rglob(ext)):
            # Use a unique name to avoid collision when merging multiple src folders
            unique_name = f"{img_path.parent.name}_{img_path.name}"
            dst = dst_dir / unique_name
            if not dst.exists():
                shutil.copy2(img_path, dst)
                copied += 1
            if max_count and copied >= max_count:
                return copied
    return copied


def main():
    print("=" * 60)
    print("FruitSense Dataset Merger")
    print("=" * 60)

    # --- 1. Copy Fruits-360 Training data ---
    print("\n[1/2] Copying Fruits-360 Training data...")
    for src_dir in sorted(FRUITS360_TRAIN.iterdir()):
        if not src_dir.is_dir():
            continue
        name = src_dir.name
        # Match Apple*, Orange*, Tomato* (case-sensitive)
        matched_class = None
        for key, cls in FRUITS360_MAP.items():
            if name.lower().startswith(key.lower()):
                matched_class = cls
                break
        if matched_class is None:
            continue  # Skip non-target fruits

        dst = MERGED_TRAIN / matched_class
        n = copy_images(src_dir, dst)
        print(f"  {name:40s} -> {matched_class}  ({n} images)")

    # --- 2. Copy Kaggle rotten/fresh data ---
    print("\n[2/2] Copying Kaggle rotten fruit data...")

    # Auto-detect Kaggle subfolder structure
    # Some versions have: rotten-fruits-raw/dataset/train/{class}
    # Others have: rotten-fruits-raw/{class}
    candidate_roots = [
        KAGGLE_DATA,
        KAGGLE_DATA / 'dataset',
        KAGGLE_DATA / 'dataset' / 'train',
    ]

    all_maps = {**KAGGLE_FRESH_MAP, **KAGGLE_ROTTEN_MAP}
    found_any = False

    for kaggle_root in candidate_roots:
        if not kaggle_root.exists():
            continue
        subdirs = [d.name.lower() for d in kaggle_root.iterdir() if d.is_dir()]
        if any(k in subdirs for k in all_maps.keys()):
            # Found the right level
            for kaggle_cls, our_cls in all_maps.items():
                src = kaggle_root / kaggle_cls
                if not src.exists():
                    # try case-insensitive match
                    for d in kaggle_root.iterdir():
                        if d.is_dir() and d.name.lower() == kaggle_cls.lower():
                            src = d
                            break

                if src.exists():
                    dst = MERGED_TRAIN / our_cls
                    n = copy_images(src, dst)
                    print(f"  {kaggle_cls:40s} -> {our_cls}  ({n} images)")
                    found_any = True
                else:
                    print(f"  [SKIP] {kaggle_cls} not found in {kaggle_root}")
            break

    if not found_any:
        print("\n  [WARNING] Could not find Kaggle dataset folders!")
        print(f"  Searched in: {[str(r) for r in candidate_roots]}")
        print("  Make sure you ran: python ml/download_rotten_dataset.py first")

    # --- 3. Create validation split (10% of each class from Fruits-360 Test) ---
    print("\n[3/3] Creating validation set from Fruits-360 Test data...")
    for src_dir in sorted(FRUITS360_TEST.iterdir()):
        if not src_dir.is_dir():
            continue
        name = src_dir.name
        matched_class = None
        for key, cls in FRUITS360_MAP.items():
            if name.lower().startswith(key.lower()):
                matched_class = cls
                break
        if matched_class is None:
            continue

        dst = MERGED_VAL / matched_class
        n = copy_images(src_dir, dst)
        print(f"  {name:40s} -> {matched_class}  ({n} images)")

    # --- Summary ---
    print("\n" + "=" * 60)
    print("MERGED DATASET SUMMARY")
    print("=" * 60)
    total = 0
    for split_dir in [MERGED_TRAIN, MERGED_VAL]:
        split_name = split_dir.name.upper()
        if split_dir.exists():
            for cls_dir in sorted(split_dir.iterdir()):
                if cls_dir.is_dir():
                    count = len(list(cls_dir.glob('*')))
                    print(f"  [{split_name}] {cls_dir.name:20s}: {count:5d} images")
                    total += count
    print(f"\n  TOTAL: {total} images")
    print("\nDone! Now run: python ml/train_classifier.py")


if __name__ == '__main__':
    main()
