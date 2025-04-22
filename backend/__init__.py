import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from backend.extensions import db
from backend.routes import auth, files, jobs


def create_app(test_config=None):
    """Create and configure the Flask application.

    Args:
        test_config (dict, optional): Test configuration to override defaults. Defaults to None.

    Returns:
        Flask: The configured Flask application instance.
    """
    app = Flask(__name__)

    # Configure CORS
    CORS(
        app,
        resources={
            r"/*": {
                "origins": os.getenv("CORS_ORIGINS").split(","),
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
            }
        },
    )

    # Configure database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@db:5432/jobpal"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Configure JWT
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = (
        int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440)) * 60
    )

    if test_config is not None:
        app.config.update(test_config)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)

    # Create all tables
    with app.app_context():
        # Import models to ensure they are registered with SQLAlchemy
        from backend.models.models import File, Job, User  # noqa

        db.create_all()

    # Register blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(jobs.bp)
    app.register_blueprint(files.bp)

    @app.route("/health")
    def health_check():
        """Health check endpoint."""
        return jsonify({"status": "Jobpal API is running!"})

    return app
