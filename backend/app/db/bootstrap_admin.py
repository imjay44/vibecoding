import sys
import os
import argparse

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.entities import User


def bootstrap_admin(email: str, password: str, full_name: str = "Platform Super Admin", phone: str = "+919999900000"):
    """Creates the initial super administrator account if not present."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email.lower()).first()
        if existing:
            print(f"[INFO] Super admin account with email {email} already exists.")
            return

        admin = User(
            email=email.lower(),
            phone_number=phone,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role="SUPER_ADMIN",
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        db.commit()
        print(f"[SUCCESS] Super administrator created successfully: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bootstrap initial Super Admin user")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", "admin@homeserve.com"), help="Admin email")
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", "Admin@123456"), help="Admin password")
    parser.add_argument("--name", default="Platform Super Admin", help="Admin Full Name")
    parser.add_argument("--phone", default="+919999900000", help="Admin Phone Number")

    args = parser.parse_args()
    bootstrap_admin(args.email, args.password, args.name, args.phone)
