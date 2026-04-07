from __future__ import annotations

import math
from typing import TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.user import User
from app.schemas.candidate import CandidateRead
from app.schemas.common import Pagination
from app.schemas.job import JobRead


T = TypeVar("T")


def clamp_pagination(page: int, per_page: int) -> tuple[int, int]:
    return max(page, 1), min(max(per_page, 1), 100)


def paginate(items: list[T], page: int, per_page: int) -> tuple[list[T], Pagination]:
    page, per_page = clamp_pagination(page, per_page)
    total = len(items)
    total_pages = max(math.ceil(total / per_page), 1)
    start = (page - 1) * per_page
    end = start + per_page
    return items[start:end], Pagination(page=page, per_page=per_page, total=total, total_pages=total_pages)


async def serialize_job(session: AsyncSession, job: Job) -> JobRead:
    count_result = await session.execute(select(func.count(Application.id)).where(Application.job_id == job.id))
    top_result = await session.execute(select(func.max(Application.match_score)).where(Application.job_id == job.id))
    return JobRead.model_validate(job).model_copy(
        update={
            "candidate_count": count_result.scalar_one() or 0,
            "top_match": top_result.scalar_one_or_none(),
        }
    )


async def serialize_candidate(session: AsyncSession, candidate: Candidate) -> CandidateRead:
    user = await session.get(User, candidate.user_id)
    score_result = await session.execute(select(func.max(Application.match_score)).where(Application.candidate_id == candidate.id))
    status_result = await session.execute(
        select(Application.status)
        .where(Application.candidate_id == candidate.id)
        .order_by(Application.created_at.desc())
        .limit(1)
    )
    parsed_resume = candidate.parsed_resume or {}
    return CandidateRead.model_validate(candidate).model_copy(
        update={
            "full_name": user.full_name if user else None,
            "email": user.email if user else None,
            "avatar_url": user.avatar_url if user else None,
            "title": parsed_resume.get("title"),
            "location": parsed_resume.get("location"),
            "summary": parsed_resume.get("summary"),
            "match_score": score_result.scalar_one_or_none(),
            "status": status_result.scalar_one_or_none() or "pending",
        }
    )
