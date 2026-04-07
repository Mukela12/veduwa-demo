from __future__ import annotations

import asyncio
import uuid
from pathlib import Path

from app.database import SessionLocal
from app.models.candidate import Candidate
from app.services.ai_parser import parse_resume
from app.services.embeddings import candidate_embedding_text, generate_embedding
from app.workers.celery_app import celery_app


@celery_app.task(name="parse_resume")
def parse_resume_task(candidate_id: str) -> dict:
    return asyncio.run(_parse_resume(uuid.UUID(candidate_id)))


async def _parse_resume(candidate_id: uuid.UUID) -> dict:
    async with SessionLocal() as session:
        candidate = await session.get(Candidate, candidate_id)
        if not candidate:
            return {"status": "missing", "candidate_id": str(candidate_id)}
        resume_text = ""
        if candidate.resume_url and Path(candidate.resume_url).exists():
            resume_text = Path(candidate.resume_url).read_text(errors="ignore")
        parsed = await parse_resume(resume_text or str(candidate.parsed_resume or ""))
        skills = parsed.get("skills") or candidate.skills or []
        candidate.parsed_resume = parsed
        candidate.skills = skills
        candidate.experience_years = parsed.get("experience_years") or candidate.experience_years
        candidate.embedding = generate_embedding(candidate_embedding_text(parsed, skills))
        await session.commit()
        return {"status": "ok", "candidate_id": str(candidate_id)}
