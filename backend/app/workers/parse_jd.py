from __future__ import annotations

import asyncio
import uuid

from app.database import SessionLocal
from app.models.job import Job
from app.services.ai_parser import parse_job_description
from app.services.embeddings import generate_embedding, job_embedding_text
from app.workers.celery_app import celery_app


@celery_app.task(name="parse_job_description")
def parse_job_description_task(job_id: str) -> dict:
    return asyncio.run(_parse_job_description(uuid.UUID(job_id)))


async def _parse_job_description(job_id: uuid.UUID) -> dict:
    async with SessionLocal() as session:
        job = await session.get(Job, job_id)
        if not job:
            return {"status": "missing", "job_id": str(job_id)}
        parsed = await parse_job_description(job.description)
        skills = job.skills or parsed.get("skills", [])
        job.skills = skills
        job.parsed_data = {**(job.parsed_data or {}), "ai_parse": parsed}
        job.embedding = generate_embedding(job_embedding_text(job.title, job.description, skills))
        await session.commit()
        return {"status": "ok", "job_id": str(job_id)}
