"""Wraps the existing ranking engine as a reusable service."""

import sys, os, json, re
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from src.ranker import CandidateRanker, format_output
from src.data_loader import load_workindia_candidates, load_role_radar_profiles

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")


def _extract_all_locations() -> list[str]:
    locations = set()
    for loader in [load_workindia_candidates, load_role_radar_profiles]:
        for c in loader():
            loc = c.get("location", "") or c.get("city", "") or ""
            if loc and isinstance(loc, str):
                locations.add(loc.strip().title())
    return sorted(locations)


def _score_confidence(score: float) -> dict:
    if score >= 0.65:
        return {"label": "High", "color": "#22c55e"}
    elif score >= 0.55:
        return {"label": "Medium", "color": "#eab308"}
    else:
        return {"label": "Low", "color": "#ef4444"}


def rank_candidates(
    job_description: str,
    source: str = "workindia",
    top_n: int = 20,
    location_filter: str | None = None,
    remote_friendly: bool = False,
    min_experience: float | None = None,
    min_confidence: float | None = None,
    skills_filter: list[str] | None = None,
) -> dict:
    ranker = CandidateRanker()
    ranker.load_job_description(job_description)
    jd_info = ranker.jd_info

    if source == "workindia":
        candidates = load_workindia_candidates()
    else:
        candidates = load_role_radar_profiles()

    if location_filter:
        loc_lower = location_filter.lower()
        candidates = [
            c for c in candidates
            if loc_lower in (c.get("location", "") or c.get("city", "") or "").lower()
        ]

    if remote_friendly:
        pass

    if min_experience is not None:
        def _parse_years(c):
            exp = c.get("experience", "") or c.get("total_experience", "") or "0"
            if isinstance(exp, (int, float)):
                return float(exp)
            nums = re.findall(r"\d+", str(exp))
            return float(nums[0]) if nums else 0
        candidates = [c for c in candidates if _parse_years(c) >= min_experience]

    if skills_filter:
        skill_set = {s.lower() for s in skills_filter}
        def _has_skills(c):
            c_skills = c.get("skills", []) or c.get("primary_skill", "").split(", ") or []
            c_skills = [s.lower() for s in c_skills]
            return bool(skill_set & set(c_skills))
        candidates = [c for c in candidates if _has_skills(c)]

    if not candidates:
        return {"candidates": [], "total": 0, "job_info": jd_info}

    ranked = ranker.rank(candidates)
    output = format_output(ranked, top_n=top_n)

    for c in output:
        score = c.get("overall_score", 0)
        c["match_percent"] = round(score * 100, 1)
        c["confidence"] = _score_confidence(score)
        c["name"] = c.get("name", c.get("candidate_name", "Unknown"))
        c["location"] = c.get("location", c.get("city", ""))
        c["skills"] = c.get("skills", [])
        c["experience"] = c.get("experience", c.get("total_experience", ""))

    return {"candidates": output, "total": len(ranked), "job_info": jd_info}


def compute_analytics(candidates: list[dict]) -> dict:
    scores = [c.get("overall_score", 0) for c in candidates]
    confidences = [c.get("confidence", {}).get("label", "Low") for c in candidates]
    locations = [c.get("location", "Unknown") or "Unknown" for c in candidates]
    skills = []
    for c in candidates:
        skills.extend(c.get("skills", []) or [])
    experiences = []
    for c in candidates:
        exp = c.get("experience", "") or ""
        nums = re.findall(r"\d+", str(exp))
        experiences.append(float(nums[0]) if nums else 0)

    from collections import Counter
    skill_counts = Counter(skills).most_common(10)
    location_counts = Counter(locations).most_common(10)
    confidence_counts = Counter(confidences)

    score_bins = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for s in scores:
        pct = s * 100
        if pct <= 20: score_bins["0-20"] += 1
        elif pct <= 40: score_bins["21-40"] += 1
        elif pct <= 60: score_bins["41-60"] += 1
        elif pct <= 80: score_bins["61-80"] += 1
        else: score_bins["81-100"] += 1

    return {
        "total_candidates": len(candidates),
        "avg_score": round(sum(scores) / len(scores), 3) if scores else 0,
        "high_confidence": confidence_counts.get("High", 0),
        "medium_confidence": confidence_counts.get("Medium", 0),
        "low_confidence": confidence_counts.get("Low", 0),
        "score_distribution": score_bins,
        "top_skills": [{"skill": s, "count": c} for s, c in skill_counts],
        "location_distribution": [{"location": l, "count": c} for l, c in location_counts],
        "avg_experience": round(sum(experiences) / len(experiences), 1) if experiences else 0,
    }
