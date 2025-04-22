import json
import os

import requests

BASE_URL = "http://localhost:7315"


def test_health():
    """Test health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print("\n=== Health Check ===")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")


def test_auth():
    """Test authentication endpoints"""
    print("\n=== User Registration ===")
    register_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    print("\n=== User Login ===")
    login_data = {"email": "test@example.com", "password": "testpass123"}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    # Save the token for later use
    token = response.json()["access_token"]

    print("\n=== Get Current User ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    return token


def test_jobs(token):
    """Test job endpoints"""
    headers = {"Authorization": f"Bearer {token}"}

    print("\n=== Create Job ===")
    job_data = {
        "company_name": "Test Company",
        "role_title": "Software Engineer",
        "vacancy_link": "https://example.com/job",
        "vacancy_text": "This is a test job posting",
        "application_status": "NOT_YET_APPLIED",
        "source": "OTHER",
        "salary_min": 80000,
        "salary_max": 120000,
    }
    response = requests.post(f"{BASE_URL}/api/jobs", json=job_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    job_id = response.json()["id"]

    print("\n=== Get All Jobs ===")
    response = requests.get(f"{BASE_URL}/api/jobs", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    print("\n=== Update Job ===")
    update_data = {
        "application_status": "APPLIED",
        "date_applied": "2024-03-20T12:00:00",
    }
    response = requests.put(
        f"{BASE_URL}/api/jobs/{job_id}", json=update_data, headers=headers
    )
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    # Create a test file for upload
    print("\n=== Upload File ===")
    with open("test_resume.pdf", "w") as f:
        f.write("This is a test resume")

    files = {
        "file": ("test_resume.pdf", open("test_resume.pdf", "rb"), "application/pdf")
    }
    response = requests.post(
        f"{BASE_URL}/api/jobs/{job_id}/files",
        files=files,
        data={"file_type": "resume"},
        headers=headers,
    )
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    print("\n=== Delete Job ===")
    response = requests.delete(f"{BASE_URL}/api/jobs/{job_id}", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {response.json()}")
    except:
        print("Could not parse JSON response")

    # Clean up test file
    os.remove("test_resume.pdf")


def main():
    """Run all tests"""
    test_health()
    token = test_auth()
    test_jobs(token)


if __name__ == "__main__":
    main()
