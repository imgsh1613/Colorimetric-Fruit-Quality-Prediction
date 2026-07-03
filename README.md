# 🍎 GAUTAM FruitSense — AI-Powered Post-Harvest Fruit Quality Intelligence

<div align="center">

**A deep learning system for real-time fruit quality assessment, combining computer vision with tactile sensor data to classify fresh vs. rotten produce and provide actionable insights for storage, consumption, and supply chain management.**

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?logo=tensorflow&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![Accuracy](https://img.shields.io/badge/Test_Accuracy-98.03%25-brightgreen)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [System Architecture](#-system-architecture)
- [Model & Algorithms](#-model--algorithms)
- [Dataset Details](#-dataset-details)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Real-World Implementation](#-real-world-implementation)
- [Results & Performance](#-results--performance)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)

---

## 🔴 Problem Statement

**Post-harvest food loss** is one of the world's most critical challenges:

- **~1.3 billion tonnes** of food is wasted annually worldwide (FAO)
- **40-50%** of fruits and vegetables in developing countries are lost post-harvest
- Manual quality inspection is **subjective, slow, and inconsistent**
- There is no accessible, low-cost system for farmers, retailers, or consumers to **instantly assess fruit quality** and receive actionable preservation advice

**Key Challenges:**

1. Lack of objective, real-time quality grading for fresh produce
2. No automated way to estimate remaining shelf life
3. Limited access to comprehensive storage guidance tailored to specific fruits
4. Inability to detect early-stage deterioration that's invisible to the naked eye

---

## ✅ Solution Overview

**GAUTAM FruitSense** is an end-to-end AI system that:

1. **Classifies** fruit images into 10 categories (5 fruits × Fresh/Rotten)
2. **Scores** quality from 0-100 using a smart blended probability system
3. **Estimates** shelf life, freshness, ripeness, and defect count
4. **Provides** chef-level storage guides (fridge, freezer, room temperature durations)
5. **Generates** comprehensive PDF reports for supply chain documentation
6. **Offers** an AI chatbot for real-time Q&A about fruit quality

### How It Works

```
📸 Upload Image → 🧠 MobileNetV2 Classification → 📊 Smart Quality Scoring
                                                         ↓
  📄 PDF Report ← 👨‍🍳 Chef's Guide ← 🧊 Storage Guide ← 📈 Analysis Results
```

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────┐  ┌──────────────┐  ┌─────────┐  ┌─────────────┐  │
│  │ UploadZone│  │ ResultsPanel │  │ Chatbot │  │ PDF Export  │  │
│  └─────┬────┘  └──────┬───────┘  └────┬────┘  └──────┬──────┘  │
│        │              │               │               │         │
│  ──────┴──────────────┴───────────────┴───────────────┴─────    │
│                    REST API (localhost:5173)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP POST /api/analyze
┌────────────────────────┴────────────────────────────────────────┐
│                     BACKEND (FastAPI + Uvicorn)                  │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Image     │  │ Model        │  │ Quality Analysis Engine  │  │
│  │ Validation│→ │ Inference    │→ │ Score + Metrics + Recs   │  │
│  └───────────┘  └──────┬───────┘  └──────────────────────────┘  │
│                        │                (localhost:8000)         │
└────────────────────────┴────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    ML ENGINE (TensorFlow/Keras)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MobileNetV2 (ImageNet) + Custom Classification Head     │   │
│  │  ┌─────────────┐  ┌──────────┐  ┌────────┐  ┌────────┐  │   │
│  │  │ GlobalAvgPool│→│Dense(512)│→│Dense(256)│→│Dense(10)│  │   │
│  │  │  + BatchNorm │  │+Dropout  │  │+Dropout │  │Softmax │  │   │
│  │  └─────────────┘  └──────────┘  └────────┘  └────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Model: fruit_classifier.h5  |  98.03% Test Accuracy            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Model & Algorithms

### Base Architecture: MobileNetV2

| Property              | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| **Base Model**        | MobileNetV2 (pre-trained on ImageNet, 1.4M images)              |
| **Transfer Learning** | Inverted residual blocks with linear bottlenecks                |
| **Key Innovation**    | Depthwise separable convolutions (3.4M params vs 138M in VGG16) |
| **Input Shape**       | 224 × 224 × 3 (RGB)                                             |
| **Output**            | 10 classes (softmax)                                            |

### Custom Classification Head

```
GlobalAveragePooling2D
    ↓
BatchNormalization
    ↓
Dense(512, ReLU) + L2 Regularization + Dropout(0.5)
    ↓
Dense(256, ReLU) + L2 Regularization + Dropout(0.4)
    ↓
Dense(128, ReLU) + Dropout(0.3)
    ↓
Dense(10, Softmax) → Output probabilities
```

### Training Strategy: 3-Phase Progressive Fine-Tuning

| Phase       | Strategy                      | Epochs | Learning Rate | Layers Unfrozen   |
| ----------- | ----------------------------- | ------ | ------------- | ----------------- |
| **Phase 1** | Train head only (base frozen) | 15     | 0.001         | Head only         |
| **Phase 2** | Fine-tune top 50 layers       | 20     | 0.0001        | 50 layers + head  |
| **Phase 3** | Full fine-tune (all layers)   | 15     | 0.00002       | All (~155 layers) |

### Data Augmentation Pipeline

| Augmentation       | Value    | Purpose                      |
| ------------------ | -------- | ---------------------------- |
| Rotation           | ±40°     | Orientation invariance       |
| Width/Height Shift | ±30%     | Position invariance          |
| Shear              | 20%      | Perspective distortion       |
| Zoom               | ±30%     | Scale invariance             |
| Horizontal Flip    | Yes      | Mirror invariance            |
| Brightness         | 0.7–1.3× | Lighting invariance          |
| Channel Shift      | ±30      | Color temperature invariance |

### Smart Quality Scoring Algorithm

Unlike binary classification, our system uses **all class probabilities** to compute a blended score:

```python
# Get fresh and rotten probabilities for the identified fruit
fresh_prob = predictions["FreshBanana"]   # e.g., 0.15
rotten_prob = predictions["RottenBanana"] # e.g., 0.85

# Compute freshness ratio
freshness_ratio = fresh_prob / (fresh_prob + rotten_prob)  # 0.15

# Blended score (never 0, never 100)
if is_fresh:
    score = 60 + freshness_ratio * 38  # → 60-98
else:
    score = 15 + (1-confidence)*30 + freshness_ratio*15  # → 10-45
```

This means:

- A **100% fresh** apple scores **~95** ("Excellent")
- A **half-rotten** banana scores **~30-40** ("Moderate Decay")
- A **fully rotten** mango scores **~15** ("Severely Deteriorated")

### Callbacks & Optimization

- **ModelCheckpoint**: Saves best model by validation accuracy
- **EarlyStopping**: Halts training if no improvement for 5-8 epochs
- **ReduceLROnPlateau**: Reduces learning rate by 50% when loss plateaus

---

## 📊 Dataset Details

### Visual Dataset (Image Classification)

| Split          | Purpose                          | Images      |
| -------------- | -------------------------------- | ----------- |
| **Train**      | Model training with augmentation | ~12,600     |
| **Validation** | Hyperparameter tuning            | ~3,600      |
| **Test**       | Final evaluation (unseen data)   | ~1,800      |
| **Total**      |                                  | **~18,000** |

### Class Distribution

| Class        | Category  | Source |
| ------------ | --------- | ------ |
| FreshApple   | 🍎 Fresh  | Visual |
| RottenApple  | 🍎 Rotten | Visual |
| FreshMango   | 🥭 Fresh  | Visual |
| RottenMango  | 🥭 Rotten | Visual |
| FreshOrange  | 🍊 Fresh  | Visual |
| RottenOrange | 🍊 Rotten | Visual |
| FreshPotato  | 🥔 Fresh  | Visual |
| RottenPotato | 🥔 Rotten | Visual |
| FreshBanana  | 🍌 Fresh  | Visual |
| RottenBanana | 🍌 Rotten | Visual |

### Tactile / Compression Dataset

| Property              | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| Total Sensor Readings | ~5,987 files                                                  |
| Categories            | Fresh vs. Rotten                                              |
| Data Types            | Force-displacement curves, compression force (kN)             |
| Purpose               | Mechanical property analysis (fresh fruits resist more force) |

### Additional Data Files

- `fresh_dimensions.ods` — Physical measurement data (size, weight) for fresh samples
- `rotten_dimensions.ods` — Physical measurement data for rotten samples

---

## ✨ Features

### 🖼️ Upload-Centric Analysis

Upload any fruit image → get instant AI-powered quality assessment. No static data — everything is driven by YOUR uploaded image.

### 📊 Smart Quality Scoring

Quality score (0-100) based on all class probabilities, not just binary classification. Half-rotten fruit gets a realistic score (~40) instead of zero.

### 🧊 Dynamic Fridge Guide

**Fresh fruit**: Shows how many days to keep whole in fridge, cut, at room temp, or in freezer.
**Rotten fruit**: Shows "DISCARD IMMEDIATELY" warning with spoilage indicators.

### 👨‍🍳 Chef's Corner

Recipes, cheese/spice pairings, flavor profiles, varieties, and culinary uses — all specific to the detected fruit.

### 📄 A-to-Z PDF Report

10-section professional report: quality metrics, storage guide, nutrition, culinary guide, quality indicators, buying guide, compression data, AI model info, fun facts, and recommendations.

### 🤖 AI Chatbot

Interactive chatbot answering questions about fruit storage, nutrition, recipes, and model details.

### 📈 Visual Analytics

- Radar chart for multi-dimensional quality assessment
- Line chart for predicted quality trajectory
- Bar chart for defect analysis

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.9+** (for backend and ML)

### 1. Train the ML Model

```bash
cd ml
pip install tensorflow pillow opencv-python numpy
python train_model.py
# Training takes ~45-60 minutes (50 epochs, 3 phases)
```

### 2. Start the Backend Server

```bash
cd backend
pip install fastapi uvicorn python-multipart
python main.py
# Server starts at http://localhost:8000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# Server starts at http://localhost:5173
```

### 4. Open in Browser

Navigate to `http://localhost:5173`, upload a fruit image, and see the AI analysis!

---

## 📡 API Reference

### `POST /api/analyze`

Upload an image for quality analysis.

**Request**: `multipart/form-data` with `file` field (PNG, JPG, JPEG, WEBP)

**Response**:

```json
{
  "fruit_type": "Banana",
  "quality_status": "Fresh",
  "confidence": 0.97,
  "overallScore": 95,
  "ripeness": 92,
  "freshness": 93,
  "defectCount": 0,
  "shelfLife": 7,
  "recommendations": [
    {
      "title": "Excellent Quality",
      "description": "This banana is in excellent condition."
    }
  ]
}
```

### `GET /api/classes`

Returns available fruit classes and count.

### `GET /`

Health check — returns `{"status": "online"}`.

---

## 🌍 Real-World Implementation

### Phase 1: Supermarket Quality Stations

Deploy touchscreen kiosks at produce sections. Customers scan fruit → get quality score, shelf life estimate, and storage tips printed on a receipt.

### Phase 2: Supply Chain Integration

Install cameras on sorting conveyor belts at packaging facilities. Automatically grade fruit into A/B/C quality tiers for pricing and routing.

### Phase 3: Mobile App for Farmers

Lightweight mobile app for farmers to photograph harvested produce in the field. Get instant grading + recommended market timing.

### Phase 4: IoT + Cold Chain

Integrate with IoT temperature sensors in refrigerated trucks. Combine visual quality + temperature data for predictive spoilage alerts.

### Scalability

| Metric           | Current     | Production Target     |
| ---------------- | ----------- | --------------------- |
| Fruits Supported | 5 types     | 50+ types             |
| Inference Time   | ~500ms      | <100ms (GPU)          |
| Throughput       | 1 image/sec | 50 images/sec (batch) |
| Deployment       | Local dev   | Docker + Kubernetes   |

---

## 📈 Results & Performance

| Metric                       | Value              |
| ---------------------------- | ------------------ |
| **Test Accuracy**            | 98.03%             |
| **Best Validation Accuracy** | 98.49%             |
| **Test Loss**                | 0.079              |
| **Epochs Trained**           | 28 (early stopped) |
| **Model Size**               | ~15 MB             |
| **Inference Time**           | ~500ms (CPU)       |

---

## 🛠 Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| **Frontend** | React 19, Vite, Recharts, Lucide Icons, jsPDF |
| **Backend**  | FastAPI, Uvicorn, Python 3.11                 |
| **ML/DL**    | TensorFlow 2.x, Keras, MobileNetV2            |
| **Data**     | NumPy, Pillow, OpenCV                         |
| **Styling**  | Vanilla CSS with glassmorphism + dark theme   |

---

## 📂 Project Structure

```
GAUTAM project/
├── frontend/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Hero.jsx         # Landing page hero section
│   │   │   ├── UploadZone.jsx   # Drag-and-drop image upload
│   │   │   ├── ResultsPanel.jsx # Freshness-aware analysis results
│   │   │   ├── Chatbot.jsx      # AI chatbot interface
│   │   │   └── HowItWorks.jsx   # Process explanation
│   │   ├── data/
│   │   │   └── fruitKnowledge.js # Comprehensive fruit database
│   │   ├── utils/
│   │   │   └── pdfReportGenerator.js # PDF report generation
│   │   ├── services/
│   │   │   └── api.js           # Backend API client
│   │   ├── App.jsx              # Main application (upload-centric)
│   │   └── index.css            # Dark theme + glassmorphism styles
│   └── package.json
│
├── backend/                     # FastAPI backend
│   └── main.py                  # API server with model integration
│
├── ml/                          # Machine learning
│   ├── model.py                 # FruitClassifier with smart scoring
│   ├── train_model.py           # 3-phase progressive training script
│   └── models/                  # Trained model artifacts
│       ├── fruit_classifier.h5  # Trained Keras model
│       ├── class_indices.json   # Class label mapping
│       ├── training_history.json
│       └── evaluation_results.json
│
├── dataset/                     # Multi-modal dataset
│   ├── Visual_Dataset/          # 18,000+ fruit images
│   │   ├── Train/               # Training images (10 classes)
│   │   ├── Validation/          # Validation images
│   │   └── Test/                # Test images
│   ├── Tactile_Dataset/         # ~5,987 sensor files
│   ├── Raw_data_compression/    # Raw compression test data
│   ├── fresh_dimensions.ods     # Fresh fruit measurements
│   └── rotten_dimensions.ods    # Rotten fruit measurements
│
└── README.md                    # This file
```

---


<div align="center">

**Built with ❤️ using TensorFlow, React, and FastAPI**

_Reducing post-harvest food waste, one fruit at a time._

</div>
