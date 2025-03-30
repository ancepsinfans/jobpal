# JobPal

JobPal is an open-source job search management application that helps users track their job search process, manage applications, and create tailored resumes and cover letters.

## Features

- 🔍 Job search aggregation and tracking
- 📝 Application status management
- 📄 Resume creation and management
- ✉️ Cover letter creation and customization
- 🤖 AI-powered cover letter tailoring (optional)
  - OpenAI integration
  - Anthropic integration
  - Groq integration
  - Local Ollama model support

## Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) API keys for AI services

### Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/jobpal.git
cd jobpal
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Start the application:

```bash
docker-compose up -d
```

The application will be available at:

- Frontend: `http://localhost:1235`
- Backend API: `http://localhost:3581`

## Development

### Backend

The backend is built with FastAPI and provides a RESTful API for the frontend.

### Frontend

The frontend is built with React and TypeScript, providing a modern and responsive user interface.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

Please read our [Security Policy](SECURITY.md) for details on reporting security vulnerabilities.
