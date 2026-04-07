from __future__ import annotations

import hashlib
import logging
import math
from typing import Any

from app.config import settings


logger = logging.getLogger(__name__)
_model: Any | None = None


def _hash_embedding(text: str, dimensions: int = 384) -> list[float]:
    if not text:
        return [0.0] * dimensions

    values: list[float] = []
    for index in range(dimensions):
        digest = hashlib.sha256(f"{index}:{text}".encode("utf-8")).digest()
        raw = int.from_bytes(digest[:4], byteorder="big", signed=False)
        values.append((raw / 2**32) * 2 - 1)

    norm = math.sqrt(sum(value * value for value in values))
    if norm == 0:
        return [0.0] * dimensions
    return [round(value / norm, 8) for value in values]


def _load_model() -> Any | None:
    global _model
    if _model is not None:
        return _model

    if not settings.local_embeddings_enabled:
        return None

    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        logger.warning("sentence-transformers is not installed; using hash embeddings")
        return None

    try:
        _model = SentenceTransformer(settings.embedding_model_name)
        return _model
    except Exception:
        logger.exception("Failed to load embedding model; using hash embeddings")
        return None


def generate_embedding(text: str) -> list[float]:
    model = _load_model()
    if model is None:
        return _hash_embedding(text)
    return [float(value) for value in model.encode(text).tolist()]


def job_embedding_text(title: str, description: str, skills: list[str]) -> str:
    return "\n".join([title, description, "Skills: " + ", ".join(skills)])


def candidate_embedding_text(parsed_resume: dict | None, skills: list[str]) -> str:
    parsed_resume = parsed_resume or {}
    chunks = [
        str(parsed_resume.get("name", "")),
        str(parsed_resume.get("title", "")),
        str(parsed_resume.get("summary", "")),
        "Skills: " + ", ".join(skills),
        str(parsed_resume.get("experience", "")),
    ]
    return "\n".join(chunks)
