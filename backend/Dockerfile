FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Add python-dotenv explicitly if not in requirements.txt
RUN pip install python-dotenv

# Copy project files
COPY . /app/

# Collect static files (if needed)
# RUN python manage.py collectstatic --noinput

# Run migrations
# We'll run migrations at container startup instead of during build
# to ensure the database is available when migrations are run

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose the port the app runs on
EXPOSE 8000

# Command to run migrations, collect static files, and start the application
CMD python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    gunicorn --bind 0.0.0.0:8000 backend.wsgi_docker