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
  <a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-20+-DD0031?style=flat&logo=angular&logoColor=white" alt="Angular"/></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white" alt="Python"/></a>
  <a href="https://www.sbert.net"><img src="https://img.shields.io/badge/Transformers-all--MiniLM--L6--v2-FFD21E?style=flat&logo=huggingface&logoColor=black" alt="Sentence Transformers"/></a>
  <a href="https://faiss.ai"><img src="https://img.shields.io/badge/FAISS-1.7+-0099FF?style=flat&logo=meta&logoColor=white" alt="FAISS"/></a>
  <a href="https://apexcharts.com"><img src="https://img.shields.io/badge/ApexCharts-4.0+-FFB800?style=flat" alt="ApexCharts"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-brightgreen?style=flat" alt="MIT License"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Dataset-740_Profiles-20BEFF?style=flat" alt="Dataset"/></a>
</p>

---

## 🏆 Built for INDIA RUNS — Redrob AI × Hack2skill Hackathon

**Track 1: AI-Powered Candidate Ranking System**

Recruiters go through hundreds of profiles and still miss the right person. Not because the talent isn't there — but because keyword filters can't see what actually matters. This system solves that by ranking candidates using **semantic understanding** and **multi-dimensional hybrid scoring**.

---

## ✨ Key Features

- **🧠 Semantic Understanding** — Uses sentence-transformers embeddings to match candidates to roles beyond keywords
- **📊 8-Dimension Hybrid Scoring** — Skills, experience, qualifications, English, behavior, location, sector, and semantic fit
- **🔍 Explainable Rankings** — Every candidate includes strengths, weaknesses, and recruiter recommendations
- **📈 Interactive Dashboard** — Premium Streamlit UI with dark theme, glassmorphism cards, and Plotly analytics
- **⚡ Blazing Fast** — Embedding caching and optional FAISS vector search for large-scale ranking
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
                    │  + Optional FAISS Index              │
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
                    └─────────────────────────────────────┘
```

---

## 📊 Scoring Methodology

The system uses a **hybrid weighted scoring model** with 8 dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Semantic Similarity** | 30% | Embedding cosine similarity between JD and candidate — understands context beyond keywords |
| **Skills Match** | 20% | Direct + synonym-aware matching (e.g., "bike" ↔ "delivery") |
| **Experience Match** | 15% | Years vs requirements; handles fresher / experienced labels |
| **Qualification Match** | 10% | Education level alignment (10th Pass → PhD) |
| **English Proficiency** | 5% | No → Basic → Good → Fluent |
| **Behavioral Signals** | 10% | Urgency, resume uploaded, mobile verified, recent activity |
| **Location Match** | 5% | City/location alignment with job |
| **Sector Match** | 5% | Industry sector relevance (delivery, security, sales, etc.) |

Each dimension is scored 0–1 and aggregated with the weights above for a final **Hybrid Score**.

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
- npm

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/yourusername/candidate-rank-ai.git
cd candidate-rank-ai

# ── Backend (FastAPI) ──
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# ── Frontend (Angular) ──
cd ../frontend
npm install
npm start
```

Open **http://localhost:4200** in your browser.

### Streamlit Dashboard (Alternative)

```bash
pip install streamlit plotly faiss-cpu
streamlit run streamlit_app.py
```

### CLI Pipeline

```bash
pip install -r requirements.txt
python src/main.py --source workindia --top-n 10
python src/main.py --source workindia --jd my_job.txt --top-n 50 --output my_rankings.json
```

---

## 🖥️ Dashboard

The Streamlit dashboard provides an interactive recruiter experience:

```
streamlit run streamlit_app.py
```

### Key Views

| Tab | Features |
|-----|----------|
| **📋 Ranked Candidates** | Sortable, filterable candidate cards with score breakdowns and explanations |
| **📊 Analytics** | Score distribution histogram, ranking trend, skill frequency, experience histogram |
| **💾 Export** | Download rankings as CSV, JSON, or enriched JSON with full explanations |

### UI Theme

- Premium dark theme with custom CSS
- Glassmorphism design with backdrop blur
- Gradient metric cards with hover animations
- Animated candidate cards with color-coded rank badges
- Interactive Plotly charts with dark mode styling

---

## 📈 Sample Output

### Delivery Executive — Mumbai (Top 5)

| Rank | Name | Score | Confidence |
|------|------|-------|------------|
| #1 | Sumit Ghorpade | 0.6940 | Medium |
| #2 | Jeroy Rodrigues | 0.6331 | Medium |
| #3 | Abhishek Suresh Gotad | 0.6322 | Medium |
| #4 | Azman Khan | 0.6202 | Medium |
| #5 | Aalok Jitendra Singh | 0.6172 | Medium |

### Enriched Output (per candidate)

```json
{
  "rank": 1,
  "name": "Sumit Ghorpade",
  "overall_score": 0.6940,
  "score_breakdown": {
    "semantic_similarity": 0.6466,
    "skills_match": 1.0,
    "experience_match": 0.8,
    "qualification_match": 0.2,
    "english_proficiency": 0.6,
    "behavioral_signals": 0.3,
    "location_match": 1.0,
    "sector_match": 1.0
  },
  "explanation": {
    "strengths": [
      "Strong skills match (100%)",
      "Strong experience relevance (80%)",
      "Strong location match (100%)"
    ],
    "weaknesses": [
      "Limited qualification level (20%)",
      "Limited recruiter engagement (30%)"
    ],
    "recommendation": "Recommended. Good fit with some areas for development.",
    "confidence": "Medium"
  }
}
```

---

## 🏗️ Project Structure

```
candidate-rank-ai/
│
├── backend/                   # ⚡ FastAPI backend
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # API entry point
│       ├── database.py        # SQLite + SQLAlchemy
│       ├── models.py          # User + SearchHistory ORM
│       ├── schemas.py         # Pydantic request/response
│       ├── auth.py            # JWT auth utilities
│       ├── routes/
│       │   ├── auth.py        # POST /signup, /login
│       │   └── candidates.py  # POST /rank-candidates, GET /locations, /analytics
│       └── services/
│           └── ranking_service.py  # Wraps AI ranking engine
│
├── frontend/                  # 🖥️ Angular 20+ SPA
│   ├── package.json
│   ├── angular.json
│   ├── vercel.json
│   ├── README.md
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.scss        # Design system (dark/light theme)
│       └── app/
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── core/
│           │   ├── models/user.model.ts
│           │   ├── services/auth.service.ts
│           │   ├── services/theme.service.ts
│           │   ├── services/api.service.ts
│           │   ├── guards/auth.guard.ts
│           │   └── interceptors/auth.interceptor.ts
│           ├── shared/
│           │   ├── components/navbar/
│           │   ├── components/candidate-card/
│           │   ├── components/match-score-badge/
│           │   ├── components/analytics-charts/
│           │   ├── components/search-panel/
│           │   ├── components/theme-toggle/
│           │   ├── pipes/confidence.pipe.ts
│           │   └── directives/animate-on-scroll.directive.ts
│           └── pages/
│               ├── landing/   # Hero + features
│               ├── signin/    # Auth form
│               ├── signup/    # Registration
│               ├── dashboard/ # Metrics + insights
│               ├── search/    # JD input + filters
│               ├── results/   # Ranked candidate cards
│               └── analytics/ # Charts + pool insights
│
├── streamlit_app.py          # 📊 Streamlit dashboard (alternative UI)
├── requirements.txt          # 📦 Python deps (CLI + Streamlit)
├── runtime.txt               # ⚙️ Python version
├── LICENSE                   # 📝 MIT License
├── README.md                 # 📖 You are here
├── .gitignore
│
├── src/                      # 🧠 AI ranking engine (unchanged)
│   ├── main.py               # CLI entry
│   ├── data_loader.py
│   ├── embeddings.py         # + cache integration
│   ├── scorer.py             # 8-dim hybrid scoring
│   ├── ranker.py
│   └── cache.py              # FAISS + embedding cache
│
├── data/                     # 📊 Datasets
├── tests/                    # 🧪 30 validation tests
├── output/                   # 📤 Generated rankings
└── assets/                   # 🎨 README images
```

---

## 🛠️ Deployment

### Streamlit Cloud

1. Push the repository to GitHub
2. Sign in to [share.streamlit.io](https://share.streamlit.io)
3. Click **New app** and select your repository
4. Set entry point to `streamlit_app.py`
5. Deploy! Streamlit Cloud auto-detects `requirements.txt`

### Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `streamlit run streamlit_app.py --server.port $PORT`

### Local

```bash
streamlit run streamlit_app.py
```

---

## 🧪 Testing

```bash
python tests/test_validation.py
```

The validation suite checks:
- ✅ All modules import correctly
- ✅ JD parsing extracts structured info
- ✅ Candidate normalization works for all sources
- ✅ Ranking produces scores in descending order
- ✅ Empty and edge cases handled gracefully
- ✅ JSON serialization is clean
- ✅ Both WorkIndia and Role Radar pipelines work

---

## 🗺️ Future Roadmap

- [ ] **LLM-powered ranking** — Use GPT/Claude for deep semantic reasoning
- [ ] **PDF resume parsing** — Extract text from uploaded resumes
- [ ] **Bias detection** — Fairness metrics across demographics
- [ ] **Recruiter feedback loop** — Tune weights based on recruiter actions
- [ ] **Multi-job batch ranking** — Rank candidates across multiple roles
- [ ] **REST API** — FastAPI endpoint for ATS integration
- [ ] **Dark/light theme toggle**

---

## 🤝 Team

Built for **INDIA RUNS** — a nationwide hackathon by **Redrob AI** and **Hack2skill**.

---

<p align="center">
  <sub>Made with ❤️ for better hiring</sub>
  <br/>
  <sub>MIT Licensed — use freely, improve relentlessly</sub>
</p>
