from enum import Enum


class ApplicationStatus(str, Enum):
    """Enum for job application status"""

    NOT_YET_APPLIED = "not_yet_applied"
    APPLIED = "applied"
    REJECTED = "rejected"
    TEST_TASK = "test_task"
    SCREENING_CALL = "screening_call"
    INTERVIEW = "interview"
    OFFER = "offer"


class JobSource(str, Enum):
    """Enum for job source"""

    LINKEDIN = "linkedin"
    INDEED = "indeed"
    COMPANY_WEBSITE = "company_website"
    REFERRAL = "referral"
    OTHER = "other"
