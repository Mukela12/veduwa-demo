from __future__ import annotations
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CandidateCreate(BaseModel):
    user_id: uuid.UUID
    resume_url: str | None = None
    parsed_resume: dict | None = None
    skills: list[str] = Field(default_factory=list)
    experience_years: int | None = Field(default=None, ge=0)


class CandidateUpdate(BaseModel):
    resume_url: str | None = None
    parsed_resume: dict | None = None
    skills: list[str] | None = None
    experience_years: int | None = Field(default=None, ge=0)


class CandidateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None = None
    email: EmailStr | None = None
    avatar_url: str | None = None
    title: str | None = None
    location: str | None = None
    summary: str | None = None
    resume_url: str | None = None
    parsed_resume: dict | None = None
    skills: list[str]
    experience_years: int | None = None
    match_score: float | None = None
    status: str | None = None
    created_at: datetime
    updated_at: datetime
