import csv
import io
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.db.session import get_db
from app.dependencies import require_admin
from app.core.exceptions import NotFoundError, BusinessLogicError
from app.models.entities import (
    User, Customer, ServiceProvider, Technician, Booking, Payment,
    ProviderEarning
)
from app.schemas.all_schemas import (
    AdminStatsResponse, ProviderVerifyRequest, ServiceProviderResponse, UserResponse
)
from app.schemas.common import APIResponse
from app.services.notification_service import create_notification

router = APIRouter()


@router.get("/stats", response_model=APIResponse[AdminStatsResponse])
def get_admin_dashboard_stats(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Calculates all key SaaS metrics directly from database."""
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_providers = db.query(func.count(ServiceProvider.id)).scalar() or 0
    total_technicians = db.query(func.count(Technician.id)).scalar() or 0

    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    pending_bookings = db.query(func.count(Booking.id)).filter(Booking.status == "PENDING").scalar() or 0
    confirmed_bookings = db.query(func.count(Booking.id)).filter(Booking.status.in_(["CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"])).scalar() or 0
    completed_bookings = db.query(func.count(Booking.id)).filter(Booking.status == "COMPLETED").scalar() or 0
    cancelled_bookings = db.query(func.count(Booking.id)).filter(Booking.status.in_(["CANCELLED", "REJECTED"])).scalar() or 0

    total_revenue = db.query(func.sum(Booking.final_amount)).filter(Booking.payment_status == "PAID").scalar() or Decimal("0.00")
    platform_commission = db.query(func.sum(ProviderEarning.platform_commission)).scalar() or Decimal("0.00")
    provider_earnings = db.query(func.sum(ProviderEarning.net_earnings)).scalar() or Decimal("0.00")

    stats = AdminStatsResponse(
        total_customers=total_customers,
        total_providers=total_providers,
        total_technicians=total_technicians,
        total_bookings=total_bookings,
        pending_bookings=pending_bookings,
        confirmed_bookings=confirmed_bookings,
        completed_bookings=completed_bookings,
        cancelled_bookings=cancelled_bookings,
        total_revenue=Decimal(str(total_revenue)),
        platform_commission=Decimal(str(platform_commission)),
        provider_earnings=Decimal(str(provider_earnings))
    )
    return APIResponse(data=stats)


@router.get("/providers/pending", response_model=APIResponse[List[ServiceProviderResponse]])
def get_pending_providers(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Lists newly registered service providers awaiting verification."""
    providers = db.query(ServiceProvider).options(
        joinedload(ServiceProvider.user)
    ).filter(ServiceProvider.verification_status == "PENDING").all()

    return APIResponse(data=[ServiceProviderResponse.model_validate(p) for p in providers])


@router.patch("/providers/{id}/verify", response_model=APIResponse[ServiceProviderResponse])
def verify_provider(
    id: str,
    payload: ProviderVerifyRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approves or rejects a service provider onboarding request."""
    provider = db.query(ServiceProvider).options(joinedload(ServiceProvider.user)).filter(ServiceProvider.id == id).first()
    if not provider:
        raise NotFoundError("Provider not found")

    action = payload.action.upper().strip()
    if action == "APPROVE":
        provider.verification_status = "APPROVED"
        provider.rejection_reason = None
        if provider.user:
            provider.user.is_verified = True
            create_notification(
                db,
                user_id=provider.user.id,
                title="Account Verified & Approved",
                message="Congratulations! Your service provider profile has been approved. You can now publish services and accept customer bookings.",
                type="SYSTEM"
            )
    elif action == "REJECT":
        provider.verification_status = "REJECTED"
        provider.rejection_reason = payload.rejection_reason or "Documents could not be verified."
        if provider.user:
            create_notification(
                db,
                user_id=provider.user.id,
                title="Verification Update",
                message=f"Your provider verification was rejected: {provider.rejection_reason}",
                type="SYSTEM"
            )
    else:
        raise BusinessLogicError("Action must be either 'APPROVE' or 'REJECT'")

    db.commit()
    db.refresh(provider)
    return APIResponse(message=f"Provider verification updated to {provider.verification_status}", data=ServiceProviderResponse.model_validate(provider))


@router.get("/users", response_model=APIResponse[List[UserResponse]])
def list_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """User directory management for Administrator."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (User.full_name.ilike(s)) | (User.email.ilike(s)) | (User.phone_number.ilike(s))
        )

    users = query.order_by(User.created_at.desc()).all()
    return APIResponse(data=[UserResponse.model_validate(u) for u in users])


@router.patch("/users/{id}/toggle-status", response_model=APIResponse[UserResponse])
def toggle_user_status(
    id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activates or deactivates any platform user account."""
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise NotFoundError("User not found")

    if user.id == current_admin.id:
        raise BusinessLogicError("Administrators cannot deactivate their own account")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    state = "activated" if user.is_active else "deactivated"
    return APIResponse(message=f"User {user.email} has been {state}", data=UserResponse.model_validate(user))


@router.get("/reports/bookings-csv")
def export_bookings_csv(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Exports structured bookings report in CSV format."""
    bookings = db.query(Booking).options(
        joinedload(Booking.service),
        joinedload(Booking.provider),
        joinedload(Booking.customer).joinedload(Customer.user)
    ).order_by(Booking.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Booking Ref", "Customer Name", "Customer Email", "Provider Business",
        "Service", "Date", "Slot", "Status", "Payment Status", "Final Amount (INR)"
    ])

    for b in bookings:
        c_name = b.customer.user.full_name if (b.customer and b.customer.user) else "N/A"
        c_email = b.customer.user.email if (b.customer and b.customer.user) else "N/A"
        p_name = b.provider.business_name if b.provider else "N/A"
        s_name = b.service.name if b.service else "N/A"

        writer.writerow([
            b.booking_reference, c_name, c_email, p_name, s_name,
            str(b.booking_date), b.time_slot, b.status, b.payment_status, str(b.final_amount)
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=homeserve_bookings_report.csv"}
    )
