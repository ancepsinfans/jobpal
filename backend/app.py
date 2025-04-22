from flask import Flask
from flask_cors import CORS

from backend.extensions import db, jwt, migrate
from backend.routes import auth_bp, jobs_bp


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)

    # Configure CORS
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5137", "http://localhost:5173"],
                "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "expose_headers": ["Authorization"],
                "supports_credentials": True,
                "allow_credentials": True,
            }
        },
    )

    # Configure database
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql:///jobpal"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "dev"

    # Configure JWT
    app.config["JWT_SECRET_KEY"] = "dev"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 1 day in seconds
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False
    app.config["JWT_COOKIE_SECURE"] = False  # Set to True in production

    # Configure file uploads
    app.config["UPLOAD_FOLDER"] = "uploads"
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models after db is initialized
    from backend.models import File, Job, User

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
    app.run(host="0.0.0.0", port=7315, debug=True)
