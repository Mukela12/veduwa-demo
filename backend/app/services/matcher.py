from __future__ import annotations

import math


def cosine_similarity(left: list[float] | None, right: list[float] | None) -> float:
    if not left or not right:
        return 0.0

    length = min(len(left), len(right))
    if length == 0:
        return 0.0

    dot = sum(left[index] * right[index] for index in range(length))
    left_norm = math.sqrt(sum(left[index] * left[index] for index in range(length)))
    right_norm = math.sqrt(sum(right[index] * right[index] for index in range(length)))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (left_norm * right_norm)))


def compute_skills_overlap(job_skills: list[str] | None, candidate_skills: list[str] | None) -> dict:
    job_set = {skill.strip().lower() for skill in (job_skills or []) if skill.strip()}
    candidate_set = {skill.strip().lower() for skill in (candidate_skills or []) if skill.strip()}
    matched = sorted(job_set & candidate_set)
    missing = sorted(job_set - candidate_set)
    denominator = max(len(job_set), 1)
    return {
        "matched": matched,
        "missing": missing,
        "matched_count": len(matched),
        "required_count": len(job_set),
        "ratio": round(len(matched) / denominator, 4),
    }


def compute_match_score(
    job_embedding: list[float] | None,
    candidate_embedding: list[float] | None,
    job_skills: list[str] | None,
    candidate_skills: list[str] | None,
) -> float:
    semantic_score = cosine_similarity(job_embedding, candidate_embedding)
    overlap = compute_skills_overlap(job_skills, candidate_skills)["ratio"]
    return round((semantic_score * 0.4 + overlap * 0.6) * 100, 1)
