import enum
from datetime import datetime
from typing import Optional

from app.core.database import Base
from sqlalchemy import Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.sql import func


class ApplicationStatus(str, enum.Enum):
    """Enum for application statuses."""

    DRAFT = "draft"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Application(Base):
    """Model for job applications."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    position_title = Column(String, nullable=False)
    job_description = Column(Text)
    application_url = Column(String)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    applied_date = Column(DateTime(timezone=True), nullable=True)
    next_interview_date = Column(DateTime(timezone=True), nullable=True)
    salary_range = Column(String, nullable=True)
    location = Column(String, nullable=True)
    remote_hybrid_onsite = Column(String, nullable=True)
