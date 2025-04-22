import os
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename

from backend.extensions import db
from backend.models.enums import ApplicationStatus, JobSource
from backend.models.models import File, Job, User

bp = Blueprint("jobs", __name__)

# Configure upload folder
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "txt"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_file(file, file_type):
    """Save uploaded file and return File object"""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        file_record = File(filename=filename, file_path=filepath, file_type=file_type)
        db.session.add(file_record)
        db.session.commit()
        return file_record
    return None


@bp.route("/", methods=["GET"])
@jwt_required()
def get_jobs():
    """Get all jobs for the current user"""
    try:
        user_id = int(get_jwt_identity())
        jobs = Job.query.filter_by(user_id=user_id).all()

        return (
            jsonify(
                [
                    {
                        "id": job.id,
                        "company_name": job.company_name,
                        "role_title": job.role_title,
                        "vacancy_link": job.vacancy_link,
                        "vacancy_text": job.vacancy_text,
                        "application_status": job.application_status.value,
                        "source": job.source.value if job.source else None,
                        "date_applied": (
                            job.date_applied.isoformat() if job.date_applied else None
                        ),
                        "next_milestone_date": (
                            job.next_milestone_date.isoformat()
                            if job.next_milestone_date
                            else None
                        ),
                        "salary_min": job.salary_min,
                        "salary_max": job.salary_max,
                        "telegram_notification_sent": job.telegram_notification_sent,
                        "created_at": (
                            job.created_at.isoformat() if job.created_at else None
                        ),
                        "updated_at": (
                            job.updated_at.isoformat() if job.updated_at else None
                        ),
                    }
                    for job in jobs
                ]
            ),
            200,
        )
    except (ValueError, SQLAlchemyError) as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/", methods=["POST"])
@jwt_required()
def create_job():
    """Create a new job"""
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug log
        user_id = int(get_jwt_identity())

        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found. Please log in again."}), 401

        # Validate required fields
        required_fields = ["company_name", "role_title", "application_status"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Debug log the enum values
        print("Application status:", data["application_status"])
        print("Source:", data.get("source"))

        # Create job
        job = Job(
            user_id=user_id,
            company_name=data["company_name"],
            role_title=data["role_title"],
            vacancy_link=data.get("vacancy_link"),
            vacancy_text=data.get("vacancy_text"),
            application_status=ApplicationStatus(data["application_status"]),
            source=JobSource(data["source"]) if "source" in data else JobSource.OTHER,
            date_applied=(
                datetime.fromisoformat(data["date_applied"])
                if data.get("date_applied")
                else None
            ),
            next_milestone_date=(
                datetime.fromisoformat(data["next_milestone_date"])
                if data.get("next_milestone_date")
                else None
            ),
            salary_min=data.get("salary_min"),
            salary_max=data.get("salary_max"),
            telegram_notification_sent=data.get("telegram_notification_sent", False),
        )

        db.session.add(job)
        db.session.commit()

        return (
            jsonify(
                {
                    "id": job.id,
                    "company_name": job.company_name,
                    "role_title": job.role_title,
                    "vacancy_link": job.vacancy_link,
                    "vacancy_text": job.vacancy_text,
                    "application_status": job.application_status.value,
                    "source": job.source.value if job.source else None,
                    "date_applied": (
                        job.date_applied.isoformat() if job.date_applied else None
                    ),
                    "next_milestone_date": (
                        job.next_milestone_date.isoformat()
                        if job.next_milestone_date
                        else None
                    ),
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                    "telegram_notification_sent": job.telegram_notification_sent,
                    "created_at": (
                        job.created_at.isoformat() if job.created_at else None
                    ),
                    "updated_at": (
                        job.updated_at.isoformat() if job.updated_at else None
                    ),
                }
            ),
            201,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error: {str(e)}")  # Log the error
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@bp.route("/<int:job_id>", methods=["PUT", "PATCH"])
@bp.route("/<int:job_id>/", methods=["PUT", "PATCH"])
@jwt_required()
def update_job(job_id):
    """Update a job"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        job = Job.query.filter_by(id=job_id, user_id=user_id).first_or_404()

        # Update fields
        if "company_name" in data:
            job.company_name = data["company_name"]
        if "role_title" in data:
            job.role_title = data["role_title"]
        if "vacancy_link" in data:
            job.vacancy_link = data["vacancy_link"]
        if "vacancy_text" in data:
            job.vacancy_text = data["vacancy_text"]
        if "application_status" in data:
            job.application_status = ApplicationStatus(data["application_status"])
        if "source" in data:
            job.source = JobSource(data["source"]) if data["source"] else None
        if "date_applied" in data:
            job.date_applied = (
                datetime.fromisoformat(data["date_applied"])
                if data["date_applied"]
                else None
            )
        if "next_milestone_date" in data:
            job.next_milestone_date = (
                datetime.fromisoformat(data["next_milestone_date"])
                if data["next_milestone_date"]
                else None
            )
        if "salary_min" in data:
            job.salary_min = data["salary_min"]
        if "salary_max" in data:
            job.salary_max = data["salary_max"]
        if "telegram_notification_sent" in data:
            job.telegram_notification_sent = data["telegram_notification_sent"]

        job.updated_at = datetime.utcnow()
        db.session.commit()

        return (
            jsonify(
                {
                    "id": job.id,
                    "company_name": job.company_name,
                    "role_title": job.role_title,
                    "vacancy_link": job.vacancy_link,
                    "vacancy_text": job.vacancy_text,
                    "application_status": job.application_status.value,
                    "source": job.source.value if job.source else None,
                    "date_applied": (
                        job.date_applied.isoformat() if job.date_applied else None
                    ),
                    "next_milestone_date": (
                        job.next_milestone_date.isoformat()
                        if job.next_milestone_date
                        else None
                    ),
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                    "telegram_notification_sent": job.telegram_notification_sent,
                    "created_at": (
                        job.created_at.isoformat() if job.created_at else None
                    ),
                    "updated_at": (
                        job.updated_at.isoformat() if job.updated_at else None
                    ),
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error: {str(e)}")  # Add debug logging
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@bp.route("/<int:job_id>", methods=["DELETE"])
@bp.route("/<int:job_id>/", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
    """Delete a job"""
    try:
        user_id = get_jwt_identity()
        job = Job.query.filter_by(id=job_id, user_id=user_id).first_or_404()

        db.session.delete(job)
        db.session.commit()

        return "", 204

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error occurred"}), 500


@bp.route("/<int:job_id>/files", methods=["POST"])
@jwt_required()
def upload_file(job_id):
    """Upload a file for a job"""
    try:
        user_id = get_jwt_identity()
        job = Job.query.filter_by(id=job_id, user_id=user_id).first_or_404()

        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        file_type = request.form.get("file_type", "application/pdf")

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        file_record = save_file(file, file_type)
        if not file_record:
            return jsonify({"error": "Invalid file type"}), 400

        job.files.append(file_record)
        db.session.commit()

        return (
            jsonify(
                {
                    "id": file_record.id,
                    "filename": file_record.filename,
                    "file_type": file_record.file_type,
                    "created_at": (
                        file_record.created_at.isoformat()
                        if file_record.created_at
                        else None
                    ),
                }
            ),
            201,
        )

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error occurred"}), 500


@bp.route("/<int:job_id>", methods=["GET"])
@bp.route("/<int:job_id>/", methods=["GET"])
@jwt_required()
def get_job(job_id):
    """Get a single job by ID"""
    try:
        user_id = get_jwt_identity()
        job = Job.query.filter_by(id=job_id, user_id=user_id).first_or_404()

        return (
            jsonify(
                {
                    "id": job.id,
                    "company_name": job.company_name,
                    "role_title": job.role_title,
                    "vacancy_link": job.vacancy_link,
                    "vacancy_text": job.vacancy_text,
                    "application_status": job.application_status.value,
                    "source": job.source.value if job.source else None,
                    "date_applied": (
                        job.date_applied.isoformat() if job.date_applied else None
                    ),
                    "next_milestone_date": (
                        job.next_milestone_date.isoformat()
                        if job.next_milestone_date
                        else None
                    ),
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                    "telegram_notification_sent": job.telegram_notification_sent,
                    "created_at": (
                        job.created_at.isoformat() if job.created_at else None
                    ),
                    "updated_at": (
                        job.updated_at.isoformat() if job.updated_at else None
                    ),
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except SQLAlchemyError as e:
        print(f"Database error: {str(e)}")  # Add debug logging
        return jsonify({"error": f"Database error: {str(e)}"}), 500
