import json
import os
import sys
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.data_loader import (
    load_workindia_candidates,
    load_role_radar_profiles,
    load_job_description_text,
    load_job_descriptions,
)
from src.ranker import CandidateRanker, format_output

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")


def run_pipeline(
    jd_text: str,
    candidate_source: str = "workindia",
    top_n: Optional[int] = None,
    output_file: str = "ranked_candidates.json",
) -> list:
    ranker = CandidateRanker()

    print(f"[1/4] Loading job description...")
    ranker.load_job_description(jd_text)
    print(f"  Title: {ranker.jd_info.get('title', 'N/A')}")
    print(f"  Location: {ranker.jd_info.get('location', 'N/A')}")
    print(f"  Skills: {ranker.jd_info.get('skills', [])}")
    print(f"  Sectors: {ranker.jd_info.get('sectors', [])}")
    print(f"  Min Years: {ranker.jd_info.get('min_years')}")

    print(f"\n[2/4] Loading candidates ({candidate_source})...")
    if candidate_source == "workindia":
        candidates = load_workindia_candidates()
    elif candidate_source == "role_radar":
        candidates = load_role_radar_profiles()
    else:
        raise ValueError(f"Unknown source: {candidate_source}")
    print(f"  Loaded {len(candidates)} candidates")

    print(f"\n[3/4] Ranking candidates...")
    ranked = ranker.rank(candidates)
    print(f"  Ranked {len(ranked)} candidates")

    output = format_output(ranked, top_n=top_n)
    print(f"\n  Top {len(output)} candidates:")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if os.path.isabs(output_file):
        output_path = output_file
    else:
        output_path = os.path.join(OUTPUT_DIR, os.path.basename(output_file))
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"job_title": ranker.jd_info.get("title", ""), "ranked_candidates": output},
                  f, indent=2, ensure_ascii=False)
    print(f"\n  Results saved to: {output_path}")

    for r in output[:10]:
        name_str = str(r['name']) if not isinstance(r['name'], str) else r['name']
        print(f"  #{r['rank']} {name_str:35s} Score: {r['overall_score']:.4f}")

    return ranked


def run_with_jd_from_dataset(jd_index: int = 0, top_n: Optional[int] = None):
    jobs = load_job_descriptions()
    if jd_index >= len(jobs):
        print(f"Only {len(jobs)} jobs available, using index 0")
        jd_index = 0
    job = jobs[jd_index]
    jd_text = f"{job.get('title', '')}\n\n{job.get('description', '')}"
    jd_text += f"\n\nLocation: {job.get('location', '')}"
    return run_pipeline(jd_text, candidate_source="role_radar", top_n=top_n,
                        output_file=f"ranked_job_{jd_index}.json")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="AI Candidate Ranking System")
    parser.add_argument("--source", choices=["workindia", "role_radar", "jd_dataset"],
                        default="workindia", help="Candidate data source")
    parser.add_argument("--jd", type=str, default=None,
                        help="Path to job description file (default: data/job_description.txt)")
    parser.add_argument("--jd-index", type=int, default=0,
                        help="Index of job in dataset (for jd_dataset source)")
    parser.add_argument("--top-n", type=int, default=None,
                        help="Number of top candidates to output")
    parser.add_argument("--output", type=str, default="ranked_candidates.json",
                        help="Output file name")
    args = parser.parse_args()

    if args.source == "jd_dataset":
        run_with_jd_from_dataset(jd_index=args.jd_index, top_n=args.top_n)
    else:
        jd_path = args.jd
        jd_text = ""
        if jd_path and os.path.exists(jd_path):
            with open(jd_path, "r", encoding="utf-8") as f:
                jd_text = f.read()
        else:
            jd_text = load_job_description_text()
            if not jd_text:
                jd_text = (
                    "Delivery Executive - Mumbai\n\nWe are looking for a Delivery Executive "
                    "in Mumbai. Must have bike, valid license, and 1+ year experience."
                )
        run_pipeline(jd_text, candidate_source=args.source, top_n=args.top_n, output_file=args.output)
