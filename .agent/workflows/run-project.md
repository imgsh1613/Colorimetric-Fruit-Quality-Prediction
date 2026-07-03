---
description: Run the GAUTAM project
---

# Running GAUTAM Project

## Frontend Only (Current Working Setup)

Since the source files are missing, use the preview mode with the built version:

### Step 1: Navigate to Frontend Directory

```powershell
cd "d:\Studies\projects\GAUTAM project\frontend"
```

### Step 2: Run Preview Server

```powershell
npm run preview
```

The application will be available at: **http://localhost:4173/**

---

## Alternative: Development Mode (Requires Source Files)

If source files are restored to `frontend/src/`:

### Step 1: Navigate to Frontend Directory

```powershell
cd "d:\Studies\projects\GAUTAM project\frontend"
```

### Step 2: Install Dependencies (if needed)

```powershell
npm install
```

### Step 3: Run Development Server

```powershell
npm run dev
```

The application will be available at: **http://localhost:5173/**

---

## Full Stack (When Backend is Available)

### Terminal 1: Backend Server

```powershell
cd "d:\Studies\projects\GAUTAM project"
python backend/main.py
```

### Terminal 2: Frontend Server

```powershell
cd "d:\Studies\projects\GAUTAM project\frontend"
npm run preview
```

---

## Quick Commands

**Stop any running server**: Press `Ctrl+C` in the terminal

**Check if port is in use**:

```powershell
netstat -ano | findstr :4173
netstat -ano | findstr :5173
```

**Kill process on specific port**:

```powershell
# Replace <PID> with the process ID from netstat
taskkill /PID <PID> /F
```
