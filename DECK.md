# AI Candidate Ranking System

## INDIA RUNS — Redrob AI × Hack2skill Hackathon

---

## Slide 1: The Problem

**Recruiters miss the right person — not because talent isn't there, but because keyword filters can't see what matters.**

- Hundreds of profiles to review
- Keyword matching misses context
- Behavioral signals ignored
- No explainable scoring

---

## Slide 2: Our Solution

**A hybrid AI system that ranks candidates the way a great recruiter would.**

| Capability | Approach |
|---|---|
| Understands job context | Semantic embeddings (sentence-transformers) |
| Beyond keywords | Synonym-aware skill matching |
| Full picture | 8 scoring dimensions |
| Explainable | Transparent score breakdown for every candidate |
| India-first | Built for Indian hiring platforms |

---

## Slide 3: Architecture

```
Job Description → JD Parser → Embedding Engine
                                    │
                    ┌───────────────┘
                    ▼
            Similarity Computation
                    │
                    ▼
            Hybrid Scorer (8 dimensions)
                    │
                    ▼
            Ranker → Ranked Shortlist
```

---

## Slide 4: Scoring Dimensions

| Dimension | Weight | What It Measures |
|---|---|---|
| Semantic Similarity | 30% | Embedding cosine similarity — understands context |
| Skills Match | 20% | Direct + synonym-aware skill matching |
| Experience Match | 15% | Years vs requirements, handles fresher/senior |
| Qualification Match | 10% | Education level alignment |
| English Proficiency | 5% | No → Basic → Good → Fluent |
| Behavioral Signals | 10% | Urgency, resume, mobile verification, activity |
| Location Match | 5% | City/location alignment |
| Sector Match | 5% | Industry relevance |

---

## Slide 5: Semantic Understanding

**Why embeddings beat keywords:**

- "Delivery Executive" ≈ "Bike Rider + Packing" (semantically similar)
- sentence-transformers `all-MiniLM-L6-v2`
- 384-dimensional normalized embeddings
- Cosine similarity captures role relevance

---

## Slide 6: Data Sources

| Dataset | Profiles | Type |
|---|---|---|
| **WorkIndia** | 100 real | Blue/grey collar — skills, experience, behavioral signals |
| **Role Radar** | 640 (438 synthetic + 202 real) | Professional profiles with roles, skills, domains |
| **Scraped Jobs** | 2,500 | Real Indian job postings with full descriptions |

---

## Slide 7: Sample Output

```
Rank │ Name                  │ Score
─────┼───────────────────────┼───────
#1   │ Sumit Ghorpade        │ 0.6940
#2   │ Jeroy Rodrigues       │ 0.6331
#3   │ Abhishek Suresh Gotad │ 0.6322
#4   │ Azman Khan            │ 0.6202
#5   │ Aalok Jitendra Singh  │ 0.6172
```

Every candidate includes a **score breakdown** showing WHY they scored.

---

## Slide 8: Why This Works

1. **Beyond keywords** — Semantic embeddings understand role context
2. **Holistic picture** — 8 scoring dimensions cover the full candidate
3. **Explainable** — Recruiters see *why*, not just *who*
4. **India-first** — Built for Indian education, languages, job sectors
5. **Hybrid** — Neural embeddings + reliable rule-based matching
6. **Flexible** — Works with any candidate data source

---

## Slide 9: Tech Stack

| Component | Technology |
|---|---|
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Similarity | Cosine similarity (numpy) |
| Scoring | Custom hybrid engine (Python) |
| Data | JSON, pandas |
| CLI | Python argparse |

---

## Slide 10: How to Run

```bash
# Install
pip install -r requirements.txt

# Rank candidates for a job
python src/main.py --source workindia --top-n 10

# Custom job description
python src/main.py --jd my_job.txt --top-n 20

# Use Role Radar dataset
python src/main.py --source jd_dataset --jd-index 0
```

---

## Slide 11: Future Enhancements

- **LLM-based ranking** — Claude/GPT for deeper reasoning
- **Vector database** — FAISS/Chroma for large-scale retrieval
- **Resume parsing** — PDF/DOCX extraction
- **Bias detection** — Fairness metrics across demographics
- **Dashboard** — Streamlit/Gradio UI for recruiters
- **API** — FastAPI endpoint for integration

---

## Slide 12: Repository

**GitHub:** github.com/yourusername/candidate-rank-ai

**Contents:**
- Clean, modular Python code
- Two Indian hiring datasets included
- 3 sample job descriptions
- Ranked output files
- This deck

---

### Thank You

Built for INDIA RUNS — Redrob AI × Hack2skill
