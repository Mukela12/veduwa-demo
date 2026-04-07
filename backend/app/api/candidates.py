from __future__ import annotations

import re
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.utils import paginate, serialize_candidate
from app.config import settings
from app.database import get_session
from app.middleware.auth import get_current_user
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.candidate import CandidateRead, CandidateUpdate
from app.schemas.common import Page
from app.services.ai_parser import parse_resume
from app.services.embeddings import candidate_embedding_text, generate_embedding
from app.services.storage import store_upload


router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.get("/me", response_model=CandidateRead)
async def get_my_candidate_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CandidateRead:
    result = await session.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalar_one_or_none()
    if candidate is None:
        if current_user.role != "candidate":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Current user does not have a candidate profile")
        candidate = Candidate(user_id=current_user.id, skills=[], parsed_resume={})
        session.add(candidate)
        await session.commit()
        await session.refresh(candidate)
    return await serialize_candidate(session, candidate)


@router.post("/me", response_model=CandidateRead)
async def upsert_my_candidate_profile(
    payload: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CandidateRead:
    if current_user.role != "candidate":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only candidate users can manage a candidate profile")

    result = await session.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalar_one_or_none()
    if candidate is None:
        candidate = Candidate(user_id=current_user.id, skills=[], parsed_resume={})
        session.add(candidate)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(candidate, key, value)
    if candidate.skills:
        candidate.embedding = generate_embedding(candidate_embedding_text(candidate.parsed_resume, candidate.skills))

    await session.commit()
    await session.refresh(candidate)
    return await serialize_candidate(session, candidate)


@router.get("", response_model=Page[CandidateRead])
async def list_candidates(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    skills: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Page[CandidateRead]:
    query = select(Candidate).join(User)
    if search:
        pattern = f"%{search}%"
        query = query.where(or_(User.full_name.ilike(pattern), User.email.ilike(pattern)))
    query = query.order_by(Candidate.created_at.desc())
    result = await session.execute(query)
    candidates = list(result.scalars().all())

    if skills:
        requested = {skill.strip().lower() for skill in skills.split(",") if skill.strip()}
        candidates = [candidate for candidate in candidates if requested & {skill.lower() for skill in (candidate.skills or [])}]

    serialized = [await serialize_candidate(session, candidate) for candidate in candidates]
    if status_filter:
        serialized = [candidate for candidate in serialized if candidate.status == status_filter]

    page_items, pagination = paginate(serialized, page, per_page)
    return Page(data=page_items, pagination=pagination)


@router.get("/{candidate_id}", response_model=CandidateRead)
async def get_candidate(
    candidate_id: uuid.UUID,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CandidateRead:
    candidate = await session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return await serialize_candidate(session, candidate)


@router.post("/{candidate_id}/resume", response_model=CandidateRead)
async def upload_resume(
    candidate_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CandidateRead:
    candidate = await session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    if current_user.role == "candidate" and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only upload your own resume")

    contents = await file.read()
    filename = re.sub(r"[^A-Za-z0-9_.-]", "_", file.filename or "resume.txt")
    stored = await store_upload(
        contents,
        f"{candidate.id}_{filename}",
        file.content_type or "application/octet-stream",
        folder=f"{settings.cloudinary_folder}/resumes",
    )

    resume_text = contents.decode("utf-8", errors="ignore") or f"Resume file: {filename}"
    parsed_resume = await parse_resume(resume_text)
    skills = parsed_resume.get("skills") or candidate.skills or []
    candidate.resume_url = stored.file_url
    candidate.parsed_resume = parsed_resume
    candidate.skills = skills
    candidate.experience_years = parsed_resume.get("experience_years") or candidate.experience_years
    candidate.embedding = generate_embedding(candidate_embedding_text(parsed_resume, skills))

    await session.commit()
    await session.refresh(candidate)
    return await serialize_candidate(session, candidate)
