# RoleSense AI — Frontend

## Quick Start

```bash
cd frontend
npm install
npm start
```

Open http://localhost:4200

## Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Deploy

### Frontend → Vercel
```bash
cd frontend
npm install -g vercel
vercel --prod
```

### Backend → Render
1. Create a new Web Service on Render
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`

## Architecture

```
frontend/ (Angular 20 + Material + TailwindCSS + ApexCharts)
  └── Pages: Landing, SignIn, SignUp, Dashboard, Search, Results, Analytics

backend/ (FastAPI + SQLite + JWT)
  └── Routes: /api/signup, /api/login, /api/rank-candidates, /api/locations, /api/analytics

engine/ (Existing AI ranking pipeline — unmodified)
  └── FAISS + sentence-transformers + hybrid scoring
```
