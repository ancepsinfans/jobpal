from setuptools import find_packages, setup

setup(
    name="jobpal",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "flask",
        "flask-sqlalchemy",
        "flask-jwt-extended",
        "flask-migrate",
        "psycopg2-binary",
        "python-dotenv",
    ],
)
