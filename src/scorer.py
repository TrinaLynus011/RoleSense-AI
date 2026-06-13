import numpy as np
import re
from typing import Dict, List, Optional, Tuple


class SkillMatcher:
    def __init__(self):
        self.skill_synonyms = {
            "bike": ["delivery", "rider", "driving", "transporter"],
            "driver": ["driving", "transporter", "chauffeur", "cab"],
            "sales": ["selling", "retail", "business development", "marketing"],
            "cooking": ["chef", "kitchen", "food preparation"],
            "cleaning": ["housekeeping", "maid", "sanitation"],
            "security": ["guard", "safety", "surveillance", "watchman"],
            "teaching": ["teacher", "tutor", "instructor", "education"],
            "computer": ["it", "software", "programming", "tech"],
            "customer service": ["support", "help desk", "calling", "telecalling"],
        }

    def match_skills(self, job_skills: List[str], candidate_skills: List[str]) -> float:
        if not job_skills or not candidate_skills:
            return 0.0

        job_skills_lower = [s.lower().strip() for s in job_skills]
        cand_skills_lower = [s.lower().strip() for s in candidate_skills]

        direct_matches = sum(1 for js in job_skills_lower if any(
            js in cs or cs in js for cs in cand_skills_lower
        ))

        synonym_matches = 0
        for js in job_skills_lower:
            expanded = self._expand_skills(js)
            for cs in cand_skills_lower:
                if any(syn in cs or cs in syn for syn in expanded):
                    synonym_matches += 0.5
                    break

        total = direct_matches + synonym_matches
        max_possible = max(len(job_skills_lower), 1)
        return min(total / max_possible, 1.0)

    def _expand_skills(self, skill: str) -> List[str]:
        result = [skill]
        for key, syns in self.skill_synonyms.items():
            if key in skill or skill in key:
                result.extend(syns)
        return result


class ExperienceScorer:
    @staticmethod
    def score(job_min_years: Optional[float], job_max_years: Optional[float],
              candidate_years: Optional[float], candidate_label: str) -> float:
        if candidate_years is not None and job_min_years is not None:
            if candidate_years >= job_min_years:
                if job_max_years and candidate_years > job_max_years:
                    return max(0.3, 1.0 - (candidate_years - job_max_years) / job_max_years * 0.5)
                return 1.0
            gap = job_min_years - candidate_years
            return max(0.0, 1.0 - gap / max(job_min_years, 1))

        exp_label = (candidate_label or "").lower()
        if "experienced" in exp_label or "senior" in exp_label:
            return 0.8
        if "junior" in exp_label:
            return 0.5
        if "fresher" in exp_label:
            return 0.3
        return 0.5


class QualificationScorer:
    LEVEL_MAP = {
        "< 10th pass": 0.1,
        "10th pass": 0.2,
        "12th pass": 0.3,
        "high school": 0.25,
        "diploma": 0.4,
        "graduate": 0.6,
        "bachelor": 0.6,
        "b.tech": 0.7,
        "b.e": 0.7,
        "master": 0.8,
        "m.tech": 0.85,
        "phd": 1.0,
    }

    @classmethod
    def score(cls, qualification: str) -> float:
        qual_lower = qualification.lower().strip()
        for key, val in cls.LEVEL_MAP.items():
            if key in qual_lower:
                return val
        return 0.3


class EnglishScorer:
    LEVEL_MAP = {
        "no english": 0.0,
        "basic english": 0.3,
        "good english": 0.6,
        "fluent english": 0.85,
        "professional english": 1.0,
    }

    @classmethod
    def score(cls, level: str) -> float:
        return cls.LEVEL_MAP.get(level.lower().strip(), 0.3)


class BehavioralScorer:
    @staticmethod
    def score(urgent: bool, has_resume: bool, mobile_verified: bool,
              hot_lead: str, last_seen: Optional[str] = None) -> float:
        score = 0.0
        if urgent:
            score += 0.25
        if has_resume:
            score += 0.25
        if mobile_verified:
            score += 0.15
        if hot_lead == "new_lead":
            score += 0.2
        elif hot_lead == "old_lead":
            score += 0.1
        if last_seen:
            try:
                from datetime import datetime, timezone
                seen = datetime.fromisoformat(last_seen.replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                days_since = (now - seen).days
                if days_since <= 1:
                    score += 0.15
                elif days_since <= 7:
                    score += 0.1
                elif days_since <= 30:
                    score += 0.05
            except Exception:
                pass
        return min(score, 1.0)


class LocationScorer:
    @staticmethod
    def score(job_location: str, candidate_city: str, candidate_location: str) -> float:
        if not job_location:
            return 0.5
        jl = job_location.lower().strip()
        cc = candidate_city.lower().strip() if candidate_city else ""
        cl = candidate_location.lower().strip() if candidate_location else ""
        if jl in cc or jl in cl or cc in jl or cl in jl:
            return 1.0
        return 0.3


class SectorScorer:
    SECTOR_MAP = {
        "delivery": ["delivery", "driver", "transporter"],
        "driver": ["delivery", "driver", "transporter"],
        "sales": ["sales", "retail", "field_sales"],
        "security": ["security", "guard", "safety"],
        "housekeeping": ["housekeeping", "cleaning", "maid"],
        "teacher": ["teacher", "teaching", "education", "tutor"],
        "technician": ["technician", "it", "technical", "engineer"],
        "labourer": ["labourer", "construction", "factory", "worker"],
        "cook": ["cook", "chef", "kitchen", "hotel"],
        "telecalling": ["telecalling", "customer service", "bpo", "call center"],
        "software": ["software", "developer", "it", "programming", "engineer"],
    }

    @classmethod
    def score(cls, jd_sectors: List[str], candidate_sectors: List[str]) -> float:
        if not jd_sectors or not candidate_sectors:
            return 0.5
        cs_lower = [s.lower().strip() for s in candidate_sectors]
        js_lower = [s.lower().strip() for s in jd_sectors]
        for js in js_lower:
            related = cls.SECTOR_MAP.get(js, [js])
            for cs in cs_lower:
                if cs in related or js in cs or cs in js:
                    return 1.0
        return 0.2


class CandidateScorer:
    def __init__(self):
        self.skill_matcher = SkillMatcher()
        self.experience_scorer = ExperienceScorer()
        self.qualification_scorer = QualificationScorer()
        self.english_scorer = EnglishScorer()
        self.behavioral_scorer = BehavioralScorer()
        self.location_scorer = LocationScorer()
        self.sector_scorer = SectorScorer()

    def compute_scores(self, candidate: Dict, jd_info: Dict,
                       semantic_sim: float = 0.0) -> Dict[str, float]:
        skills_score = self.skill_matcher.match_skills(
            jd_info.get("skills", []), candidate.get("skills", [])
        )
        exp_score = self.experience_scorer.score(
            jd_info.get("min_years"), jd_info.get("max_years"),
            candidate.get("years_experience"), candidate.get("experience_label", "")
        )
        qual_score = self.qualification_scorer.score(candidate.get("qualification", ""))
        eng_score = self.english_scorer.score(candidate.get("english_level", ""))
        beh_score = self.behavioral_scorer.score(
            candidate.get("is_looking_urgently", False),
            candidate.get("has_resume", False),
            candidate.get("is_mobile_verified", False),
            candidate.get("hot_lead_status", ""),
            candidate.get("last_seen"),
        )
        loc_score = self.location_scorer.score(
            jd_info.get("location", ""),
            candidate.get("city", ""),
            candidate.get("location", ""),
        )
        sec_score = self.sector_scorer.score(
            jd_info.get("sectors", []), candidate.get("sectors", [])
        )

        return {
            "semantic_similarity": float(semantic_sim),
            "skills_match": skills_score,
            "experience_match": exp_score,
            "qualification_match": qual_score,
            "english_proficiency": eng_score,
            "behavioral_signals": beh_score,
            "location_match": loc_score,
            "sector_match": sec_score,
        }

    DEFAULT_WEIGHTS = {
        "semantic_similarity": 0.30,
        "skills_match": 0.20,
        "experience_match": 0.15,
        "qualification_match": 0.10,
        "english_proficiency": 0.05,
        "behavioral_signals": 0.10,
        "location_match": 0.05,
        "sector_match": 0.05,
    }

    def compute_hybrid_score(self, scores: Dict[str, float],
                             weights: Optional[Dict[str, float]] = None) -> float:
        if weights is None:
            weights = self.DEFAULT_WEIGHTS
        total = sum(weights.get(k, 0) * v for k, v in scores.items() if k != "semantic_similarity")
        sem = scores.get("semantic_similarity", 0)
        total += weights.get("semantic_similarity", 0.30) * max(sem, 0)
        return round(min(total, 1.0), 4)

    def generate_explanation(self, scores: Dict[str, float], candidate: Dict) -> Dict:
        """Generate recruiter-friendly strengths, weaknesses, and recommendation."""
        strengths = []
        weaknesses = []
        skill_highlights = []

        dim_names = {
            "semantic_similarity": "Semantic role fit",
            "skills_match": "Skills match",
            "experience_match": "Experience relevance",
            "qualification_match": "Qualification level",
            "english_proficiency": "English proficiency",
            "behavioral_signals": "Recruiter engagement",
            "location_match": "Location match",
            "sector_match": "Sector alignment",
        }

        strong_dims = []
        weak_dims = []
        for key, label in dim_names.items():
            val = scores.get(key, 0)
            if val >= 0.7:
                strong_dims.append((label, val))
            elif val < 0.4:
                weak_dims.append((label, val))

        for label, val in strong_dims[:4]:
            strengths.append(f"Strong {label.lower()} ({val:.0%})")

        for label, val in weak_dims[:3]:
            weaknesses.append(f"Limited {label.lower()} ({val:.0%})")

        if candidate.get("skills"):
            top_skills = sorted(candidate["skills"], key=lambda s: len(s))[:5]
            skill_highlights = top_skills

        if candidate.get("is_looking_urgently"):
            strengths.append("Actively looking — ready to join immediately")
        if candidate.get("has_resume"):
            strengths.append("Resume available for detailed review")
        if candidate.get("is_mobile_verified"):
            strengths.append("Mobile-verified profile")
        if candidate.get("hot_lead_status") == "new_lead":
            strengths.append("Newly registered — high responsiveness expected")

        hybrid = self.compute_hybrid_score(scores)
        if hybrid >= 0.7:
            rec = "Strongly recommended. Closely matches role requirements across multiple dimensions."
            confidence = "High"
        elif hybrid >= 0.5:
            rec = "Recommended. Good fit with some areas for development."
            confidence = "Medium"
        elif hybrid >= 0.3:
            rec = "Consider with caution. May require upskilling or adjustment."
            confidence = "Low"
        else:
            rec = "Not recommended for this role. Low alignment across key dimensions."
            confidence = "Very Low"

        if not strengths:
            strengths.append("No specific strong signals detected")
        if not weaknesses:
            weaknesses.append("No critical gaps identified")

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "skill_highlights": skill_highlights,
            "recommendation": rec,
            "confidence": confidence,
            "hybrid_score": hybrid,
            "top_dimensions": [s[0] for s in strong_dims[:3]],
            "growth_areas": [w[0] for w in weak_dims[:3]],
        }


def extract_jd_info(job_description: str) -> Dict:
    """Parse a job description text to extract structured info."""
    text = job_description.lower()
    info = {
        "title": "",
        "skills": [],
        "sectors": [],
        "location": "",
        "min_years": None,
        "max_years": None,
    }

    lines = job_description.split("\n")
    for line in lines:
        line_s = line.strip()
        if line_s and not info["title"]:
            info["title"] = line_s

    common_skills = [
        "delivery", "driving", "bike", "sales", "cooking", "cleaning",
        "teaching", "security", "customer service", "computer", "ms office",
        "communication", "leadership", "management", "typing", "data entry",
    ]
    for skill in common_skills:
        if skill in text:
            info["skills"].append(skill.title())

    sector_patterns = {
        "delivery": ["delivery", "courier", "logistics"],
        "driver": ["driver", "driving", "transporter"],
        "sales": ["sales", "retail"],
        "security": ["security", "guard"],
        "housekeeping": ["housekeeping", "cleaning", "maid"],
        "teacher": ["teacher", "teaching", "tutor", "instructor"],
        "technician": ["technician", "technician"],
        "cook": ["cook", "chef", "kitchen"],
        "software": ["software", "developer", "it"],
    }
    for sector, keywords in sector_patterns.items():
        if any(kw in text for kw in keywords):
            info["sectors"].append(sector)

    cities = ["mumbai", "delhi", "bangalore", "pune", "hyderabad", "chennai",
              "kolkata", "ahmedabad", "surat", "jaipur", "lucknow", "noida",
              "gurgaon", "indore", "bhopal", "chandigarh"]
    for city in cities:
        if city in text:
            info["location"] = city
            break

    exp_patterns = [
        (r"(\d+)\+?\s*years?\s*(?:of\s*)?(?:exp|experience)", 1),
        (r"(?:exp|experience)\s*(?::|of)\s*(\d+)\+?\s*years?", 1),
        (r"minimum\s*(\d+)\s*years?", 1),
        (r"(\d+)\s*-\s*(\d+)\s*years?", 2),
    ]
    for pattern, groups in exp_patterns:
        m = re.search(pattern, text)
        if m:
            if groups == 1:
                info["min_years"] = float(m.group(1))
            elif groups == 2:
                info["min_years"] = float(m.group(1))
                info["max_years"] = float(m.group(2))
            break

    return info
