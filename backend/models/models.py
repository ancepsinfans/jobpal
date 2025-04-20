import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from werkzeug.security import check_password_hash, generate_password_hash

from backend.extensions import db
from backend.models.enums import JobSource


class ApplicationStatus(enum.Enum):
    NOT_YET_APPLIED = "not_yet_applied"
    TEST_TASK = "test_task"
    SCREENING_CALL = "screening_call"
    INTERVIEW = "interview"


class JobSource(enum.Enum):
    LINKEDIN = "linkedin"
    INDEED = "indeed"
    COMPANY_WEBSITE = "company_website"
    REFERRAL = "referral"
    OTHER = "other"


class User(db.Model):
    """User model for storing user information"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        """Set the user's password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check if the provided password matches the user's password"""
        return check_password_hash(self.password_hash, password)


class File(db.Model):
    """File model for storing resume and cover letter files"""

    __tablename__ = "files"

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'resume' or 'cover_letter'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_id = Column(Integer, ForeignKey("jobs.id"))
    job = relationship("Job", back_populates="files")


class Job(db.Model):
    """Job model for storing job application information"""

    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    vacancy_link = Column(Text)
    vacancy_text = Column(Text)
    application_status = Column(
        Enum(ApplicationStatus),
        default=ApplicationStatus.NOT_YET_APPLIED,
        nullable=False,
    )
    source = Column(Enum(JobSource), default=JobSource.OTHER)
    date_applied = Column(DateTime)
    next_milestone_date = Column(DateTime)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    telegram_notification_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="jobs")
    files = relationship("File", back_populates="job", cascade="all, delete-orphan")
