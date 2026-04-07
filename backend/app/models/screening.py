from __future__ import annotations
import uuid

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Screening(Base):
    __tablename__ = "screenings"
    __table_args__ = (
        CheckConstraint("outcome IN ('pass', 'fail', 'pending')", name="screening_outcome_valid"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False, index=True)
    messages: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"), default=list)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    outcome: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pending", default="pending", index=True)
    started_at = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = mapped_column(DateTime(timezone=True), nullable=True)

    application = relationship("Application", back_populates="screenings")
