from datetime import datetime
from typing import Optional

from app.models.application import ApplicationStatus
from pydantic import BaseModel, Field


class ApplicationBase(BaseModel):
    """Base schema for job applications."""

    company_name: str = Field(..., description="Name of the company")
    position_title: str = Field(..., description="Title of the position")
    job_description: Optional[str] = Field(None, description="Job description")
    application_url: Optional[str] = Field(
        None, description="URL of the job application"
    )
    status: ApplicationStatus = Field(
        default=ApplicationStatus.DRAFT, description="Current status of the application"
    )
    notes: Optional[str] = Field(
        None, description="Additional notes about the application"
    )
    applied_date: Optional[datetime] = Field(
        None, description="Date when the application was submitted"
    )
    next_interview_date: Optional[datetime] = Field(
        None, description="Date of the next interview"
    )
    salary_range: Optional[str] = Field(
        None, description="Salary range for the position"
    )
    location: Optional[str] = Field(None, description="Location of the position")
    remote_hybrid_onsite: Optional[str] = Field(
        None, description="Work arrangement (remote/hybrid/onsite)"
    )


class ApplicationCreate(ApplicationBase):
    """Schema for creating a new application."""

    pass


class ApplicationUpdate(ApplicationBase):
    """Schema for updating an existing application."""

    company_name: Optional[str] = None
    position_title: Optional[str] = None


class Application(ApplicationBase):
    """Schema for application response."""

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        """Pydantic config."""

        from_attributes = True
