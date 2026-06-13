"""Phase 1: Full validation of the candidate ranking pipeline."""
import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.data_loader import (
    load_workindia_candidates,
    load_role_radar_profiles,
    load_job_descriptions,
    load_job_description_text,
)
from src.scorer import extract_jd_info
from src.ranker import CandidateRanker, format_output

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

passed = 0
failed = 0


def check(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  [PASS] {name}" + (f" - {detail}" if detail else ""))
    else:
        failed += 1
        print(f"  [FAIL] {name}" + (f" - {detail}" if detail else ""))


print("=" * 60)
print("PHASE 1: FULL VALIDATION")
print("=" * 60)

# --- Test 1: Module imports (already done) ---
print("\n--- 1.1 Data Loader ---")
candidates_wi = load_workindia_candidates()
check("WorkIndia candidates loaded", len(candidates_wi) == 100, f"got {len(candidates_wi)}")

candidates_rr = load_role_radar_profiles()
check("Role Radar profiles loaded", len(candidates_rr) > 0, f"got {len(candidates_rr)}")

jobs = load_job_descriptions()
check("Job descriptions loaded", len(jobs) > 0, f"got {len(jobs)}")

jd_text = load_job_description_text()
check("Default JD text loaded", len(jd_text) > 0, f"got {len(jd_text)} chars")

# --- Test 2: JD Parsing ---
print("\n--- 1.2 JD Parsing ---")
info = extract_jd_info(jd_text)
check("Title extracted", bool(info["title"]), f"title={info['title']}")
check("Skills extracted", len(info["skills"]) > 0, f"skills={info['skills']}")
check("Sectors extracted", len(info["sectors"]) > 0, f"sectors={info['sectors']}")
check("Location extracted", bool(info["location"]), f"location={info['location']}")

info_empty = extract_jd_info("")
check("Empty JD handled", info_empty["title"] == "")

info_minimal = extract_jd_info("Some random text without JD structure")
check("Minimal JD handled", info_minimal["title"] == "Some random text without JD structure")

# --- Test 3: Normalization ---
print("\n--- 1.3 Candidate Normalization ---")
from src.data_loader import normalize_candidate, build_candidate_text_profile

nc = normalize_candidate(candidates_wi[0])
check("WorkIndia candidate normalized", nc["id"] != "")
check("Normalized has skills list", isinstance(nc["skills"], list))
check("Normalized has source", nc.get("_source") == "workindia")

profile_text = build_candidate_text_profile(nc)
check("Profile text built", len(profile_text) > 0, f"got {len(profile_text)} chars")

# --- Test 4: Ranking Pipeline ---
print("\n--- 1.4 Ranking Pipeline ---")
ranker = CandidateRanker()
ranker.load_job_description(jd_text)
check("JD loaded into ranker", ranker.jd_info["title"] != "")

ranked = ranker.rank(candidates_wi)
check("All candidates ranked", len(ranked) == 100)
check("Scores descending", ranked[0]["overall_score"] >= ranked[-1]["overall_score"],
      f"top={ranked[0]['overall_score']:.4f}, bottom={ranked[-1]['overall_score']:.4f}")
check("Rank 1 has rank=1", ranked[0]["rank"] == 1)
check("Last has rank=100", ranked[-1]["rank"] == 100)
check("Score breakdown exists", "score_breakdown" in ranked[0])
check("Semantic similarity in breakdown", "semantic_similarity" in ranked[0]["score_breakdown"])
check("Skills match in breakdown", "skills_match" in ranked[0]["score_breakdown"])

# --- Test 5: Empty edge cases ---
print("\n--- 1.5 Edge Cases ---")
empty_ranked = ranker.rank([])
check("Empty candidates list", empty_ranked == [])

from src.ranker import format_output
output = format_output(ranked, top_n=10)
check("Top-N filtering (10)", len(output) == 10)

output_all = format_output(ranked, top_n=None)
check("Top-N=None returns all", len(output_all) == 100)

# --- Test 6: JSON serialization ---
print("\n--- 1.6 JSON Output ---")
output_path = os.path.join(OUTPUT_DIR, "test_validation.json")
try:
    with open(output_path, "w") as f:
        json.dump({"job_title": ranker.jd_info.get("title", ""), "ranked_candidates": output}, f, indent=2)
    check("JSON serialization", True, f"written to {output_path}")
    with open(output_path, "r") as f:
        loaded = json.load(f)
    check("JSON re-loaded", len(loaded["ranked_candidates"]) == 10)
except Exception as e:
    check("JSON serialization", False, str(e))

# --- Test 7: Role Radar pipeline ---
print("\n--- 1.7 Role Radar Pipeline ---")
from src.data_loader import load_job_descriptions
jobs = load_job_descriptions()
job = jobs[0]
jd_text2 = job.get("title", "") + "\n" + job.get("description", "")
ranker2 = CandidateRanker()
ranker2.load_job_description(jd_text2)
ranked2 = ranker2.rank(candidates_rr)
check("Role Radar candidates ranked", len(ranked2) > 0, f"got {len(ranked2)}")
check("RR scores valid", ranked2[0]["overall_score"] > 0)

# --- Test 8: CLI entry point ---
print("\n--- 1.8 CLI Module ---")
try:
    import src.main
    check("CLI module imports", True)
except Exception as e:
    check("CLI module imports", False, str(e))

# --- Results ---
print("\n" + "=" * 60)
print(f"RESULTS: {passed} passed, {failed} failed out of {passed + failed}")
print("=" * 60)
sys.exit(0 if failed == 0 else 1)
