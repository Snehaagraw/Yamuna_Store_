import os
import sys

def prepare_database():
    """
    Automated database initializer for TiDB Cloud / Cloud MySQL.
    Runs during initial deployment if RESET_DB=True to ensure
    all migrations run cleanly without orphaned schema artifacts.
    """
    reset_enabled = os.getenv("RESET_DB", "True").lower() in ("true", "1", "yes")
    db_host = os.getenv("DB_HOST", "")

    if not reset_enabled or not db_host:
        return

    db_name = os.getenv("DB_NAME", "test")
    db_user = os.getenv("DB_USER", "")
    db_password = os.getenv("DB_PASSWORD", "")
    db_port = int(os.getenv("DB_PORT", 4000))

    try:
        import MySQLdb
        import certifi

        print(f"Checking TiDB Cloud database '{db_name}' at {db_host}:{db_port}...")
        conn = MySQLdb.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            passwd=db_password,
            ssl={"ca": certifi.where()}
        )
        cur = conn.cursor()
        cur.execute(f"DROP DATABASE IF EXISTS `{db_name}`;")
        cur.execute(f"CREATE DATABASE `{db_name}`;")
        conn.close()
        print(f"Database '{db_name}' cleanly prepared for fresh migrations!")
    except Exception as err:
        print(f"Note during DB prep: {err}")

if __name__ == "__main__":
    prepare_database()
