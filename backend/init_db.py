"""Script to initialize the database tables."""

import sys

from sqlalchemy import inspect, text

from backend import create_app
from backend.extensions import db
from backend.models.models import File, Job, User  # noqa


def init_database():
    """Initialize the database by dropping and recreating all tables."""
    try:
        app = create_app()

        with app.app_context():
            print("\n=== Database Initialization ===")
            print(f"Database URL: {db.engine.url}")

            # Check existing tables
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            print(f"\nExisting tables before drop: {existing_tables}")

            # Drop all tables with CASCADE
            print("\nDropping existing tables...")
            with db.engine.connect() as conn:
                conn.execute(text("DROP TABLE IF EXISTS files, jobs, users CASCADE"))
                conn.commit()

            # Check tables after drop
            inspector = inspect(db.engine)
            tables_after_drop = inspector.get_table_names()
            print(f"Tables after drop: {tables_after_drop}")

            # Create all tables
            print("\nCreating tables...")
            db.create_all()

            # Verify tables were created
            inspector = inspect(db.engine)
            new_tables = inspector.get_table_names()
            print(f"Tables after creation: {new_tables}")

            if not new_tables:
                print("\nError: No tables were created!")
                sys.exit(1)

            print("\n=== Database Initialization Complete ===")
            print("Tables created successfully!")

    except Exception as e:
        print(f"\nError initializing database: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    init_database()
