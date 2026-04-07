from __future__ import annotations
from typing import Generic, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class Pagination(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class Page(BaseModel, Generic[T]):
    data: list[T]
    pagination: Pagination


class ErrorResponse(BaseModel):
    detail: str
    code: str = Field(default="ERROR")
