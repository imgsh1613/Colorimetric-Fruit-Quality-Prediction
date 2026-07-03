from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import sys
import shutil
from pathlib import Path
import uvicorn
import json
import numpy as np
from PIL import Image
from tensorflow import keras

# Add ml directory to path
sys.path.append(str(Path(__file__).parent.parent / 'ml'))

from model import FruitQualityRegressor

app = FastAPI(title="FruitSense API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize regressor (will be loaded when first request comes)
regressor = None
classifier = None
class_labels = {}

def get_classifier():
    """Lazy load classifier"""
    global classifier, class_labels
    if classifier is None:
        model_path = Path(__file__).parent.parent / 'ml' / 'models' / 'fruit_classifier.h5'
        if model_path.exists():
            classifier = keras.models.load_model(str(model_path), compile=False)
        else:
            print(f"Warning: Classifier not found at {model_path}")
            classifier = False # boolean False so we don't try reloading

        indices_path = Path(__file__).parent.parent / 'ml' / 'models' / 'class_indices.json'
        if indices_path.exists():
            with open(indices_path, 'r') as f:
                class_indices = json.load(f)
                # JSON keys are strings like "0", "1", "2" → convert to int keys
                # Values are class names like "Apple", "Orange", "Tomato"
                class_labels = {int(k): v for k, v in class_indices.items()}
    return classifier, class_labels

def get_regressor():
    """Lazy load regressor"""
    global regressor
    if regressor is None:
        model_path = Path(__file__).parent.parent / 'ml' / 'models' / 'fruit_secnn_regressor.h5'
        
        # Check if we have fold models but not the main one
        if not model_path.exists():
            fold_models = list((Path(__file__).parent.parent / 'ml' / 'models').glob('secnn_fold_*.h5'))
            if fold_models:
                model_path = fold_models[0] # Use first fold as fallback
        
        if not model_path.exists():
            print("Warning: Model not found. Proceeding with untrained fallback model for testing.")
            # raise HTTPException(
            #    status_code=503,
            #    detail="Model not found. Please train the model first by running: python ml/train_model.py"
            # )
        
        regressor = FruitQualityRegressor(
            model_path=str(model_path)
        )
    return regressor

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "FruitSense API",
        "version": "1.0.0"
    }

@app.post("/api/analyze")
async def analyze_fruit(file: UploadFile = File(...)):
    """
    Analyze uploaded fruit image
    
    Args:
        file: Image file (PNG, JPG, JPEG, WEBP)
    
    Returns:
        Quality analysis results
    """
    # Validate file type
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.webp'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file
    file_path = UPLOAD_DIR / file.filename
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Analyze image
    try:
        reg = get_regressor()
        result = reg.predict_quality(str(file_path))
        
        # Add frontend-compatible fields
        status = result['estimated_status']
        weight_loss = result['predicted_weight_loss_percent']
        hardness = result['predicted_hardness_N']

        # =====================================================================
        # PURE COLORIMETRIC QUALITY SCORE (no artificial caps or random values)
        # =====================================================================
        # All four factors come directly from CIE L*a*b* / L*C*h measurements.
        # The score reflects actual color science — not classifier confidence.
        #
        # Factor 1 — L* Lightness   (0-35 pts): Darkness from decay
        # Factor 2 — Chroma C*      (0-30 pts): Loss of color saturation
        # Factor 3 — b* Vibrancy    (0-25 pts): yellow/orange glow, lost when brown
        # Factor 4 — Hue Angle H°   (0-10 pts): Penalty for hue drifting into
        #            the brown-decay zone (H≈40-65°) at low saturation
        #
        # This means:
        #  - Partially rotten fruit (70% red, 30% brown) → avg colorimetrics
        #    still biased red → score naturally ~40-58 (honest reflection)
        #  - Fully rotten brown fruit → all channels degraded → ~10-30
        #  - Vibrant fresh fruit → all channels strong → ~65-90

        color_data = result.get('colorimetric_data', {})
        H = 0.0  # declare H early for use later
        if color_data:
            L      = color_data.get('L', 50.0)
            a      = color_data.get('a', 0.0)
            b      = color_data.get('b', 0.0)
            H      = color_data.get('H', 0.0)
            chroma = (a ** 2 + b ** 2) ** 0.5

            # Factor 1: L* Lightness (0-35 pts)
            # L*=0 (black/dead) → 0 pts | L*=100 (bright) → 35 pts
            L_score = (L / 100.0) * 35.0

            # Factor 2: Chroma / Color Saturation (0-30 pts)
            # C*=0 (grey/dull/brown) → 0 pts | C*≥60 (vibrant) → 30 pts
            chroma_score = min(30.0, (chroma / 60.0) * 30.0)

            # Factor 3: b* Yellow-Orange Vibrancy (0-25 pts)
            # Fresh fruit always has positive b* (healthy pigments emit yellow/orange)
            # Brown decay kills b* → near 0 or negative.
            # Reference: b*=30 → fully vibrant, b*=0 → dead
            b_score = min(25.0, max(0.0, (b / 30.0) * 25.0))

            # Factor 4: Hue Angle Decay Penalty (0 to -10 pts)
            # Brown-decay zone: H° ≈ 40–65° at low Chroma
            # Fresh red/green fruit: H° < 30° or H° > 90° → no penalty
            # This penalty ONLY fires when BOTH hue is brown AND chroma is weak.
            # That way a vibrant orange (H≈48, C*≈45) is NOT falsely penalised.
            hue_in_brown_zone = max(0.0, 1.0 - abs(H - 52.0) / 25.0)  # peaks at H=52°
            chroma_weakness   = max(0.0, 1.0 - chroma / 30.0)          # 1.0=grey, 0=saturated
            hue_decay_penalty = hue_in_brown_zone * chroma_weakness * 10.0

            freshness_score = max(0.0, min(100.0,
                L_score + chroma_score + b_score - hue_decay_penalty
            ))

            # Decay level is the direct inverse of freshness
            decay_level_pct       = 100.0 - freshness_score
            colorimetric_weight_loss = round(decay_level_pct / 100.0, 3)

            print(f"[SCORE]  L*={L:.1f}, a*={a:.1f}, b*={b:.1f}, C*={chroma:.1f}, H°={H:.1f}")
            print(f"[SCORE]  L_score={L_score:.1f}, chroma_score={chroma_score:.1f}, "
                  f"b_score={b_score:.1f}, hue_penalty=-{hue_decay_penalty:.1f}")
            print(f"[SCORE]  freshness_score={freshness_score:.1f}, decay={decay_level_pct:.1f}%")
        else:
            # Fallback: use regressor values only when no colorimetric data
            freshness_score          = max(0.0, min(100.0, (1 - weight_loss) * 50 + (hardness / 10.0) * 50))
            colorimetric_weight_loss = weight_loss
            decay_level_pct          = 100.0 - freshness_score
            print(f"[SCORE] No colorimetric data — using regressor fallback: {freshness_score:.1f}")

        
        # Classify fruit (supports 6-class model: Apple, Apple_Rotten, Banana, Banana_Rotten, Orange, Orange_Rotten)
        fruit_type = "Unknown"
        confidence = 0.0
        classifier_says_rotten = False
        cls_model, cls_labels = get_classifier()
        if cls_model:
            try:
                # Use MobileNetV2 preprocess_input for new model [-1, 1] range
                # Fall back to /255 for old model if needed
                from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
                img_pil = Image.open(str(file_path)).convert('RGB').resize((224, 224))
                img_array_raw = np.array(img_pil, dtype=np.float32)
                img_array = np.expand_dims(mobilenet_preprocess(img_array_raw.copy()), axis=0)
                preds = cls_model.predict(img_array, verbose=0)[0]
                class_idx = int(np.argmax(preds))
                confidence = float(preds[class_idx])
                pred_label = cls_labels.get(class_idx, "Unknown")

                # Debug logging
                print(f"[DEBUG] cls_labels mapping: {cls_labels}")
                print(f"[DEBUG] Raw predictions: {dict(zip(cls_labels.values(), [round(float(p), 4) for p in preds]))}")
                print(f"[DEBUG] Predicted index: {class_idx}, label: {pred_label}, confidence: {confidence:.4f}")

                # Parse label — new format: "Apple", "Apple_Rotten", "Banana", "Banana_Rotten", "Orange", "Orange_Rotten"
                #               legacy format: "FreshApple", "RottenApple"
                if pred_label.endswith("_Rotten"):
                    fruit_type = pred_label.replace("_Rotten", "")
                    classifier_says_rotten = True
                elif pred_label.startswith("Rotten"):
                    fruit_type = pred_label[6:]
                    classifier_says_rotten = True
                elif pred_label.startswith("Fresh"):
                    fruit_type = pred_label[5:]
                else:
                    fruit_type = pred_label  # e.g. "Apple", "Orange", "Banana"

                print(f"[DEBUG] Final fruit_type: {fruit_type}, classifier_says_rotten: {classifier_says_rotten}")
            except Exception as e:
                print(f"Classification failed: {e}")
                import traceback
                traceback.print_exc()

        # =====================================================================
        # STATUS DETERMINATION  (classifier signal only — no score manipulation)
        # =====================================================================
        # The classifier determines the LABEL (Fresh / Rotten).
        # The SCORE stays exactly what the colorimetrics computed.
        #
        # Edibility logic (matches user requirement: score >= 40 → can be eaten)
        #   score >= 60             → Fresh   (no concern)
        #   40 ≤ score < 60        → Rotten but edible with caution
        #   score < 40             → Rotten, not edible / discard

        is_rotten_by_regressor = "Fresh" not in status
        is_fresh_bool = not (is_rotten_by_regressor or classifier_says_rotten)

        # Set status label — does NOT change freshness_score
        if not is_fresh_bool:
            status = "Deteriorating/Rotten"
        # else: status stays as set by the regressor ("Fresh ...")

        print(f"[STATUS] is_fresh={is_fresh_bool}, score={freshness_score:.1f}, "
              f"classifier_rotten={classifier_says_rotten}, confidence={confidence:.2f}")


        recommendations = [
            {"title": "Optimal Validation", "description": f"AI confirms this {fruit_type.lower()} is in good condition."},
            {"title": "Storage Temperature", "description": f"Store {fruit_type.lower()} in recommended conditions."},
            {"title": "Handling", "description": "Handle with care to prevent bruising and surface damage."},
            {"title": "Consumption Window", "description": "Best consumed within 3-5 days for peak quality."}
        ] if is_fresh_bool else [
            {"title": "Urgent Warning", "description": f"AI detected significant deterioration in this {fruit_type.lower()}."},
            {"title": "Quality Alert", "description": f"{fruit_type} shows signs of severe deterioration. Inspect carefully."},
            {"title": "Immediate Action", "description": "Use immediately or discard if heavily deteriorated."},
            {"title": "Separation", "description": "Keep separate from fresh produce to prevent cross-contamination."}
        ]

        # Shelf life and edibility based on actual score
        #   score >= 60  → fresh, 5 days
        #   40 ≤ score < 60  → marginal, 1 day (consume soon)
        #   score < 40  → discard, 0 days
        shelf_life = 5 if freshness_score >= 60 else (1 if freshness_score >= 40 else 0)

        frontend_result = {
            **result,
            "predicted_weight_loss_percent": colorimetric_weight_loss,
            "quality_status": "Fresh" if is_fresh_bool else "Rotten",
            "fruit_type": fruit_type,
            "confidence": round(confidence, 2),
            "freshness": round(freshness_score, 1),
            "ripeness": round(max(0.0, min(100.0, 100.0 - colorimetric_weight_loss * 100.0)), 1),
            "overallScore": round(freshness_score, 1),
            "defectCount": 0 if is_fresh_bool else 3,
            "shelfLife": shelf_life,
            "recommendations": recommendations,
        }
        
        # Clean up uploaded file
        file_path.unlink()
        
        return JSONResponse(content=frontend_result)
    
    except Exception as e:
        # Clean up on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/classes")
async def get_classes():
    """Get available fruit classes"""
    return {
        "classes": ["Apple", "Orange", "Banana"],
        "num_classes": 3
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
