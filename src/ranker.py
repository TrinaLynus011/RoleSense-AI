import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
from src.scorer import CandidateScorer, extract_jd_info
from src.embeddings import EmbeddingEngine
from src.data_loader import normalize_candidate, build_candidate_text_profile

logger = logging.getLogger(__name__)


class CandidateRanker:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.embedder = EmbeddingEngine(model_name)
        self.scorer = CandidateScorer()
        self.jd_info = {}
        self.jd_embedding = None
        self.jd_text = ""

    def load_job_description(self, jd_text: str):
        if not jd_text or not jd_text.strip():
            raise ValueError("Job description text cannot be empty")
        self.jd_text = jd_text
        self.jd_info = extract_jd_info(jd_text)
        self.jd_embedding = self.embedder.encode_job(jd_text)
        logger.info("Loaded JD: %s | Location: %s", self.jd_info.get("title", "N/A"), self.jd_info.get("location", "N/A"))

    def rank(self, candidates: List[Dict]) -> List[Dict]:
        if not candidates:
            logger.warning("Empty candidate list - returning []")
            return []

        normalized = [normalize_candidate(c) for c in candidates]
        profiles = [build_candidate_text_profile(nc) for nc in normalized]

        profile_embs = self.embedder.encode_candidates(profiles)
        similarities = self.embedder.compute_similarities(self.jd_embedding, profile_embs)

        results = []
        for nc, sim in zip(normalized, similarities):
            scores = self.scorer.compute_scores(nc, self.jd_info, semantic_sim=float(sim))
            hybrid_score = self.scorer.compute_hybrid_score(scores)
            explanation = self.scorer.generate_explanation(scores, nc)

            result = {
                "rank": 0,
                "candidate_id": nc["id"],
                "name": nc["name"],
                "overall_score": hybrid_score,
                "score_breakdown": scores,
                "explanation": explanation,
                "source": nc.get("_source", "unknown"),
            }

            profile_fields = ["age", "gender", "location", "city", "qualification",
                              "english_level", "experience_label", "years_experience",
                              "previous_job_title", "previous_company", "skills",
                              "sectors", "languages", "is_looking_urgently",
                              "has_resume", "hot_lead_status"]
            for field in profile_fields:
                val = nc.get(field)
                if val is not None and val != "" and val != []:
                    result[field] = val

            results.append(result)

        results.sort(key=lambda x: x["overall_score"], reverse=True)
        for i, r in enumerate(results):
            r["rank"] = i + 1

        return results


def format_output(ranked: List[Dict], top_n: Optional[int] = None) -> List[Dict]:
    if top_n:
        ranked = ranked[:top_n]
    output = []
    for r in ranked:
        entry = {
            "rank": r["rank"],
            "candidate_id": r["candidate_id"],
            "name": r["name"],
            "overall_score": r["overall_score"],
            "score_breakdown": r["score_breakdown"],
        }
        if "explanation" in r:
            entry["explanation"] = r["explanation"]
        for field in ["skills", "location", "city", "previous_job_title",
                       "years_experience", "qualification", "source",
                       "is_looking_urgently", "has_resume"]:
            if field in r:
                entry[field] = r[field]
        output.append(entry)
    return output
