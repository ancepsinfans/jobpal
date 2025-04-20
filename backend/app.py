from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)

    # Configure database
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql:///jobpal"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "dev"

    # Configure JWT
    app.config["JWT_SECRET_KEY"] = "dev"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 1 day in seconds

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
    from backend.routes import auth_bp, jobs_bp

    app.register_blueprint(jobs_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    @app.route("/health", methods=["GET"])
    def health_check():
        """Health check endpoint"""
        return {"status": "healthy"}, 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7315, debug=True)
