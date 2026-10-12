import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def create_or_update_admin():
    """
    Creates or updates the admin superuser securely using private
    environment variables set in Render's dashboard.
    No passwords or secrets are hardcoded in code files or Git.
    """
    username = os.getenv('ADMIN_USERNAME', 'yamunastore')
    email = os.getenv('ADMIN_EMAIL', 'agrawaljii31415@gmail.com')
    password = os.getenv('ADMIN_PASSWORD')

    if not password:
        print("ADMIN_PASSWORD is not set in environment variables. Skipping.")
        return

    try:
        user = User.objects.filter(username=username).first()
        if not user:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"Superuser '{username}' successfully created!")
        else:
            user.set_password(password)
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"Superuser '{username}' successfully updated!")
    except Exception as e:
        print(f"Note during admin check: {e}")

if __name__ == "__main__":
    create_or_update_admin()
