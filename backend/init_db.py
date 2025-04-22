"""Script to initialize the database tables."""

import sys

from sqlalchemy import inspect, text

from backend import create_app
from backend.extensions import db
from backend.models.models import File, Job, User  # noqa


def init_database():
    """Initialize the database by creating tables if they don't exist."""
    try:
        app = create_app()

        with app.app_context():
            print("\n=== Database Initialization ===")
            print(f"Database URL: {db.engine.url}")

            # Check existing tables
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            print(f"\nExisting tables: {existing_tables}")

            # Create all tables if they don't exist
            print("\nCreating tables if they don't exist...")
            db.create_all()

            # Verify tables exist
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"Tables after creation: {tables}")

            if not tables:
                print("\nError: No tables were created!")
                sys.exit(1)

            print("\n=== Database Initialization Complete ===")
            print("Tables verified successfully!")

    except Exception as e:
        print(f"\nError initializing database: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    init_database()
