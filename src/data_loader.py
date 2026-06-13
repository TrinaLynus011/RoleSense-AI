import json
import os
from typing import Dict, List, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_workindia_candidates(path: Optional[str] = None) -> List[Dict]:
    if path is None:
        path = os.path.join(DATA_DIR, "candidates_workindia.json")
    with open(path, "r", encoding="utf-8") as f:
        candidates = json.load(f)
    for c in candidates:
        c["_source"] = "workindia"
    return candidates


def load_role_radar_profiles(path: Optional[str] = None) -> List[Dict]:
    if path is None:
        path = os.path.join(DATA_DIR, "synthetic_profiles.json")
    with open(path, "r", encoding="utf-8") as f:
        profiles = json.load(f)
    for p in profiles:
        p["_source"] = "role_radar"
    return profiles


def load_job_descriptions(path: Optional[str] = None) -> List[Dict]:
    if path is None:
        path = os.path.join(DATA_DIR, "scraped_jobs.json")
    with open(path, "r", encoding="utf-8") as f:
        jobs = json.load(f)
    return jobs


def load_gold_labels(path: Optional[str] = None) -> List[Dict]:
    if path is None:
        path = os.path.join(DATA_DIR, "gold_labels.json")
    with open(path, "r", encoding="utf-8") as f:
        labels = json.load(f)
    return labels


def load_job_description_text(path: Optional[str] = None) -> str:
    if path is None:
        path = os.path.join(DATA_DIR, "job_description.txt")
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def normalize_candidate(c: Dict) -> Dict:
    """Normalize any candidate profile into a standard schema."""
    src = c.get("_source", "unknown")

    result = {"_source": src}

    if src == "workindia":
        result.update({
            "id": c.get("candidateId", ""),
            "name": c.get("fullName", ""),
            "age": c.get("age"),
            "gender": c.get("gender"),
            "location": c.get("location", ""),
            "city": c.get("city", ""),
            "qualification": c.get("qualification", ""),
            "english_level": c.get("englishLevel", ""),
            "experience_label": c.get("totalExperience", ""),
            "years_experience": c.get("yearsOfExperience"),
            "previous_job_title": c.get("previousJobTitle") or "",
            "previous_company": c.get("previousCompany") or "",
            "skills": c.get("skills") or [],
            "sectors": c.get("sectors") or [],
            "languages": c.get("languages") or [],
            "assets": c.get("assets") or [],
            "is_looking_urgently": c.get("isLookingUrgently", False),
            "is_mobile_verified": c.get("isMobileVerified", False),
            "has_resume": c.get("hasResume", False),
            "hot_lead_status": c.get("hotLeadStatus", ""),
            "last_seen": c.get("lastSeen", ""),
            "join_date": c.get("joinDate", ""),
            "search_job_title": c.get("searchJobTitle", ""),
        })

    elif src == "role_radar":
        roles = c.get("roles", [])
        primary_skills = c.get("skills_primary", [])
        secondary_skills = c.get("skills_secondary", [])
        result.update({
            "id": c.get("profile_id", ""),
            "name": c.get("profile_id", ""),
            "age": None,
            "gender": None,
            "location": (c.get("preferences") or {}).get("location", ""),
            "city": "",
            "qualification": "",
            "english_level": "",
            "experience_label": "",
            "years_experience": c.get("experience_years"),
            "previous_job_title": roles[-1] if roles else "",
            "previous_company": "",
            "skills": primary_skills + secondary_skills,
            "sectors": c.get("domains", []),
            "languages": [],
            "assets": [],
            "is_looking_urgently": False,
            "is_mobile_verified": False,
            "has_resume": True,
            "hot_lead_status": "",
            "last_seen": "",
            "join_date": "",
            "search_job_title": roles[0] if roles else "",
        })

    return result

    return c


def build_candidate_text_profile(nc: Dict) -> str:
    """Build a rich text profile for semantic embedding."""
    parts = []
    if nc.get("previous_job_title"):
        parts.append(f"Previous Role: {nc['previous_job_title']}")
    if nc.get("skills"):
        parts.append(f"Skills: {', '.join(nc['skills'])}")
    if nc.get("sectors"):
        parts.append(f"Sectors: {', '.join(nc['sectors'])}")
    if nc.get("qualification"):
        parts.append(f"Qualification: {nc['qualification']}")
    if nc.get("experience_label"):
        parts.append(f"Experience: {nc['experience_label']}")
    if nc.get("years_experience") is not None:
        parts.append(f"Years of Experience: {nc['years_experience']}")
    if nc.get("english_level"):
        parts.append(f"English: {nc['english_level']}")
    if nc.get("languages"):
        parts.append(f"Languages: {', '.join(nc['languages'])}")
    if nc.get("location"):
        parts.append(f"Location: {nc['location']}")
    if nc.get("city"):
        parts.append(f"City: {nc['city']}")
    if nc.get("search_job_title"):
        parts.append(f"Looking for: {nc['search_job_title']}")
    return ". ".join(parts)
