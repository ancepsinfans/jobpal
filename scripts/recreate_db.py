#!/usr/bin/env python3

import os
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import create_app
from backend.extensions import db
from backend.models.models import File, Job, User


def recreate_db():
    """Recreate all database tables."""
    app = create_app()

    with app.app_context():
        # Drop all tables
        db.drop_all()

        # Create all tables
        db.create_all()

        print("Database tables have been recreated successfully.")


if __name__ == "__main__":
    recreate_db()
