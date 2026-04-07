from __future__ import annotations
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


JobType = Literal["full_time", "contract", "remote"]
Seniority = Literal["junior", "mid", "senior", "lead"]
JobStatus = Literal["draft", "active", "closed"]


class JobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    company: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10)
    location: str | None = None
    job_type: JobType = "full_time"
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    seniority: Seniority = "mid"
    skills: list[str] = Field(default_factory=list)
    status: JobStatus = "active"
    screening_questions: list[str] = Field(default_factory=list)
    auto_match: bool = True
    match_threshold: int = Field(default=70, ge=0, le=100)


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    company: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, min_length=10)
    location: str | None = None
    job_type: JobType | None = None
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    seniority: Seniority | None = None
    skills: list[str] | None = None
    status: JobStatus | None = None
    screening_questions: list[str] | None = None
    auto_match: bool | None = None
    match_threshold: int | None = Field(default=None, ge=0, le=100)


class JobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employer_id: uuid.UUID
    title: str
    company: str
    description: str
    location: str | None = None
    job_type: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    seniority: str | None = None
    skills: list[str]
    parsed_data: dict | None = None
    status: str
    candidate_count: int = 0
    top_match: float | None = None
    created_at: datetime
    updated_at: datetime
