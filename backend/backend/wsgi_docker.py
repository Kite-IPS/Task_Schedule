"""
WSGI config for Django when running in Docker.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# WhiteNoise will handle static files through the middleware
application = get_wsgi_application()