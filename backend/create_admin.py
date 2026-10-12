import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def create_or_update_admin():
    username = os.getenv('ADMIN_USERNAME', 'admin')
    email = os.getenv('ADMIN_EMAIL', 'agrawaljii31415@gmail.com')
    password = os.getenv('ADMIN_PASSWORD', 'YamunaStore@2026')

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
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"Superuser '{username}' successfully verified & updated!")
    except Exception as e:
        print(f"Note during admin creation: {e}")

if __name__ == "__main__":
    create_or_update_admin()
