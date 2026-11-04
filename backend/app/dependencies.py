from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.models.entities import User

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that extracts and validates the Bearer token, returning the authenticated user."""
    if not credentials or not credentials.credentials:
        raise AuthenticationError("Authorization header with Bearer token is required")

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise AuthenticationError("Invalid or expired authentication token")

    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Malformed token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AuthenticationError("User associated with token not found")

    if not user.is_active:
        raise PermissionDeniedError("Your user account has been deactivated. Please contact support.")

    return user


def require_roles(allowed_roles: List[str]):
    """Returns a dependency function verifying the user's role is within allowed_roles."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedError(
                f"Access denied. Requires one of roles: {', '.join(allowed_roles)}. Your role: {current_user.role}"
            )
        return current_user
    return role_checker


# Role specific convenience dependencies
require_admin = require_roles(["SUPER_ADMIN"])
require_customer = require_roles(["CUSTOMER"])
require_provider = require_roles(["SERVICE_PROVIDER"])
require_technician = require_roles(["TECHNICIAN"])
require_provider_or_admin = require_roles(["SERVICE_PROVIDER", "SUPER_ADMIN"])
require_authenticated = get_current_user
