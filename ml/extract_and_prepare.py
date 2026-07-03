"""
Extracts the manually downloaded Kaggle dataset zip and then
merges + kicks off training — no API key needed.

STEPS:
  1. Go to: https://www.kaggle.com/datasets/sriramr/fruits-fresh-and-rotten-for-classification
  2. Log in and click 'Download' — saves archive.zip to ~/Downloads/
  3. Run this script:
       python ml/extract_and_prepare.py
"""
import zipfile
import shutil
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
DOWNLOAD_DIR = PROJECT_ROOT / 'dataset' / 'rotten-fruits-raw'
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Common locations where the browser might have saved the zip
CANDIDATE_ZIPS = [
    Path.home() / 'Downloads' / 'archive.zip',
    Path.home() / 'Downloads' / 'fruits-fresh-and-rotten-for-classification.zip',
    PROJECT_ROOT / 'dataset' / 'rotten-fruits-raw' / 'archive.zip',
]

zip_path = None
for candidate in CANDIDATE_ZIPS:
    if candidate.exists():
        zip_path = candidate
        break

if zip_path is None:
    print("❌  Could not find the downloaded zip file.")
    print("\nPlease download it from:")
    print("  https://www.kaggle.com/datasets/sriramr/fruits-fresh-and-rotten-for-classification")
    print("\nThen place it at one of these locations:")
    for c in CANDIDATE_ZIPS:
        print(f"  {c}")
    raise SystemExit(1)

print(f"✅  Found zip: {zip_path}")
print(f"   Extracting to: {DOWNLOAD_DIR} ...")

with zipfile.ZipFile(zip_path, 'r') as z:
    z.extractall(DOWNLOAD_DIR)

print("\n   Contents after extraction:")
for item in sorted(DOWNLOAD_DIR.iterdir()):
    if item.is_dir():
        sub_count = len(list(item.iterdir()))
        print(f"    📁 {item.name}/  ({sub_count} items)")
    else:
        print(f"    📄 {item.name}")

print("\n✅  Extraction complete!")
print("\nNext step — run:")
print("  python ml/merge_datasets.py")
print("  python ml/train_classifier.py")
