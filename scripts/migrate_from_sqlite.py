#!/usr/bin/env python3

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import html2text  # Add this import
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.enums import JobSource
from backend.models.models import ApplicationStatus, File, Job, User

# Initialize HTML to Markdown converter
html_converter = html2text.HTML2Text()
html_converter.ignore_links = False
html_converter.ignore_images = True
html_converter.ignore_tables = False
html_converter.ignore_emphasis = False
html_converter.body_width = 0  # Don't wrap text


def ms_to_datetime(ms: Optional[int]) -> Optional[datetime]:
    """
    Convert milliseconds since epoch to datetime.

    Args:
        ms (Optional[int]): Milliseconds since epoch

    Returns:
        Optional[datetime]: Datetime object or None if ms is None
    """
    if ms is None:
        return None
    return datetime.fromtimestamp(ms / 1000)


def get_salary_range(range_code: Optional[str]) -> Optional[Tuple[int, int]]:
    """
    Convert salary range code to min and max values.

    Args:
        range_code (Optional[str]): The salary range code from the old database

    Returns:
        Optional[Tuple[int, int]]: A tuple of (min, max) salary values
    """
    if not range_code:
        return None

    # Mapping of range codes to (min, max) values in thousands
    range_mapping = {
        "1": (0, 10),
        "2": (10, 20),
        "3": (20, 30),
        "4": (30, 40),
        "5": (40, 50),
        "6": (50, 60),
        "7": (60, 70),
        "8": (70, 80),
        "9": (80, 90),
        "10": (90, 100),
        "11": (100, 110),
        "12": (120, 130),
        "13": (130, 140),
        "14": (140, 150),
        "15": (150, 200),
    }

    if range_code not in range_mapping:
        return None

    min_val, max_val = range_mapping[range_code]
    return (min_val * 1000, max_val * 1000)


def get_status_mapping(status_value: Optional[str]) -> str:
    """Map SQLite status values to PostgreSQL enum values.

    Args:
        status_value: The status value from SQLite, can be None

    Returns:
        The corresponding PostgreSQL enum value
    """
    if status_value is None:
        return "not_yet_applied"

    status_mapping = {
        "applied": "applied",
        "rejected": "rejected",
        "test_task": "test_task",
        "screening_call": "screening_call",
        "interview": "interview",
        "offer": "offer",
    }

    return status_mapping.get(status_value.lower(), "not_yet_applied")


def get_source_mapping(source_value: Optional[str]) -> str:
    """
    Map job source values from SQLite to PostgreSQL enum values.

    Args:
        source_value: The source value from SQLite database

    Returns:
        str: The corresponding PostgreSQL enum value
    """
    if source_value is None:
        return "other"

    source_mapping = {
        "indeed": "indeed",
        "linkedin": "linkedin",
        "company_website": "company_website",
        "referral": "referral",
        "other": "other",
    }

    return source_mapping.get(source_value.lower(), "other")


def get_target_db_url() -> str:
    """
    Get the target PostgreSQL database URL.

    Returns:
        str: The database URL for the target PostgreSQL database
    """
    return "postgresql:///jobpal"  # Use local connection without credentials


def proper_case(text: Optional[str]) -> Optional[str]:
    """
    Convert text to proper case (first letter of each word capitalized).

    Args:
        text: The text to convert

    Returns:
        The text in proper case, or None if input is None
    """
    if not text:
        return None
    return " ".join(word.capitalize() for word in text.split())


def migrate_jobs(
    sqlite_session: Session, postgres_session: Session, dry_run: bool = False
) -> List[Dict[str, Any]]:
    """
    Migrate jobs from SQLite to PostgreSQL database.

    Args:
        sqlite_session: SQLite database session
        postgres_session: PostgreSQL database session
        dry_run: If True, only analyze the data without making changes

    Returns:
        List of migration records
    """
    # Query all jobs with their status and source values
    query = text(
        """
        SELECT DISTINCT j.id, j."statusId", j."jobSourceId", j."companyId", j."jobTitleId",
               js.value as status_value, src.value as source_value,
               c.value as company_value, jt.value as job_title_value,
               j.description as vacancy_text, j.jobUrl as vacancy_link,
               j.appliedDate, j.dueDate, j.createdAt,
               j.applied, j."salaryRange"
        FROM "Job" j
        LEFT JOIN "JobStatus" js ON j."statusId" = js.id
        LEFT JOIN "JobSource" src ON j."jobSourceId" = src.id
        LEFT JOIN "Company" c ON j."companyId" = c.id
        LEFT JOIN "JobTitle" jt ON j."jobTitleId" = jt.id
        ORDER BY j."createdAt" DESC
        """
    )
    result = sqlite_session.execute(query)

    migration_data = []
    status_counts = defaultdict(int)
    source_counts = defaultdict(int)

    print("\nMigration Analysis:")
    print("===================")

    # Process each job
    for job_row in result:
        columns = result.keys()
        job_dict = dict(zip(columns, job_row))

        # Map the status to the new enum value
        status_value = job_dict.get("status_value")
        status = get_status_mapping(status_value)

        # Map the source to the new enum value
        source_value = job_dict.get("source_value")
        source = get_source_mapping(source_value)

        # Get salary range as a tuple
        salary_min, salary_max = get_salary_range(job_dict.get("salaryRange"))

        # Count status and source distributions
        status_counts[status] += 1
        source_counts[source] += 1

        # Get company and role title, converting to proper case
        company_name = proper_case(job_dict.get("company_value"))
        role_title = proper_case(job_dict.get("job_title_value"))

        # Get text fields and dates
        vacancy_text = job_dict.get("vacancy_text")
        if vacancy_text:
            # Convert HTML to Markdown
            vacancy_text = html_converter.handle(vacancy_text)
        vacancy_link = job_dict.get("vacancy_link")
        date_applied = (
            ms_to_datetime(job_dict.get("appliedDate"))
            if job_dict.get("applied")
            else None
        )
        next_milestone_date = ms_to_datetime(job_dict.get("dueDate"))
        created_at = ms_to_datetime(job_dict.get("createdAt"))
        # Use created_at for updated_at since we don't have that field
        updated_at = created_at

        # Print job details for verification
        print(f"\nProcessing job: {company_name} - {role_title}")
        print(f"  Status: {status}")
        print(f"  Source: {source}")
        print(
            f"  Vacancy Text: {vacancy_text[:100]}..."
            if vacancy_text
            else "  Vacancy Text: None"
        )
        print(f"  Date Applied: {date_applied}")
        print(f"  Next Milestone: {next_milestone_date}")

        # Create migration record
        migration_record = {
            "source_data": {
                "company": company_name,
                "role": role_title,
                "status": status,
                "source": source,
                "date_applied": date_applied,
                "next_milestone_date": next_milestone_date,
                "salary_min": salary_min,
                "salary_max": salary_max,
                "vacancy_link": vacancy_link,
                "vacancy_text": vacancy_text,
                "telegram_notification_sent": False,  # Default to False since it's a new field
                "created_at": created_at,
                "updated_at": updated_at,
            }
        }
        migration_data.append(migration_record)

    # Print summary
    print("\nStatus Distribution:")
    for status, count in status_counts.items():
        print(f"  {status}: {count}")

    print("\nSource Distribution:")
    for source, count in source_counts.items():
        print(f"  {source}: {count}")

    if not dry_run:
        try:
            # Get the current user's email from the environment
            user_email = os.environ.get("USER_EMAIL")
            if not user_email:
                raise ValueError(
                    "Please set USER_EMAIL environment variable with your email address"
                )

            # Get or create user
            user = postgres_session.query(User).filter_by(email=user_email).first()
            if not user:
                print(f"Creating new user with email: {user_email}")
                user = User(
                    email=user_email,
                    first_name="Migrated",
                    last_name="User",
                    password_hash="",  # Temporary value, will be set by set_password
                )
                user.set_password("migration_password")  # Set a default password
                postgres_session.add(user)
                postgres_session.commit()
                print(f"Created new user with ID: {user.id}")

            # Migrate jobs
            for record in migration_data:
                source_data = record["source_data"]
                job = Job(
                    user_id=user.id,
                    company_name=source_data["company"],
                    role_title=source_data["role"],
                    application_status=ApplicationStatus(source_data["status"]),
                    source=JobSource(source_data["source"]),
                    date_applied=source_data["date_applied"],
                    next_milestone_date=source_data["next_milestone_date"],
                    salary_min=source_data["salary_min"],
                    salary_max=source_data["salary_max"],
                    vacancy_link=source_data["vacancy_link"],
                    vacancy_text=source_data["vacancy_text"],
                    telegram_notification_sent=source_data[
                        "telegram_notification_sent"
                    ],
                    created_at=source_data["created_at"],
                    updated_at=source_data["updated_at"],
                )
                postgres_session.add(job)

            # Commit all changes
            postgres_session.commit()
            print(f"\nSuccessfully migrated {len(migration_data)} jobs")

        except Exception as e:
            postgres_session.rollback()
            print(f"Error during migration: {str(e)}")
            raise

    return migration_data


def main():
    parser = argparse.ArgumentParser(
        description="Migrate data from SQLite to PostgreSQL"
    )
    parser.add_argument("sqlite_path", help="Path to SQLite database")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform a dry run without making changes",
    )
    args = parser.parse_args()

    # Create SQLite engine and session
    sqlite_engine = create_engine(f"sqlite:///{args.sqlite_path}")
    sqlite_session = sessionmaker(bind=sqlite_engine)()

    # Create PostgreSQL engine and session
    postgres_engine = create_engine("postgresql://localhost/jobpal")
    postgres_session = sessionmaker(bind=postgres_engine)()

    try:
        migrate_jobs(sqlite_session, postgres_session, args.dry_run)
    finally:
        sqlite_session.close()
        postgres_session.close()


if __name__ == "__main__":
    main()
