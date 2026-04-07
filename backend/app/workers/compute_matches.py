from __future__ import annotations

import asyncio
import uuid

from sqlalchemy import select

from app.database import SessionLocal
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.services.embeddings import candidate_embedding_text, generate_embedding, job_embedding_text
from app.services.matcher import compute_match_score, compute_skills_overlap
from app.workers.celery_app import celery_app


@celery_app.task(name="compute_match_scores")
def compute_match_scores_task(job_id: str | None = None, candidate_id: str | None = None) -> dict:
    return asyncio.run(
        _compute_match_scores(
            uuid.UUID(job_id) if job_id else None,
            uuid.UUID(candidate_id) if candidate_id else None,
        )
    )


async def _compute_match_scores(job_id: uuid.UUID | None, candidate_id: uuid.UUID | None) -> dict:
    async with SessionLocal() as session:
        query = select(Application)
        if job_id:
            query = query.where(Application.job_id == job_id)
        if candidate_id:
            query = query.where(Application.candidate_id == candidate_id)

        result = await session.execute(query)
        applications = list(result.scalars().all())
        updated = 0
        for application in applications:
            job = await session.get(Job, application.job_id)
            candidate = await session.get(Candidate, application.candidate_id)
            if not job or not candidate:
                continue
            if not job.embedding:
                job.embedding = generate_embedding(job_embedding_text(job.title, job.description, job.skills or []))
            if not candidate.embedding:
                candidate.embedding = generate_embedding(candidate_embedding_text(candidate.parsed_resume, candidate.skills or []))
            application.match_score = compute_match_score(job.embedding, candidate.embedding, job.skills or [], candidate.skills or [])
            application.skills_overlap = compute_skills_overlap(job.skills or [], candidate.skills or [])
            updated += 1
        await session.commit()
        return {"status": "ok", "updated": updated}
