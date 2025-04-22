#!/usr/bin/env python3
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from werkzeug.security import generate_password_hash

from backend.app import create_app
from backend.extensions import db
from backend.models.models import File, Job, User


def backup_data():
    """Backup all data from the database"""
    users = User.query.all()
    jobs = Job.query.all()
    files = File.query.all()

    user_data = [
        {
            "email": user.email,
            "password_hash": user.password_hash,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
        }
        for user in users
    ]

    job_data = [
        {
            "user_id": job.user_id,
            "company_name": job.company_name,
            "role_title": job.role_title,
            "vacancy_link": job.vacancy_link,
            "vacancy_text": job.vacancy_text,
            "application_status": job.application_status,
            "source": job.source,
            "date_applied": job.date_applied,
            "next_milestone_date": job.next_milestone_date,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "telegram_notification_sent": job.telegram_notification_sent,
        }
        for job in jobs
    ]

    file_data = [
        {
            "job_id": file.job_id,
            "filename": file.filename,
            "file_path": file.file_path,
            "file_type": file.file_type,
        }
        for file in files
    ]

    return user_data, job_data, file_data


def restore_data(user_data, job_data, file_data):
    """Restore data to the database with updated schema"""
    # First, recreate all users
    email_to_id = {}
    for user_info in user_data:
        user = User(
            email=user_info["email"],
            first_name=user_info["first_name"],
            last_name=user_info["last_name"],
            is_active=user_info["is_active"],
            password_hash=user_info["password_hash"],
        )
        db.session.add(user)
        db.session.flush()  # Get the ID without committing
        email_to_id[user.email] = user.id

    # Then restore jobs
    for job_info in job_data:
        job = Job(
            user_id=job_info["user_id"],
            company_name=job_info["company_name"],
            role_title=job_info["role_title"],
            vacancy_link=job_info["vacancy_link"],
            vacancy_text=job_info["vacancy_text"],
            application_status=job_info["application_status"],
            source=job_info["source"],
            date_applied=job_info["date_applied"],
            next_milestone_date=job_info["next_milestone_date"],
            salary_min=job_info["salary_min"],
            salary_max=job_info["salary_max"],
            telegram_notification_sent=job_info["telegram_notification_sent"],
        )
        db.session.add(job)

    # Finally restore files
    for file_info in file_data:
        file = File(
            job_id=file_info["job_id"],
            filename=file_info["filename"],
            file_path=file_info["file_path"],
            file_type=file_info["file_type"],
        )
        db.session.add(file)

    db.session.commit()


def main():
    """Main function to handle the backup and restore process"""
    app = create_app()
    with app.app_context():
        print("Backing up current data...")
        user_data, job_data, file_data = backup_data()

        print("Dropping all tables...")
        db.drop_all()

        print("Creating tables with new schema...")
        db.create_all()

        print("Restoring data...")
        restore_data(user_data, job_data, file_data)

        print("Done!")


if __name__ == "__main__":
    main()
