#!/usr/bin/env python3

import os
import sys
from typing import Dict, List, Set

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.enums import ApplicationStatus, JobSource
from backend.models.models import Job


def get_table_info(session, table_name: str) -> Dict:
    """Get table structure and sample data."""
    try:
        # Get table structure
        result = session.execute(text(f'PRAGMA table_info("{table_name}")')).fetchall()
        columns = [row[1] for row in result]  # Column names are in position 1
        print(f"\n{table_name} table columns:", columns)

        # Get sample data
        sample_data = session.execute(
            text(f'SELECT * FROM "{table_name}" LIMIT 3')
        ).fetchall()
        if sample_data:
            print(f"\nSample {table_name} records:")
            for row in sample_data:
                print(f"  {dict(zip(columns, row))}")

        return {"columns": columns, "sample_data": sample_data}
    except Exception as e:
        print(f"Error inspecting {table_name}: {e}")
        return {"columns": [], "sample_data": []}


def inspect_sqlite_db(sqlite_path: str) -> Dict:
    """Inspect SQLite database structure and sample values."""
    engine = create_engine(f"sqlite:///{sqlite_path}")
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Get list of all tables
        tables = session.execute(
            text("SELECT name FROM sqlite_master WHERE type='table'")
        ).fetchall()
        print("\n=== Tables in Database ===")
        for table in tables:
            print(f"  - {table[0]}")

        # Inspect Job table
        print("\n=== Job Table Structure ===")
        job_info = get_table_info(session, "Job")

        # Inspect related tables
        print("\n=== Related Tables ===")
        related_tables = {
            "JobStatus": get_table_info(session, "JobStatus"),
            "JobSource": get_table_info(session, "JobSource"),
            "JobTitle": get_table_info(session, "JobTitle"),
            "Company": get_table_info(session, "Company"),
            "Location": get_table_info(session, "Location"),
            "Resume": get_table_info(session, "Resume"),
        }

        # Get sample complete job records with joined data
        print("\n=== Sample Job Records with Related Data ===")
        # Build the JOIN clauses based on the tables that exist
        join_clauses = []
        select_fields = ["j.*"]

        for table, info in related_tables.items():
            if info["columns"]:  # If table exists and has columns
                table_alias = table.lower()[:3]  # First 3 letters as alias
                join_field = f'j."{table.lower()}Id"'  # Assuming consistent naming
                select_fields.append(f"{table_alias}.* as {table.lower()}_data")
                join_clauses.append(
                    f'LEFT JOIN "{table}" {table_alias} ON {join_field} = {table_alias}.id'
                )

        query = f"""
            SELECT {', '.join(select_fields)}
            FROM "Job" j
            {' '.join(join_clauses)}
            LIMIT 3
        """

        try:
            sample_jobs = session.execute(text(query)).fetchall()
            if sample_jobs:
                print("\nSample jobs with related data:")
                for job in sample_jobs:
                    print("\nJob Record:")
                    job_dict = dict(zip(job.keys(), job))
                    for key, value in job_dict.items():
                        print(f"  {key}: {value}")
        except Exception as e:
            print(f"Error fetching sample jobs: {e}")

        # Get date ranges
        print("\n=== Date Ranges ===")
        date_ranges = session.execute(
            text(
                """
            SELECT 
                MIN("createdAt") as earliest_created,
                MAX("createdAt") as latest_created,
                MIN("appliedDate") as earliest_applied,
                MAX("appliedDate") as latest_applied,
                MIN("dueDate") as earliest_due,
                MAX("dueDate") as latest_due
            FROM "Job"
        """
            )
        ).fetchone()

        if date_ranges:
            print(f"Created: {date_ranges[0]} to {date_ranges[1]}")
            print(f"Applied: {date_ranges[2]} to {date_ranges[3]}")
            print(f"Due dates: {date_ranges[4]} to {date_ranges[5]}")

        # Get salary range formats
        print("\n=== Salary Range Formats ===")
        salary_samples = session.execute(
            text(
                """
            SELECT DISTINCT "salaryRange"
            FROM "Job"
            WHERE "salaryRange" IS NOT NULL
            LIMIT 5
        """
            )
        ).fetchall()

        if salary_samples:
            print("Sample salary range formats:")
            for salary in salary_samples:
                print(f"  - {salary[0]}")

        return {
            "tables": {name[0]: related_tables.get(name[0], {}) for name in tables},
            "job_columns": job_info["columns"],
        }

    finally:
        session.close()


def suggest_mappings():
    """Suggest mappings between old and new schemas."""
    print("\n=== Suggested Mappings ===")

    print("\nApplication Status Mapping:")
    print("The new schema accepts these values:")
    for status in ApplicationStatus:
        print(f"  - {status.value}")

    print("\nJob Source Mapping:")
    print("The new schema accepts these values:")
    for source in JobSource:
        print(f"  - {source.value}")

    print("\nField Mappings:")
    print(
        """
    Old Schema -> New Schema
    -------------------
    jobUrl -> vacancy_link
    description -> vacancy_text
    applied + appliedDate -> application_status (logic needed)
    statusId -> application_status (via JobStatus table)
    jobTitleId -> role_title (via JobTitle table)
    companyId -> company_name (via Company table)
    jobSourceId -> source (via JobSource table)
    salaryRange -> salary_min, salary_max (parsing needed)
    """
    )


def main():
    """Main entry point for database inspection."""
    if len(sys.argv) != 2:
        print("Usage: python inspect_db_values.py path/to/dev.db")
        sys.exit(1)

    sqlite_path = sys.argv[1]
    if not os.path.exists(sqlite_path):
        print(f"Error: SQLite database file not found: {sqlite_path}")
        sys.exit(1)

    print(f"Inspecting database: {sqlite_path}")
    source_data = inspect_sqlite_db(sqlite_path)
    suggest_mappings()


if __name__ == "__main__":
    main()
