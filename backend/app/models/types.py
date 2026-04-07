from __future__ import annotations
from sqlalchemy import JSON
from sqlalchemy.types import TypeDecorator

try:
    from pgvector.sqlalchemy import Vector
except Exception:
    class Vector(TypeDecorator):
        impl = JSON
        cache_ok = True

        def __init__(self, dimensions: int | None = None) -> None:
            super().__init__()
            self.dimensions = dimensions


__all__ = ["Vector"]
