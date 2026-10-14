"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Automatically sync admin credentials on startup if configured in Render
try:
    from create_admin import create_or_update_admin
    create_or_update_admin()
except Exception as _e:
    print(f"WSGI admin sync notice: {_e}")
