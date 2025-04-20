import os
import sys
import uuid
from datetime import datetime

import pytest
from flask import Flask
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import create_app
from backend.models.database import get_db, init_db
from backend.models.models import ApplicationStatus, File, Job, JobSource, User


@pytest.fixture
def app():
    """Create a Flask app for testing."""
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "postgresql:///jobpal",
        }
    )
    return app


@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture
def db_session(app):
    """Create a fresh database for each test."""
    with app.app_context():
        init_db()
        session = get_db()
        yield session
        # Clean up after test
        with app.app_context():
            session.execute(text("DROP TABLE IF EXISTS users, jobs, files CASCADE"))
            session.commit()
            session.close()


def test_database_connection(db_session):
    """Test database connection and model relationships."""
    try:
        # Create a user
        user = User(email="test@example.com")
        user.set_password("test_password")
        db_session.add(user)
        db_session.commit()

        # Add a job
        job = Job(
            user_id=user.id,
            company_name="Test Company",
            role_title="Software Engineer",
            vacancy_text="Job description here",
            application_status=ApplicationStatus.NOT_YET_APPLIED,
            source=JobSource.LINKEDIN,
        )
        db_session.add(job)
        db_session.commit()

        # Create a file
        file = File(
            job_id=job.id,
            filename="resume.pdf",
            file_path="/path/to/resume.pdf",
            file_type="application/pdf",
        )
        db_session.add(file)
        db_session.commit()

        # Verify relationships
        assert job in user.jobs
        assert file in job.files

        # Test cascade delete
        db_session.delete(user)
        db_session.commit()

        # Verify job and file are deleted
        assert db_session.query(Job).filter_by(id=job.id).first() is None
        assert db_session.query(File).filter_by(id=file.id).first() is None

    except Exception as e:
        raise e
    finally:
        db_session.close()


if __name__ == "__main__":
    pytest.main([__file__])
