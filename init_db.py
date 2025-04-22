from backend import create_app, db


def init_db():
    """Initialize the database"""
    app = create_app()
    with app.app_context():
        # Drop all tables
        db.drop_all()
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")


if __name__ == "__main__":
    init_db()
