import os

from extensions import db, jwt, migrate
from flask import Flask
from flask_cors import CORS
from routes import auth_bp, jobs_bp


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)

    # Configure CORS
    CORS(
        app,
        resources={
            r"/*": {
                "origins": os.environ.get(
                    "CORS_ORIGINS", "http://10.0.0.9:5137,https://jobs.homezeug.us"
                ).split(","),
                "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "expose_headers": ["Authorization"],
                "supports_credentials": True,
                "allow_credentials": True,
            }
        },
    )

    # Configure database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "postgresql:///jobpal"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev")

    # Configure JWT
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(
        os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 86400)
    )  # 1 day in seconds
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False
    app.config["JWT_COOKIE_SECURE"] = (
        os.environ.get("ENV", "development") == "production"
    )

    # Configure file uploads
    app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = int(
        os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)
    )  # 16MB max file size

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models after db is initialized
    from models import File, Job, User

    # Register blueprints
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    @app.route("/health", methods=["GET"])
    def health_check():
        """Health check endpoint"""
        return {"status": "healthy"}, 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",  # Bind to all network interfaces
        port=int(os.environ.get("PORT", 7315)),
        debug=os.environ.get("ENV", "development") == "development",
    )
