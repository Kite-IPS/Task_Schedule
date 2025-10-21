# Task Schedule Application

A task scheduling application with Django backend and React frontend.

## Dockerized Deployment

This project is set up for easy deployment using Docker.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start

1. Clone the repository:
   ```powershell
   git clone <repository-url>
   cd Task_Schedule
   ```

2. Configure environment variables:
   ```powershell
   # Copy the example environment file and modify it with your settings
   Copy-Item backend/.env.docker backend/.env
   # Edit the .env file with your production values
   notepad backend/.env
   ```

3. Start the application:
   ```powershell
   # Using PowerShell
   .\setup.ps1
   
   # Or manually with Docker Compose
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost (port 80)
   - Backend API: http://localhost:8000

4. Access the application:
   - Frontend: http://localhost (port 80)
   - Backend API: http://localhost:8000

### Environment Configuration

You must configure the following environment variables in `backend/.env`:

- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to 'False' for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `EMAIL_HOST_USER`: Email account for notifications
- `EMAIL_HOST_PASSWORD`: Email account password or app password
- `FRONTEND_URL`: URL of the frontend application

### Manual Deployment Steps

If you prefer to deploy manually:

1. Build the containers:
   ```powershell
   docker-compose build
   ```

2. Start the services:
   ```powershell
   docker-compose up -d
   ```

3. The backend container will automatically:
   - Apply migrations
   - Collect static files
   - Start the Gunicorn server

### Troubleshooting

- **Database issues**: The SQLite database is mounted as a volume. If you encounter issues, check file permissions.
- **Email not working**: Ensure your email credentials are correct and the SMTP server allows the connections.
- **Frontend not connecting to backend**: Check the nginx.conf file to ensure proper proxy configuration.

### Stopping the Application

```powershell
docker-compose down
```

To remove volumes as well:
```powershell
docker-compose down -v
```