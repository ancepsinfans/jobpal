#!/bin/bash

# Test health endpoint
echo "Testing health endpoint..."
curl -X GET http://localhost:7315/health

# Test auth endpoints
echo -e "\n\nTesting auth endpoints..."

# Register a new user
echo -e "\nRegistering new user..."
curl -X POST http://localhost:7315/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login and get token
echo -e "\nLogging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:7315/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword"
  }')

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo -e "\nGot token: $TOKEN"

# Test GET jobs (should be empty)
echo -e "\n\nTesting GET /api/jobs..."
curl -X GET http://localhost:7315/api/jobs \
  -H "Authorization: Bearer $TOKEN"

# Test POST job
echo -e "\n\nTesting POST /api/jobs..."
curl -X POST http://localhost:7315/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -F "company_name=Test Company" \
  -F "role_title=Software Engineer" \
  -F "vacancy_link=http://example.com/job" \
  -F "vacancy_text=Job description here" \
  -F "status=applied" \
  -F "date_applied=2024-04-20" \
  -F "next_milestone_date=2024-04-25" \
  -F "salary_min=80000" \
  -F "salary_max=120000" \
  -F "source=linkedin"

# Test GET jobs with filter
echo -e "\n\nTesting GET /api/jobs with filter..."
curl -X GET "http://localhost:7315/api/jobs?company=Test&role=Engineer" \
  -H "Authorization: Bearer $TOKEN"

# Test getting current user
echo -e "\n\nTesting GET /api/auth/me..."
curl -X GET http://localhost:7315/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Note: To test file uploads, you'll need actual files. Here's an example command:
# curl -X POST http://localhost:7315/api/jobs \
#   -H "Authorization: Bearer $TOKEN" \
#   -F "company_name=Test Company" \
#   -F "resume=@/path/to/resume.pdf" \
#   -F "cover_letter=@/path/to/cover_letter.pdf" 