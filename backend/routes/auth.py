import logging
from datetime import timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import check_password_hash, generate_password_hash

from backend.extensions import db
from backend.models.models import User

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    try:
        logger.debug("Starting registration process")
        data = request.get_json()
        logger.debug(f"Received registration data: {data}")

        if not data or not data.get("email") or not data.get("password"):
            logger.warning("Missing email or password in registration request")
            return jsonify({"error": "Missing email or password"}), 400

        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user:
            logger.warning(f"Email {data['email']} already registered")
            return jsonify({"error": "Email already registered"}), 400

        logger.debug("Creating new user object")
        user = User(
            email=data["email"],
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            password_hash="",  # Temporary value, will be set by set_password
        )
        user.set_password(data["password"])

        try:
            logger.debug("Attempting to add user to database")
            db.session.add(user)
            db.session.commit()
            logger.debug("User successfully added to database")
        except SQLAlchemyError as e:
            logger.error(f"Database error during registration: {str(e)}")
            db.session.rollback()
            return jsonify({"error": "Database error occurred"}), 500

        logger.debug("Creating access token")
        access_token = create_access_token(identity=str(user.id))
        logger.debug("Registration successful")
        return jsonify({"access_token": access_token}), 201

    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return jsonify({"error": str(e)}), 500


@bp.route("/login", methods=["POST"])
def login():
    """Login a user."""
    try:
        data = request.get_json()
        logger.debug(f"Login attempt with email: {data.get('email')}")
        logger.debug(f"Request headers: {dict(request.headers)}")

        if not data or not data.get("email") or not data.get("password"):
            logger.warning("Missing email or password in login request")
            return jsonify({"error": "Missing email or password"}), 400

        user = User.query.filter_by(email=data["email"]).first()
        logger.debug(f"Found user: {user is not None}")

        if not user:
            logger.warning(f"No user found with email: {data.get('email')}")
            return jsonify({"error": "Invalid email or password"}), 401

        password_valid = user.check_password(data["password"])
        logger.debug(f"Password valid: {password_valid}")

        if not password_valid:
            logger.warning("Invalid password for user")
            return jsonify({"error": "Invalid email or password"}), 401

        access_token = create_access_token(identity=str(user.id))
        logger.debug("Login successful, token created")

        response = jsonify(
            {
                "access_token": access_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            }
        )

        # Add CORS headers
        origin = request.headers.get("Origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"

        return response, 200

    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": str(e)}), 500


@bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current user's information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        )

    except (ValueError, SQLAlchemyError) as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/refresh", methods=["POST"])
@jwt_required()
def refresh():
    """Refresh access token."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        access_token = create_access_token(identity=str(user.id))
        return jsonify({"access_token": access_token}), 200
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        return jsonify({"error": "Failed to refresh token"}), 500


@bp.route("/update", methods=["PUT"])
@jwt_required()
def update_user():
    """Update current user's information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Update user information
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]

        db.session.commit()
        return jsonify(
            {
                "message": "Profile updated successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            }
        )

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
