from app.services.matcher import compute_match_score, compute_skills_overlap, cosine_similarity


def test_cosine_similarity_identical_vectors() -> None:
    assert cosine_similarity([1.0, 0.0, 0.0], [1.0, 0.0, 0.0]) == 1.0


def test_skills_overlap_is_case_insensitive() -> None:
    overlap = compute_skills_overlap(["React", "TypeScript", "Python"], ["react", "Docker"])
    assert overlap["matched"] == ["react"]
    assert overlap["missing"] == ["python", "typescript"]
    assert overlap["ratio"] == 0.3333


def test_match_score_weights_skills_and_embeddings() -> None:
    score = compute_match_score([1.0, 0.0], [1.0, 0.0], ["React", "Python"], ["React"])
    assert score == 70.0
