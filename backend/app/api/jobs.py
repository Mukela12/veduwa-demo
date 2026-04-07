from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.utils import paginate, serialize_job
from app.database import get_session
from app.middleware.auth import require_roles
from app.models.job import Job
from app.models.user import User
from app.schemas.common import Page
from app.schemas.job import JobCreate, JobRead, JobUpdate
from app.services.ai_parser import parse_job_description
from app.services.embeddings import generate_embedding, job_embedding_text
from app.services.email import send_job_posted_email


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=Page[JobRead])
async def list_jobs(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    skills: str | None = None,
    job_type: str | None = None,
    seniority: str | None = None,
    status_filter: str | None = Query(default="active", alias="status"),
    sort: str = "created_at",
    order: str = "desc",
    session: AsyncSession = Depends(get_session),
) -> Page[JobRead]:
    query = select(Job)
    if status_filter:
        query = query.where(Job.status == status_filter)
    if job_type:
        query = query.where(Job.job_type == job_type)
    if seniority:
        query = query.where(Job.seniority == seniority)
    if search:
        pattern = f"%{search}%"
        query = query.where(or_(Job.title.ilike(pattern), Job.company.ilike(pattern), Job.description.ilike(pattern)))

    sort_column = {"created_at": Job.created_at, "title": Job.title, "company": Job.company}.get(sort, Job.created_at)
    query = query.order_by(sort_column.asc() if order == "asc" else sort_column.desc())
    result = await session.execute(query)
    jobs = list(result.scalars().all())

    if skills:
        requested = {skill.strip().lower() for skill in skills.split(",") if skill.strip()}
        jobs = [job for job in jobs if requested & {skill.lower() for skill in (job.skills or [])}]

    page_items, pagination = paginate(jobs, page, per_page)
    return Page(data=[await serialize_job(session, job) for job in page_items], pagination=pagination)


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreate,
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> JobRead:
    parsed_data = await parse_job_description(payload.description)
    skills = payload.skills or parsed_data.get("skills", [])
    salary_range = parsed_data.get("salary_range") or {}
    salary_min = payload.salary_min if payload.salary_min is not None else salary_range.get("min")
    salary_max = payload.salary_max if payload.salary_max is not None else salary_range.get("max")
    parsed_data["ai_config"] = {
        "screening_questions": payload.screening_questions,
        "auto_match": payload.auto_match,
        "match_threshold": payload.match_threshold,
    }

    job = Job(
        employer_id=current_user.id,
        title=payload.title,
        company=payload.company,
        description=payload.description,
        location=payload.location,
        job_type=payload.job_type,
        salary_min=salary_min,
        salary_max=salary_max,
        seniority=payload.seniority or parsed_data.get("seniority"),
        skills=skills,
        parsed_data=parsed_data,
        embedding=generate_embedding(job_embedding_text(payload.title, payload.description, skills)),
        status=payload.status,
    )
    session.add(job)
    await session.commit()
    await session.refresh(job)
    await send_job_posted_email(current_user.email, current_user.full_name, job.title, str(job.id))
    return await serialize_job(session, job)


@router.get("/{job_id}", response_model=JobRead)
async def get_job(job_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> JobRead:
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return await serialize_job(session, job)


@router.patch("/{job_id}", response_model=JobRead)
async def update_job(
    job_id: uuid.UUID,
    payload: JobUpdate,
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> JobRead:
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.employer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own jobs")

    data = payload.model_dump(exclude_unset=True)
    ai_config = {key: data.pop(key) for key in ["screening_questions", "auto_match", "match_threshold"] if key in data}
    for key, value in data.items():
        setattr(job, key, value)

    if ai_config:
        parsed_data = job.parsed_data or {}
        parsed_data["ai_config"] = {**parsed_data.get("ai_config", {}), **ai_config}
        job.parsed_data = parsed_data
    if any(field in data for field in ["title", "description", "skills"]):
        job.embedding = generate_embedding(job_embedding_text(job.title, job.description, job.skills or []))

    await session.commit()
    await session.refresh(job)
    return await serialize_job(session, job)


@router.delete("/{job_id}", response_model=JobRead)
async def close_job(
    job_id: uuid.UUID,
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> JobRead:
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.employer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only close your own jobs")
    job.status = "closed"
    await session.commit()
    await session.refresh(job)
    return await serialize_job(session, job)
