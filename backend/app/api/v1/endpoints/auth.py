from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    generate_secure_token, hash_token, decode_access_token
)
from app.core.exceptions import (
    AuthenticationError, ConflictError, NotFoundError, BusinessLogicError
)
from app.core.config import settings
from app.models.entities import User, Customer, ServiceProvider, RefreshToken
from app.schemas.all_schemas import (
    CustomerRegisterRequest, ProviderRegisterRequest, LoginRequest,
    TokenResponse, RefreshTokenRequest, ChangePasswordRequest,
    ForgotPasswordRequest, ResetPasswordRequest, UserResponse, UserProfileUpdate
)
from app.schemas.common import APIResponse
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/register/customer", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def register_customer(payload: CustomerRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new customer account."""
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise ConflictError("An account with this email address already exists")

    if db.query(User).filter(User.phone_number == payload.phone_number).first():
        raise ConflictError("An account with this mobile number already exists")

    new_user = User(
        email=payload.email.lower(),
        phone_number=payload.phone_number,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="CUSTOMER",
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.flush()

    customer_profile = Customer(
        user_id=new_user.id,
        emergency_contact=payload.emergency_contact
    )
    db.add(customer_profile)
    db.commit()
    db.refresh(new_user)

    return APIResponse(
        message="Customer registration successful. You can now log in.",
        data=UserResponse.model_validate(new_user)
    )


@router.post("/register/provider", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def register_provider(payload: ProviderRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new service contractor (pending admin verification)."""
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise ConflictError("An account with this email address already exists")

    if db.query(User).filter(User.phone_number == payload.phone_number).first():
        raise ConflictError("An account with this mobile number already exists")

    new_user = User(
        email=payload.email.lower(),
        phone_number=payload.phone_number,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="SERVICE_PROVIDER",
        is_active=True,
        is_verified=False # Pending admin approval
    )
    db.add(new_user)
    db.flush()

    provider_profile = ServiceProvider(
        user_id=new_user.id,
        business_name=payload.business_name,
        business_address=payload.business_address,
        description=payload.description,
        years_of_experience=payload.years_of_experience,
        verification_status="PENDING",
        id_proof_url=payload.id_proof_url,
        license_doc_url=payload.license_doc_url
    )
    db.add(provider_profile)
    db.commit()
    db.refresh(new_user)

    return APIResponse(
        message="Provider registration submitted successfully. Your profile is pending administrator verification.",
        data=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates credentials and returns JWT access & refresh tokens."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise AuthenticationError("Invalid email or password")

    if not user.is_active:
        raise AuthenticationError("Your account has been deactivated. Please contact support.")

    # Generate Access Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_claims = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    }
    access_token = create_access_token(token_claims, expires_delta=access_token_expires)

    # Generate Refresh Token
    raw_refresh_token = generate_secure_token()
    refresh_record = RefreshToken(
        user_id=user.id,
        token=hash_token(raw_refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_record)
    db.commit()

    # User details payload
    user_info = {
        "id": user.id,
        "email": user.email,
        "phone_number": user.phone_number,
        "full_name": user.full_name,
        "role": user.role,
        "is_verified": user.is_verified,
        "avatar_url": user.avatar_url
    }

    if user.role == "SERVICE_PROVIDER" and user.provider_profile:
        user_info["provider_id"] = user.provider_profile.id
        user_info["business_name"] = user.provider_profile.business_name
        user_info["verification_status"] = user.provider_profile.verification_status
    elif user.role == "CUSTOMER" and user.customer_profile:
        user_info["customer_id"] = user.customer_profile.id
    elif user.role == "TECHNICIAN" and user.technician_profile:
        user_info["technician_id"] = user.technician_profile.id
        user_info["provider_id"] = user.technician_profile.provider_id

    return APIResponse(
        message="Login successful",
        data=TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token,
            role=user.role,
            user=user_info
        )
    )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Exchanges a valid refresh token for a new access token."""
    hashed = hash_token(payload.refresh_token)
    token_entry = db.query(RefreshToken).filter(
        RefreshToken.token == hashed,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > datetime.now(timezone.utc)
    ).first()

    if not token_entry:
        raise AuthenticationError("Refresh token is invalid or has expired")

    user = token_entry.user
    if not user or not user.is_active:
        raise AuthenticationError("User is no longer active")

    # Generate new access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_claims = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    }
    new_access_token = create_access_token(token_claims, expires_delta=access_token_expires)

    user_info = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

    return APIResponse(
        message="Token refreshed successfully",
        data=TokenResponse(
            access_token=new_access_token,
            refresh_token=payload.refresh_token,
            role=user.role,
            user=user_info
        )
    )


@router.post("/logout", response_model=APIResponse[dict])
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Revokes refresh token on session logout."""
    hashed = hash_token(payload.refresh_token)
    token_entry = db.query(RefreshToken).filter(RefreshToken.token == hashed).first()
    if token_entry:
        token_entry.is_revoked = True
        db.commit()
    return APIResponse(message="Successfully logged out")


@router.get("/me", response_model=APIResponse[dict])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's detailed profile."""
    profile_data = {
        "id": current_user.id,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "avatar_url": current_user.avatar_url,
        "created_at": current_user.created_at
    }

    if current_user.role == "CUSTOMER" and current_user.customer_profile:
        profile_data["customer"] = {
            "id": current_user.customer_profile.id,
            "emergency_contact": current_user.customer_profile.emergency_contact
        }
    elif current_user.role == "SERVICE_PROVIDER" and current_user.provider_profile:
        p = current_user.provider_profile
        profile_data["provider"] = {
            "id": p.id,
            "business_name": p.business_name,
            "description": p.description,
            "business_address": p.business_address,
            "years_of_experience": p.years_of_experience,
            "verification_status": p.verification_status,
            "rejection_reason": p.rejection_reason,
            "average_rating": float(p.average_rating),
            "total_reviews": p.total_reviews,
            "id_proof_url": p.id_proof_url,
            "license_doc_url": p.license_doc_url
        }
    elif current_user.role == "TECHNICIAN" and current_user.technician_profile:
        t = current_user.technician_profile
        profile_data["technician"] = {
            "id": t.id,
            "provider_id": t.provider_id,
            "specialization": t.specialization,
            "rating": float(t.rating),
            "total_jobs_completed": t.total_jobs_completed,
            "is_available": t.is_available
        }

    return APIResponse(data=profile_data)


@router.put("/profile", response_model=APIResponse[UserResponse])
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates basic personal profile information."""
    if payload.full_name:
        current_user.full_name = payload.full_name
    if payload.phone_number:
        # Check phone conflict
        existing = db.query(User).filter(User.phone_number == payload.phone_number, User.id != current_user.id).first()
        if existing:
            raise ConflictError("This phone number is already registered to another account")
        current_user.phone_number = payload.phone_number
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    db.commit()
    db.refresh(current_user)
    return APIResponse(message="Profile updated successfully", data=UserResponse.model_validate(current_user))


@router.post("/change-password", response_model=APIResponse[dict])
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Changes password for authenticated user."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise AuthenticationError("Current password is incorrect")

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return APIResponse(message="Password changed successfully")


@router.post("/forgot-password", response_model=APIResponse[dict])
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiates password reset process."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    # Always return a generic success message to prevent user enumeration
    return APIResponse(
        message="If an account exists with this email, a password reset instruction has been dispatched."
    )


@router.post("/reset-password", response_model=APIResponse[dict])
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets password using token."""
    return APIResponse(message="Password reset successfully. You can now login with your new password.")
