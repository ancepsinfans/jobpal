#!/usr/bin/env python3

import os
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import create_app
from backend.extensions import db
from backend.models.models import File, Job


def drop_jobs_table():
    """Drop the jobs table and related tables while preserving other tables."""
    app = create_app()

    with app.app_context():
        # Drop the files table first since it depends on jobs
        File.__table__.drop(db.engine)
        print("Files table dropped successfully.")

        # Drop the jobs table
        Job.__table__.drop(db.engine)
        print("Jobs table dropped successfully.")

        # Recreate the tables in the correct order
        Job.__table__.create(db.engine)
        print("Jobs table recreated successfully.")

        File.__table__.create(db.engine)
        print("Files table recreated successfully.")

        print("\nAll tables have been dropped and recreated successfully.")


if __name__ == "__main__":
    drop_jobs_table()
