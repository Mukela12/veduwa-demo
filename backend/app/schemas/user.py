from __future__ import annotations
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: Literal["employer", "candidate"]
    avatar_url: str | None = None
    company_name: str | None = None
    created_at: datetime
    updated_at: datetime


class AuthVerifyRequest(BaseModel):
    token: str


class AuthVerifyResponse(BaseModel):
    valid: bool
    user: UserRead | None = None
