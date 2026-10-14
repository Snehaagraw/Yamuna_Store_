import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def create_or_update_admin():
    """
    Synchronizes the single, specific admin superuser using private
    environment variables configured in Render's dashboard.
    Supports ADMIN_USERNAME or ADMIN_NAME, and ADMIN_PASSWORD.
    """
    raw_username = (
        os.getenv('ADMIN_USERNAME')
        or os.getenv('ADMIN_NAME')
        or os.getenv('ADMIN_USER')
        or 'yamunastore'
    )
    raw_password = (
        os.getenv('ADMIN_PASSWORD')
        or os.getenv('ADMIN_PASS')
        or ''
    )
    email = (os.getenv('ADMIN_EMAIL') or 'agrawaljii31415@gmail.com').strip()

    username = raw_username.strip()
    password = raw_password.strip()

    if not password:
        print("ADMIN_PASSWORD is not set in Render environment variables. Skipping admin sync.")
        return

    try:
        user = User.objects.filter(username=username).first()
        if not user:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"Superuser '{username}' successfully created!")
        else:
            if not user.check_password(password) or not user.is_staff or not user.is_superuser or not user.is_active:
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.save()
                print(f"Superuser '{username}' successfully synced with Render credentials!")
            else:
                print(f"Superuser '{username}' is already up-to-date.")
    except Exception as e:
        print(f"Note during admin sync for '{username}': {e}")

if __name__ == "__main__":
    create_or_update_admin()
