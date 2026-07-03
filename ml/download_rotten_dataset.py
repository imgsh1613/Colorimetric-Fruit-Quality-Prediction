"""
Downloads the 'Fruits fresh and rotten for classification' dataset from Kaggle.
PREREQUISITE: You must have a ~/.kaggle/kaggle.json API key file.
  1. Go to https://www.kaggle.com/settings/account
  2. Click "Create New Token" -> downloads kaggle.json
  3. Run: mkdir -p ~/.kaggle && cp ~/Downloads/kaggle.json ~/.kaggle/ && chmod 600 ~/.kaggle/kaggle.json
"""
import os
import subprocess
import zipfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
DOWNLOAD_DIR = PROJECT_ROOT / 'dataset' / 'rotten-fruits-raw'
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

DATASET_SLUG = 'sriramr/fruits-fresh-and-rotten-for-classification'
ZIP_PATH = DOWNLOAD_DIR / 'fruits-fresh-and-rotten-for-classification.zip'

print(f"Downloading dataset '{DATASET_SLUG}' to {DOWNLOAD_DIR}...")
result = subprocess.run(
    ['kaggle', 'datasets', 'download', '-d', DATASET_SLUG, '-p', str(DOWNLOAD_DIR)],
    capture_output=True, text=True
)
if result.returncode != 0:
    print("ERROR downloading dataset:")
    print(result.stderr)
    raise SystemExit(1)
print("Download complete. Extracting...")

# Find the zip file
zip_files = list(DOWNLOAD_DIR.glob('*.zip'))
if not zip_files:
    raise FileNotFoundError("No zip file found after download!")

with zipfile.ZipFile(zip_files[0], 'r') as z:
    z.extractall(DOWNLOAD_DIR)

print(f"\nExtracted to: {DOWNLOAD_DIR}")
print("\nContents:")
for item in sorted(DOWNLOAD_DIR.iterdir()):
    print(f"  {item.name}")
print("\nDone! Now run: python ml/merge_datasets.py")
