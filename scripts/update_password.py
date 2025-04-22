#!/usr/bin/env python3
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from werkzeug.security import generate_password_hash

from backend.app import create_app
from backend.extensions import db
from backend.models.models import User


def update_password():
    """Update password for a specific user"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email="zachary.r.bullard@gmail.com").first()
        if user:
            user.set_password("Sixgun0!")
            db.session.commit()
            print("Password updated successfully!")
        else:
            print("User not found!")


if __name__ == "__main__":
    update_password()
