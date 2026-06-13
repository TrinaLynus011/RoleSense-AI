<p align="center">
  <br/>
  <img src="assets/banner.png" alt="RoleSense AI" width="600" onerror="this.style.display='none'"/>
  <br/>
</p>

<h1 align="center">🎯 RoleSense AI</h1>

<p align="center">
  <b>Enterprise-grade AI recruiter platform. Rank candidates the way a great recruiter would.</b>
</p>

<p align="center">
  <a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-21+-DD0031?style=flat&logo=angular&logoColor=white" alt="Angular"/></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white" alt="Python"/></a>
  <a href="https://www.sbert.net"><img src="https://img.shields.io/badge/Transformers-all--MiniLM--L6--v2-FFD21E?style=flat&logo=huggingface&logoColor=black" alt="Sentence Transformers"/></a>
  <a href="https://faiss.ai"><img src="https://img.shields.io/badge/FAISS-1.7+-0099FF?style=flat&logo=meta&logoColor=white" alt="FAISS"/></a>
  <a href="https://apexcharts.com"><img src="https://img.shields.io/badge/ApexCharts-5.0+-FFB800?style=flat" alt="ApexCharts"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Dataset-740_Profiles-20BEFF?style=flat" alt="Dataset"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Tests-30%2F30_Passed-22c55e?style=flat" alt="Tests"/></a>
</p>

---

## 🏆 Built for INDIA RUNS — Redrob AI × Hack2skill Hackathon

**Track 1: AI-Powered Candidate Ranking System**

Recruiters go through hundreds of profiles and still miss the right person. Not because the talent isn't there — but because keyword filters can't see what actually matters. RoleSense solves that by ranking candidates using **semantic understanding** and **multi-dimensional hybrid scoring**.

---

## ✨ Key Features

- **🧠 Semantic Understanding** — sentence-transformers embeddings match candidates to roles beyond keywords
- **📊 8-Dimension Hybrid Scoring** — Skills, experience, qualifications, English, behavioral signals, location, sector, and semantic fit
- **🔍 Explainable Rankings** — Every candidate includes strengths, weaknesses, and a recruiter recommendation
- **📤 Export Rankings** — Download results as **CSV**, **XLSX**, or **JSON** for use in any ATS
- **📋 Resume Fit Analyser** — Paste or upload a PDF resume + JD for an instant fit score, skill gaps, and tailoring tips
- **📈 Interactive Analytics Dashboard** — Score distribution, top skills, location breakdown, confidence charts
- **⚡ Blazing Fast** — Embedding cache + optional FAISS vector search for large-scale ranking
- **🇮🇳 India-First** — Built for Indian hiring platforms with awareness of local education, languages, and sectors

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Job Description              │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │           JD Parser                  │
                    │  Extract: skills, sector, location,  │
                    │  experience requirements             │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │      Embedding Engine                │
                    │  sentence-transformers               │
                    │  all-MiniLM-L6-v2 (384d)             │
                    │  + Embedding Cache (.pkl)            │
                    └──────────────┬──────────────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
               ▼                   ▼                   ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
    │   Cosine         │  │  Skill       │  │  Experience      │
    │   Similarity     │  │  Matcher     │  │  Scorer          │
    └────────┬─────────┘  └──────┬───────┘  └────────┬─────────┘
             │                   │                    │
             ▼                   ▼                    ▼
    ┌──────────────────────────────────────────────────────┐
    │              Hybrid Scorer (Weighted)                │
    │  Semantic(30%) + Skills(20%) + Experience(15%)       │
    │  + Qualification(10%) + English(5%)                  │
    │  + Behavioral(10%) + Location(5%) + Sector(5%)       │
    └──────────────────────┬───────────────────────────────┘
                           │
                           ▼
                    ┌─────────────────────────────────────┐
                    │         Ranked Shortlist             │
                    │  + Score Breakdown                  │
                    │  + Strengths & Weaknesses           │
                    │  + Recruiter Recommendation         │
                    │  + Export: CSV / XLSX / JSON        │
                    └─────────────────────────────────────┘
```

---

## 📊 Scoring Methodology

The system uses a **hybrid weighted scoring model** with 8 dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Semantic Similarity** | 30% | Embedding cosine similarity — understands context beyond keywords |
| **Skills Match** | 20% | Direct + synonym-aware matching (e.g. "bike" ↔ "delivery") |
| **Experience Match** | 15% | Years vs requirements; handles fresher / experienced labels |
| **Qualification Match** | 10% | Education level alignment (10th Pass → PhD) |
| **English Proficiency** | 5% | No → Basic → Good → Fluent |
| **Behavioral Signals** | 10% | Urgency, resume uploaded, mobile verified, recent activity |
| **Location Match** | 5% | City/location alignment with job |
| **Sector Match** | 5% | Industry sector relevance |

---

## 📁 Datasets

| Dataset | Source | Profiles | Type |
|---------|--------|----------|------|
| **WorkIndia** | Real candidates from India's largest blue/grey collar platform | 100 | Skills, experience, education, behavioral signals, languages |
| **Role Radar** | Real + synthetic professional profiles (India-focused) | 640 | Roles, primary/secondary skills, domains, seniority |
| **Scraped Jobs** | Real Indian job postings | 2,500 | Full descriptions with title, company, location, seniority |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+

### Run Locally

```bash
# Clone
git clone https://github.com/TrinaLynus011/RoleSense-AI.git
cd RoleSense-AI

# Backend (FastAPI)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (Angular) — new terminal
cd frontend
npm install
npm start
```

Open **http://localhost:4200**

---

## 🖥️ Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Metrics overview — candidates indexed, confidence breakdown, avg score |
| **Search** | Paste a job description, set filters (location, experience, skills, top-N), rank candidates |
| **Results** | Ranked candidate cards with score breakdown, strengths/gaps, expandable details |
| **Resume Fit** | Upload PDF or paste resume + JD → instant fit score, skill gaps, tailoring tips |
| **Analytics** | Score distribution, top skills, location heatmap, confidence donut charts |

---

## 📤 Export Formats

From the Results page, click **Export** to download ranked candidates in:

| Format | Contents |
|--------|----------|
| **CSV** | Rank, name, match %, confidence, location, skills, all 8 score dimensions, recommendation |
| **XLSX** | Same as CSV with formatted column widths, ready for Excel/Sheets |
| **JSON** | Full enriched output including explanation strengths/weaknesses |

---

## 📈 Sample Output

### Delivery Executive — Mumbai (Top 5)

| Rank | Name | Score | Confidence |
|------|------|-------|------------|
| #1 | Sumit Ghorpade | 69.4% | Medium |
| #2 | Jeroy Rodrigues | 63.3% | Medium |
| #3 | Abhishek Suresh Gotad | 63.2% | Medium |
| #4 | Azman Khan | 62.0% | Medium |
| #5 | Aalok Jitendra Singh | 61.7% | Medium |

---

## 🏗️ Project Structure

```
RoleSense-AI/
│
├── backend/                   # FastAPI backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── auth.py
│       ├── routes/
│       │   ├── auth.py        # POST /signup, /login
│       │   └── candidates.py  # POST /rank-candidates, GET /locations, /analytics
│       └── services/
│           └── ranking_service.py
│
├── frontend/                  # Angular 21 SPA
│   ├── vercel.json
│   ├── replace-env.js         # Injects BACKEND_URL at Vercel build time
│   └── src/app/pages/
│       ├── dashboard/
│       ├── search/
│       ├── results/           # CSV / XLSX / JSON export
│       ├── resume/            # PDF upload + fit analyser
│       └── analytics/
│
├── src/                       # AI ranking engine
│   ├── ranker.py
│   ├── scorer.py              # 8-dim hybrid scoring
│   ├── embeddings.py
│   ├── data_loader.py
│   └── cache.py
│
├── data/                      # Candidate + job datasets
├── tests/                     # 30 validation tests (30/30 passing)
├── RESUME_TEST_FILES/         # Sample resume + JD for testing
└── SEARCH_INPUTS.md           # Ready-to-use JD inputs for search
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Import `TrinaLynus011/RoleSense-AI` on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. Set **Build Command** → `npm run build:prod`
4. Set **Output Directory** → `dist/browser`
5. Add env var: `BACKEND_URL` → your Docker backend URL
6. Deploy

### Backend → Docker

```bash
# Build from repo root (includes src/, data/, cache/)
docker build -f backend/Dockerfile -t rolesense-backend .
docker run -p 8000:8000 rolesense-backend
```

Deploy the image to **Railway**, **Fly.io**, or any container host.

---

## 🧪 Testing

```bash
python tests/test_validation.py
# RESULTS: 30 passed, 0 failed out of 30
```

Validates: data loading, JD parsing, candidate normalisation, ranking pipeline, edge cases, JSON serialisation, Role Radar pipeline, CLI module.

---

## 🤝 Team

Built for **INDIA RUNS** — a nationwide hackathon by **Redrob AI** and **Hack2skill**.

---

<p align="center">
  <sub>Made with ❤️ for better hiring in India</sub>
</p>
