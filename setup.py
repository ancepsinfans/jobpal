from setuptools import find_packages, setup

setup(
    name="jobpal",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "flask",
        "flask-sqlalchemy",
        "flask-migrate",
        "flask-jwt-extended",
        "flask-cors",
        "psycopg2-binary",
        "python-dotenv",
        "gunicorn",
    ],
)
