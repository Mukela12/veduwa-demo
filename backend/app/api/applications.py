from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.utils import serialize_candidate, serialize_job
from app.database import get_session
from app.middleware.auth import get_current_user, require_roles
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationMatchRead, ApplicationRead, ApplicationStatusUpdate
from app.services.embeddings import candidate_embedding_text, generate_embedding, job_embedding_text
from app.services.email import send_application_received_email
from app.services.matcher import compute_match_score, compute_skills_overlap


router = APIRouter(prefix="/applications", tags=["applications"])


async def _score_application(job: Job, candidate: Candidate) -> tuple[float, dict]:
    if not job.embedding:
        job.embedding = generate_embedding(job_embedding_text(job.title, job.description, job.skills or []))
    if not candidate.embedding:
        candidate.embedding = generate_embedding(candidate_embedding_text(candidate.parsed_resume, candidate.skills or []))
    return (
        compute_match_score(job.embedding, candidate.embedding, job.skills or [], candidate.skills or []),
        compute_skills_overlap(job.skills or [], candidate.skills or []),
    )


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreate,
    current_user: User = Depends(require_roles("candidate")),
    session: AsyncSession = Depends(get_session),
) -> ApplicationRead:
    job = await session.get(Job, payload.job_id)
    candidate = await session.get(Candidate, payload.candidate_id)
    if not job or not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job or candidate not found")
    if candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only apply with your own candidate profile")

    existing_result = await session.execute(
        select(Application).where(Application.job_id == payload.job_id, Application.candidate_id == payload.candidate_id)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        return ApplicationRead.model_validate(existing)

    match_score, overlap = await _score_application(job, candidate)
    application = Application(
        job_id=payload.job_id,
        candidate_id=payload.candidate_id,
        match_score=match_score,
        skills_overlap=overlap,
        status="pending",
    )
    session.add(application)
    await session.commit()
    await session.refresh(application)
    await send_application_received_email(current_user.email, current_user.full_name, job.title, application.match_score)
    return ApplicationRead.model_validate(application)


@router.get("/{application_id}/matches", response_model=ApplicationMatchRead)
async def get_application_match(
    application_id: uuid.UUID,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ApplicationMatchRead:
    application = await session.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    job = await session.get(Job, application.job_id)
    candidate = await session.get(Candidate, application.candidate_id)
    if not job or not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application relation missing")

    return ApplicationMatchRead(
        **ApplicationRead.model_validate(application).model_dump(),
        job=await serialize_job(session, job),
        candidate=await serialize_candidate(session, candidate),
    )


@router.patch("/{application_id}/status", response_model=ApplicationRead)
async def update_application_status(
    application_id: uuid.UUID,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> ApplicationRead:
    application = await session.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    job = await session.get(Job, application.job_id)
    if not job or job.employer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update applications for your own jobs")
    application.status = payload.status
    await session.commit()
    await session.refresh(application)
    return ApplicationRead.model_validate(application)
