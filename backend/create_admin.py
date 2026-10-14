import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def _get_env_insensitive(*keys):
    env_lower = {k.lower(): v for k, v in os.environ.items()}
    for key in keys:
        if key.lower() in env_lower and env_lower[key.lower()].strip():
            return env_lower[key.lower()].strip()
    return ''

def create_or_update_admin():
    """
    Synchronizes the admin superuser using private environment variables
    configured in Render's dashboard.
    Case-insensitive key lookup: ADMIN_USERNAME, ADMIN_NAME, ADMIN_PASSWORD, etc.
    """
    custom_username = _get_env_insensitive('ADMIN_USERNAME', 'ADMIN_NAME', 'ADMIN_USER', 'ADMIN')
    password = _get_env_insensitive('ADMIN_PASSWORD', 'ADMIN_PASS', 'ADMIN_SECRET')
    email = _get_env_insensitive('ADMIN_EMAIL') or 'agrawaljii31415@gmail.com'

    if not password:
        print("[AdminSync] ADMIN_PASSWORD is not set in Render environment variables. Skipping.")
        return

    # Usernames to ensure have superuser access with this password
    usernames = []
    if custom_username:
        usernames.append(custom_username)
    # Always also ensure 'yamunastore' (the original store admin ID 1) is synced
    usernames.append('yamunastore')

    # Remove duplicates preserving order
    seen = set()
    target_usernames = [u for u in usernames if not (u.lower() in seen or seen.add(u.lower()))]

    for uname in target_usernames:
        try:
            user = User.objects.filter(username__iexact=uname).first()
            if not user:
                user = User.objects.create_superuser(
                    username=uname,
                    email=email,
                    password=password
                )
                print(f"[AdminSync] Superuser '{uname}' successfully created!")
            else:
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.save()
                print(f"[AdminSync] Superuser '{user.username}' successfully updated with Render password!")
        except Exception as e:
            print(f"[AdminSync] Note during sync for '{uname}': {e}")

if __name__ == "__main__":
    create_or_update_admin()
