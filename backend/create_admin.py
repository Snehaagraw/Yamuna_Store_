import os
import django
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def load_local_store_data():
    """
    Restores the exact admin account (yamunastore) with your real password,
    plus all categories and initial products from your local MySQL database.
    """
    seed_file = os.path.join(os.path.dirname(__file__), "seed_data.json")

    if os.path.exists(seed_file):
        try:
            print("Importing your exact admin credentials and catalog from seed_data.json...")
            call_command("loaddata", seed_file)
            print("Local store data and 'yamunastore' admin account restored successfully!")
        except Exception as e:
            print(f"Note during loaddata: {e}")
    else:
        print("seed_data.json not found, skipping initial import.")

if __name__ == "__main__":
    load_local_store_data()
