# JobPal - Job Application Management System

A Dockerized application for managing job applications, built with React and Flask.

## Project Structure

```
jobpal/
├── frontend/         # React frontend application
├── backend/          # Flask backend application
├── docker/           # Docker-related configurations
└── docs/            # Project documentation
```

## Prerequisites

- Docker
- Docker Compose
- Node.js (for local frontend development)
- Python 3.8+ (for local backend development)

## Getting Started

1. Clone the repository
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start the application:
   ```bash
   docker-compose up --build
   ```

The application should be available at:

- Frontend: http://localhost:5137
- Backend: http://localhost:7315
- Database: localhost:5432

## Development

### Frontend Development

- Navigate to the frontend directory
- Install dependencies: `npm install`
- Start development server: `npm start`

### Backend Development

- Navigate to the backend directory
- Create a virtual environment: `python -m venv venv`
- Activate the virtual environment: `source venv/bin/activate` (Unix) or `venv\Scripts\activate` (Windows)
- Install dependencies: `pip install -r requirements.txt`
- Start the development server: `flask run`

## Features

- Job application management
- File upload for resumes and cover letters
- Status tracking
- Date notifications
- CSV export
- Filtering and search capabilities

## License

MIT
