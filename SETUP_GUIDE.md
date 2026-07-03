# FruitSense Setup Guide

## Quick Start Guide

### Step 1: Train the ML Model

The model needs to be trained before the backend can analyze images.

```bash
# Navigate to ml directory
cd "D:\Studies\projects\GAUTAM project\ml"

# Install Python dependencies
pip install -r requirements.txt

# Train the model (takes 1-2 hours with GPU, 3-4 hours with CPU)
python train_model.py
```

**What this does:**

- Loads 18,000+ fruit images from the dataset
- Trains an EfficientNetB0 model with transfer learning
- Saves the trained model to `ml/models/fruit_classifier.h5`
- Generates training metrics and evaluation results

**Expected Output:**

```
Loading training data...
Classes found: ['FreshApple', 'FreshBanana', 'FreshMango', 'FreshOrange', 'FreshPotato', 'RottenApple', 'RottenBanana', 'RottenMango', 'RottenOrange', 'RottenPotato']
Number of classes: 10
Training samples: ~14,000
Validation samples: ~2,000
Test samples: ~2,000

Building model...
Starting training...
Epoch 1/50
...
Test accuracy: 0.92+
Model saved to: ./models/fruit_classifier.h5
```

### Step 2: Start the Backend Server

```bash
# Navigate to backend directory
cd "D:\Studies\projects\GAUTAM project\backend"

# Start FastAPI server
python main.py
```

**Expected Output:**

```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The backend API will be available at `http://localhost:8000`

### Step 3: Start the Frontend

```bash
# Navigate to frontend directory
cd "D:\Studies\projects\GAUTAM project\frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**

```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

The frontend will be available at `http://localhost:5173`

---

## Testing the Application

1. **Open the frontend** in your browser: `http://localhost:5173`

2. **Upload a fruit image** from the dataset:
   - Fresh Apple: `dataset/Visual_Dataset/Test/FreshApple/freshapple (1).jpg`
   - Rotten Banana: `dataset/Visual_Dataset/Test/RottenBanana/rottenbanana (1).jpg`

3. **Verify the analysis**:
   - Should show fruit type (Apple, Banana, Mango, Orange, Potato)
   - Should show quality status (Fresh or Rotten)
   - Should display quality metrics and recommendations

---

## Troubleshooting

### "Model not found" error

**Problem:** Backend returns 503 error saying model not found

**Solution:**

```bash
cd "D:\Studies\projects\GAUTAM project\ml"
python train_model.py
```

Wait for training to complete. The model file will be saved to `ml/models/fruit_classifier.h5`

### Frontend shows "API Connection Failed"

**Problem:** Frontend displays mock data with "API Connection Failed" message

**Solution:**

1. Check if backend is running: Open `http://localhost:8000` in browser
2. Should see: `{"status":"online","service":"FruitSense API","version":"1.0.0"}`
3. If not running, start backend: `python backend/main.py`

### CORS errors in browser console

**Problem:** Browser console shows CORS policy errors

**Solution:** Backend already has CORS enabled. Make sure:

- Backend is running on port 8000
- Frontend is accessing `http://localhost:8000` (not `127.0.0.1`)

### Training takes too long

**Problem:** Model training is very slow

**Solutions:**

- **Use GPU:** Install `tensorflow-gpu` if you have NVIDIA GPU
- **Reduce epochs:** Edit `ml/train_model.py`, change `EPOCHS = 50` to `EPOCHS = 20`
- **Smaller batch size:** Change `BATCH_SIZE = 32` to `BATCH_SIZE = 16` (if running out of memory)

### Low accuracy after training

**Problem:** Test accuracy is below 80%

**Solutions:**

- Train for more epochs (increase `EPOCHS` to 75-100)
- Check dataset integrity - ensure all images loaded correctly
- Try different learning rate in `train_model.py`

---

## Project Structure

```
GAUTAM project/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API service
│   │   └── App.jsx          # Main app
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── main.py              # API endpoints
│   └── .env                 # Configuration
│
├── ml/                       # Machine learning
│   ├── train_model.py       # Training script
│   ├── model.py             # Inference class
│   ├── requirements.txt     # Python dependencies
│   └── models/              # Saved models (created after training)
│       ├── fruit_classifier.h5
│       ├── class_indices.json
│       └── training_history.json
│
└── dataset/                  # Fruit quality dataset (18,038 files)
    ├── Visual_Dataset/
    │   ├── Train/           # ~14,000 images
    │   ├── Test/            # ~2,000 images
    │   └── Validation/      # ~2,000 images
    ├── Tactile_Dataset/
    └── dimensions/
```

---

## API Documentation

### POST /api/analyze

Upload an image for quality analysis.

**Request:**

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@path/to/fruit.jpg"
```

**Response:**

```json
{
  "fruit_type": "Apple",
  "quality_status": "Fresh",
  "confidence": 0.95,
  "overallScore": 95,
  "ripeness": 92,
  "freshness": 95,
  "defectCount": 0,
  "shelfLife": 7,
  "recommendations": [
    {
      "title": "Excellent Quality",
      "description": "Fruit is in excellent condition..."
    }
  ]
}
```

### GET /api/classes

Get available fruit classes.

**Response:**

```json
{
  "classes": [
    "FreshApple",
    "FreshMango",
    "FreshOrange",
    "FreshPotato",
    "FreshBanana",
    "RottenApple",
    "RottenMango",
    "RottenOrange",
    "RottenPotato",
    "RottenBanana"
  ],
  "num_classes": 10
}
```

---

## Next Steps

1. **Train the model** (most important - required for backend to work)
2. **Start backend server**
3. **Start frontend**
4. **Test with sample images**
5. **Deploy to production** (optional)

---

## Support

For issues or questions:

1. Check this guide first
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify all services are running on correct ports
