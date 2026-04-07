from __future__ import annotations
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.candidate import CandidateRead
from app.schemas.job import JobRead


ApplicationStatus = Literal["pending", "screening", "interviewed", "rejected", "accepted"]


class ApplicationCreate(BaseModel):
    job_id: uuid.UUID
    candidate_id: uuid.UUID


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    match_score: float | None = None
    skills_overlap: dict | None = None
    status: str
    created_at: datetime
    updated_at: datetime


class ApplicationMatchRead(ApplicationRead):
    job: JobRead
    candidate: CandidateRead
