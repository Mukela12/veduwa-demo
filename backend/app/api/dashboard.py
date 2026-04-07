from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import require_roles
from app.models.application import Application
from app.models.job import Job
from app.models.screening import Screening
from app.models.user import User


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def dashboard_stats(
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> dict:
    active_jobs = await session.scalar(select(func.count(Job.id)).where(Job.employer_id == current_user.id, Job.status == "active"))
    total_candidates = await session.scalar(
        select(func.count(Application.id)).join(Job).where(Job.employer_id == current_user.id)
    )
    avg_match = await session.scalar(select(func.avg(Application.match_score)).join(Job).where(Job.employer_id == current_user.id))
    pending_screenings = await session.scalar(
        select(func.count(Screening.id)).join(Application).join(Job).where(Job.employer_id == current_user.id, Screening.outcome == "pending")
    )
    return {
        "active_jobs": active_jobs or 0,
        "activeJobs": active_jobs or 0,
        "total_candidates": total_candidates or 0,
        "totalCandidates": total_candidates or 0,
        "avg_match_score": round(float(avg_match or 0), 1),
        "avgMatchScore": round(float(avg_match or 0), 1),
        "pending_screenings": pending_screenings or 0,
        "pendingScreenings": pending_screenings or 0,
    }


@router.get("/pipeline")
async def dashboard_pipeline(
    current_user: User = Depends(require_roles("employer")),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    result = await session.execute(
        select(Application.status, func.count(Application.id))
        .join(Job)
        .where(Job.employer_id == current_user.id)
        .group_by(Application.status)
    )
    counts = {status: count for status, count in result.all()}
    stages = ["pending", "screening", "interviewed", "accepted", "rejected"]
    labels = {
        "pending": "Applied",
        "screening": "Screening",
        "interviewed": "Interviewed",
        "accepted": "Offered",
        "rejected": "Rejected",
    }
    return [{"stage": labels[stage], "status": stage, "count": counts.get(stage, 0)} for stage in stages]
