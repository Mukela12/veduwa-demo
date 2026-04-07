from __future__ import annotations
from typing import Optional
from sqlalchemy import JSON
from sqlalchemy.types import TypeDecorator


# Use JSON for embeddings - compatible with all Postgres setups
# pgvector can be used in production with proper column migration
class Vector(TypeDecorator):
    impl = JSON
    cache_ok = True

    def __init__(self, dimensions: Optional[int] = None) -> None:
        super().__init__()
        self.dimensions = dimensions


__all__ = ["Vector"]
