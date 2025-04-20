from flask import Flask, jsonify

from backend.extensions import db, jwt, migrate
from backend.routes import auth_bp, jobs_bp


def create_app(test_config=None):
    """Create and configure the Flask application.

    Args:
        test_config (dict, optional): Test configuration to override defaults. Defaults to None.

    Returns:
        Flask: The configured Flask application instance.
    """
    app = Flask(__name__)

    # Configure the Flask app
    app.config.from_mapping(
        SECRET_KEY="dev",
        SQLALCHEMY_DATABASE_URI="postgresql:///jobpal",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="dev",
        UPLOAD_FOLDER="uploads",
    )

    if test_config is not None:
        app.config.update(test_config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Create all tables
    with app.app_context():
        # Import models to ensure they are registered with SQLAlchemy
        from backend.models.models import File, Job, User  # noqa

        db.create_all()

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")

    @app.route("/health")
    def health_check():
        """Health check endpoint."""
        return jsonify({"status": "Jobpal API is running!"})

    return app
