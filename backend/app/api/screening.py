from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import get_current_user, require_roles
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.screening import Screening
from app.models.user import User
from app.schemas.screening import ScreeningMessage, ScreeningRead
from app.services.screener import stream_screening
from app.services.email import send_screening_summary_email
from app.services.summarizer import generate_screening_summary


router = APIRouter(prefix="/screening", tags=["screening"])


def _candidate_data(candidate: Candidate) -> dict:
    parsed_resume = candidate.parsed_resume or {}
    return {
        "id": str(candidate.id),
        "skills": candidate.skills or [],
        "summary": parsed_resume.get("summary"),
        "title": parsed_resume.get("title"),
    }


def _job_data(job: Job) -> dict:
    return {
        "id": str(job.id),
        "title": job.title,
        "company": job.company,
        "description": job.description,
        "skills": job.skills or [],
        "parsed_data": job.parsed_data or {},
    }


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.get("/active", response_model=ScreeningRead)
async def get_active_screening(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ScreeningRead:
    query = select(Screening).join(Application).join(Job).order_by(Screening.started_at.desc()).limit(1)
    if current_user.role == "employer":
        query = query.where(Job.employer_id == current_user.id)
    else:
        query = query.join(Candidate, Candidate.id == Application.candidate_id).where(Candidate.user_id == current_user.id)

    result = await session.execute(query)
    screening = result.scalar_one_or_none()
    if not screening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active screening found")
    return ScreeningRead.model_validate(screening)


@router.get("/{screening_id}", response_model=ScreeningRead)
async def get_screening(
    screening_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ScreeningRead:
    screening = await session.get(Screening, screening_id)
    if not screening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening not found")
    application = await session.get(Application, screening.application_id)
    job = await session.get(Job, application.job_id) if application else None
    candidate = await session.get(Candidate, application.candidate_id) if application else None
    if not application or not job or not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening relation missing")
    if current_user.role == "employer" and job.employer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view screenings for your own jobs")
    if current_user.role == "candidate" and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view your own screenings")
    return ScreeningRead.model_validate(screening)


@router.post("/{app_id}/start", response_model=ScreeningRead, status_code=status.HTTP_201_CREATED)
async def start_screening(
    app_id: uuid.UUID,
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> ScreeningRead:
    application = await session.get(Application, app_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    job = await session.get(Job, application.job_id)
    candidate = await session.get(Candidate, application.candidate_id)
    if not job or not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application relation missing")
    if job.employer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only screen candidates for your own jobs")

    existing_result = await session.execute(select(Screening).where(Screening.application_id == app_id).order_by(Screening.started_at.desc()))
    existing = existing_result.scalars().first()
    if existing:
        return ScreeningRead.model_validate(existing)

    messages = [
        {
            "role": "system",
            "content": f"AI screening session started for application {application.id}",
            "timestamp": _timestamp(),
        },
        {
            "role": "ai",
            "content": f"Hello. I am the AI interviewer for the {job.title} role at {job.company}. Can you tell me about a project that best demonstrates your fit for this position?",
            "timestamp": _timestamp(),
        },
    ]
    screening = Screening(application_id=application.id, messages=messages, outcome="pending")
    application.status = "screening"
    session.add(screening)
    await session.commit()
    await session.refresh(screening)
    return ScreeningRead.model_validate(screening)


@router.get("/{screening_id}/stream")
async def stream_screening_response(
    screening_id: uuid.UUID,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    screening = await session.get(Screening, screening_id)
    if not screening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening not found")
    application = await session.get(Application, screening.application_id)
    job = await session.get(Job, application.job_id) if application else None
    candidate = await session.get(Candidate, application.candidate_id) if application else None
    if not application or not job or not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening relation missing")

    job_payload = _job_data(job)
    candidate_payload = _candidate_data(candidate)
    messages = list(screening.messages or [])

    async def event_stream():
        async for chunk in stream_screening(job_payload, candidate_payload, messages):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/{screening_id}/message", response_model=ScreeningRead)
async def send_screening_message(
    screening_id: uuid.UUID,
    payload: ScreeningMessage,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ScreeningRead:
    screening = await session.get(Screening, screening_id)
    if not screening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening not found")
    application = await session.get(Application, screening.application_id)
    job = await session.get(Job, application.job_id) if application else None
    candidate = await session.get(Candidate, application.candidate_id) if application else None
    if not application or not job or not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening relation missing")

    messages = list(screening.messages or [])
    messages.append(
        {
            "role": payload.role,
            "content": payload.content,
            "timestamp": (payload.timestamp or datetime.now(timezone.utc)).isoformat(),
        }
    )

    if payload.role == "candidate":
        chunks: list[str] = []
        async for chunk in stream_screening(_job_data(job), _candidate_data(candidate), messages):
            chunks.append(chunk)
        messages.append({"role": "ai", "content": "".join(chunks), "timestamp": _timestamp()})

    screening.messages = messages
    await session.commit()
    await session.refresh(screening)
    return ScreeningRead.model_validate(screening)


@router.post("/{screening_id}/summarize", response_model=ScreeningRead)
async def summarize_screening(
    screening_id: uuid.UUID,
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> ScreeningRead:
    screening = await session.get(Screening, screening_id)
    if not screening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Screening not found")
    application = await session.get(Application, screening.application_id)
    job = await session.get(Job, application.job_id) if application else None
    if not application or not job or job.employer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only summarize screenings for your own jobs")

    screening.summary = await generate_screening_summary(screening.messages or [])
    screening.completed_at = datetime.now(timezone.utc)
    screening.outcome = "pass" if "Proceed" in screening.summary else "pending"
    await session.commit()
    await session.refresh(screening)
    candidate = await session.get(Candidate, application.candidate_id)
    candidate_user = await session.get(User, candidate.user_id) if candidate else None
    await send_screening_summary_email(
        current_user.email,
        current_user.full_name,
        candidate_user.full_name if candidate_user else "Candidate",
        job.title,
        screening.summary,
    )
    return ScreeningRead.model_validate(screening)
