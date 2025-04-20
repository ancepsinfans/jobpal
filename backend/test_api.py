"""Test script for API endpoints."""

import json
import os
from datetime import datetime
from typing import Dict, Optional

import requests

BASE_URL = "http://localhost:7315"


def register_user(
    email: str, password: str, first_name: str, last_name: str
) -> Optional[str]:
    """Register a new user and return the JWT token.

    Args:
        email (str): User's email address
        password (str): User's password
        first_name (str): User's first name
        last_name (str): User's last name

    Returns:
        Optional[str]: JWT token if registration successful, None otherwise
    """
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "email": email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
        },
    )
    print(f"Register response: {response.status_code}")
    print(response.json())
    return response.json().get("access_token")


def login_user(email: str, password: str) -> Optional[str]:
    """Login a user and return the JWT token.

    Args:
        email (str): User's email address
        password (str): User's password

    Returns:
        Optional[str]: JWT token if login successful, None otherwise
    """
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": email, "password": password},
    )
    print(f"Login response: {response.status_code}")
    print(response.json())
    return response.json().get("access_token")


def get_current_user(token: str) -> Dict:
    """Get current user's information.

    Args:
        token (str): JWT token for authentication

    Returns:
        Dict: User information
    """
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Get current user response: {response.status_code}")
    print(response.json())
    return response.json()


def create_job(token: str, job_data: Dict) -> Dict:
    """Create a new job.

    Args:
        token (str): JWT token for authentication
        job_data (Dict): Job data to create

    Returns:
        Dict: Created job data
    """
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    try:
        response = requests.post(
            f"{BASE_URL}/api/jobs",
            json=job_data,
            headers=headers,
        )
        print(f"Create job response: {response.status_code}")
        print(response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating job: {str(e)}")
        return {}


def get_jobs(token: str) -> Dict:
    """Get all jobs for the current user.

    Args:
        token (str): JWT token for authentication

    Returns:
        Dict: List of jobs
    """
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/jobs", headers=headers)
    print(f"Get jobs response: {response.status_code}")
    print(response.json())
    return response.json()


def update_job(token: str, job_id: int, job_data: Dict) -> Dict:
    """Update a job.

    Args:
        token (str): JWT token for authentication
        job_id (int): ID of the job to update
        job_data (Dict): Updated job data

    Returns:
        Dict: Updated job data
    """
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.put(
        f"{BASE_URL}/api/jobs/{job_id}",
        json=job_data,
        headers=headers,
    )
    print(f"Update job response: {response.status_code}")
    print(response.json())
    return response.json()


def delete_job(token: str, job_id: int) -> bool:
    """Delete a job.

    Args:
        token (str): JWT token for authentication
        job_id (int): ID of the job to delete

    Returns:
        bool: True if successful, False otherwise
    """
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{BASE_URL}/api/jobs/{job_id}", headers=headers)
    print(f"Delete job response: {response.status_code}")
    return response.status_code == 204


def upload_file(
    token: str, job_id: int, file_path: str, file_type: str = "application/pdf"
) -> Dict:
    """Upload a file for a job.

    Args:
        token (str): JWT token for authentication
        job_id (int): ID of the job to upload file for
        file_path (str): Path to the file to upload
        file_type (str): MIME type of the file. Defaults to "application/pdf"

    Returns:
        Dict: File information
    """
    headers = {"Authorization": f"Bearer {token}"}

    # Create a test PDF file if it doesn't exist
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write("This is a test PDF file content.")

    try:
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, file_type)}
            data = {"file_type": file_type}
            response = requests.post(
                f"{BASE_URL}/api/jobs/{job_id}/files",
                headers=headers,
                files=files,
                data=data,
            )
        print(f"Upload file response: {response.status_code}")
        print(response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error uploading file: {str(e)}")
        return {}
    finally:
        # Clean up the test file
        if os.path.exists(file_path):
            os.remove(file_path)


def main():
    """Test the API endpoints."""
    # Generate a unique email using timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    email = f"test_{timestamp}@example.com"
    password = "password123"

    print(f"Using email: {email}")

    # Test registration
    token = register_user(
        email=email,
        password=password,
        first_name="Test",
        last_name="User",
    )

    if not token:
        print("Failed to get token from registration")
        return

    # Test login
    token = login_user(email, password)
    if not token:
        print("Failed to get token from login")
        return

    # Test get current user
    get_current_user(token)

    # Test create job with required fields only
    job_data = {
        "company_name": "Test Company",
        "role_title": "Software Engineer",
        "application_status": "not_yet_applied",
    }
    job = create_job(token, job_data)

    # Test get all jobs
    get_jobs(token)

    # Test update job
    if job and "id" in job:
        update_data = {
            "company_name": "Updated Company",
            "role_title": "Updated Role",
            "application_status": "interview",
        }
        update_job(token, job["id"], update_data)

    # Test create job with all fields
    job_data_full = {
        "company_name": "Test Company Full",
        "role_title": "Senior Software Engineer",
        "vacancy_link": "https://example.com/job",
        "vacancy_text": "This is a test job posting",
        "application_status": "interview",
        "source": "linkedin",
        "date_applied": datetime.now().isoformat(),
        "next_milestone_date": datetime.now().isoformat(),
        "salary_min": 80000,
        "salary_max": 120000,
        "telegram_notification_sent": False,
    }
    job_full = create_job(token, job_data_full)

    # Test file upload
    if job_full and "id" in job_full:
        test_file_path = "test_resume.pdf"
        upload_file(token, job_full["id"], test_file_path)

    # Test delete job
    if job_full and "id" in job_full:
        delete_job(token, job_full["id"])


if __name__ == "__main__":
    main()
