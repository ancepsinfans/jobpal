# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install the backend package in development mode
WORKDIR /app
RUN pip install -e .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Create entrypoint script
RUN echo '#!/bin/sh\n\
cd /app\n\
export PYTHONPATH=/app\n\
gunicorn --bind 0.0.0.0:7315 --workers 4 --timeout 120 "backend:create_app()"' > /app/start.sh \
    && chmod +x /app/start.sh

# Expose port
EXPOSE 7315

# Run the application
CMD ["/app/start.sh"] 