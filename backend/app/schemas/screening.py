from __future__ import annotations
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ScreeningMessage(BaseModel):
    role: Literal["ai", "candidate", "system"]
    content: str = Field(min_length=1)
    timestamp: datetime | None = None


class ScreeningRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    messages: list[dict]
    summary: str | None = None
    outcome: str
    started_at: datetime
    completed_at: datetime | None = None
