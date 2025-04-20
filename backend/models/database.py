from sqlalchemy import inspect, text

from backend.extensions import db


def init_db():
    """Initialize the database by dropping and recreating all tables."""
    inspector = inspect(db.engine)
    existing_tables = inspector.get_table_names()

    if existing_tables:
        with db.engine.connect() as conn:
            # Drop all tables with CASCADE
            conn.execute(text("DROP TABLE IF EXISTS users, jobs, files CASCADE"))
            conn.commit()

    # Create all tables
    db.create_all()


def get_db():
    """Get the database session.

    Returns:
        SQLAlchemy.session: The database session
    """
    return db.session
