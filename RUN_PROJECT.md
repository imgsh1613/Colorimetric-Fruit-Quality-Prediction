# GAUTAM Project - Setup & Run Guide

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python 3.11 (based on .pyc files found)

---

## 📁 Project Structure

```
GAUTAM project/
├── backend/          # Backend Python files (currently missing source .py files)
├── frontend/         # React + Vite frontend
├── ml/              # Machine learning components
├── dataset/         # Dataset files
├── weights/         # Model weights
├── logs/            # Application logs
└── metadata.csv     # Metadata files
```

---

## ⚠️ Current Project Status

### Issues Detected:

1. **Frontend Source Missing**: The `frontend/src/` directory is empty, causing 404 errors
2. **Backend Source Missing**: Python source files are missing (only `.pyc` compiled files exist)
   - Found in `backend/__pycache__/`: `main.py`, `model.py`, `inference.py`, `preprocessing.py`, `decision_engine.py`
   - Found in `ml/__pycache__/`: `train.py`

### What Works:

- Frontend build system is configured (Vite + React)
- Dependencies are installed in `frontend/node_modules/`

---

## 🔧 Running the Project

### Option 1: Run Frontend Development Server

```powershell
# Navigate to frontend directory
cd "d:\Studies\projects\GAUTAM project\frontend"

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

The server will start at: **http://localhost:5173/**

---

### Option 2: Run Built Frontend (Preview Mode)

```powershell
# Navigate to frontend directory
cd "d:\Studies\projects\GAUTAM project\frontend"

# Build the project
npm run build

# Preview the build
npm run preview
```

---

### Option 3: Backend Server (When Source Files Available)

```powershell
# Navigate to project root
cd "d:\Studies\projects\GAUTAM project"

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies (create requirements.txt first)
pip install -r requirements.txt

# Run backend server
python backend/main.py
```

---

## 🛠️ Terminal Commands Cheat Sheet

### Frontend Commands

```powershell
# Start development server
cd "d:\Studies\projects\GAUTAM project\frontend"
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend Commands (When Available)

```powershell
# Run main backend server
cd "d:\Studies\projects\GAUTAM project"
python backend/main.py

# Run ML training
python ml/train.py
```

---

## 📝 Next Steps to Fix the Project

1. **Restore Frontend Source Files**:
   - The `frontend/src/` directory needs React components
   - Create `main.jsx` or `main.js` as entry point
   - Add components in `src/components/`

2. **Restore Backend Source Files**:
   - Recover or recreate Python source files:
     - `backend/main.py`
     - `backend/model.py`
     - `backend/inference.py`
     - `backend/preprocessing.py`
     - `backend/decision_engine.py`
     - `ml/train.py`

3. **Create Requirements File**:
   - Create `requirements.txt` with Python dependencies

---

## 🔍 Troubleshooting

### Frontend shows 404 error

- **Cause**: Source files missing in `frontend/src/`
- **Solution**: Restore React components and entry point files

### Backend won't start

- **Cause**: Python source files are missing
- **Solution**: Restore `.py` files from backup or version control

### Port already in use

```powershell
# Kill process on port 5173 (frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill process on port 8000 (backend, if applicable)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## 📦 Dependencies

### Frontend (from package.json)

- React 19.2.0
- Vite 7.3.1
- Tailwind CSS 4.1.18
- Axios 1.13.5
- Framer Motion 12.34.0
- React Dropzone 15.0.0
- Recharts 3.7.0

### Backend (To be determined)

- Create `requirements.txt` based on project needs

---

## 💡 Tips

- Always run frontend from the `frontend/` directory
- Use PowerShell or Command Prompt for Windows
- Check logs in `logs/` directory for debugging
- Ensure all dependencies are installed before running

---

## 📞 Support

If you encounter issues:

1. Check that all source files are present
2. Verify Node.js and Python versions
3. Ensure all dependencies are installed
4. Check the logs directory for error messages
