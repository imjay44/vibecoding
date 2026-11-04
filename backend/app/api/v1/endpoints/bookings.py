from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status, Body
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies import get_current_user
from app.core.exceptions import NotFoundError, PermissionDeniedError, BusinessLogicError
from app.models.entities import (
    Booking, BookingAssignment, BookingImage, Technician, ServiceProvider,
    Customer, User
)
from app.schemas.all_schemas import (
    BookingCreate, BookingResponse, BookingActionRequest, TechnicianAssignRequest,
    BookingImageResponse
)
from app.schemas.common import APIResponse
from app.services.booking_service import create_new_booking
from app.services.notification_service import create_notification

router = APIRouter()


@router.post("", response_model=APIResponse[BookingResponse], status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer initiates a new booking with backend availability reservation."""
    if current_user.role != "CUSTOMER" or not current_user.customer_profile:
        raise PermissionDeniedError("Only registered customers can create bookings")

    booking = create_new_booking(
        db=db,
        customer_id=current_user.customer_profile.id,
        provider_id=payload.provider_id,
        service_id=payload.service_id,
        address_id=payload.address_id,
        booking_date=payload.booking_date,
        time_slot=payload.time_slot,
        problem_description=payload.problem_description,
        coupon_code=payload.coupon_code,
        reference_image_urls=payload.reference_image_urls
    )

    # Re-fetch with relationships
    b = db.query(Booking).options(
        joinedload(Booking.service),
        joinedload(Booking.provider).joinedload(ServiceProvider.user),
        joinedload(Booking.address),
        joinedload(Booking.images)
    ).filter(Booking.id == booking.id).first()

    return APIResponse(
        message=f"Booking created successfully with reference #{booking.booking_reference}",
        data=BookingResponse.model_validate(b)
    )


@router.get("", response_model=APIResponse[List[BookingResponse]])
def list_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Role-aware list of bookings."""
    query = db.query(Booking).options(
        joinedload(Booking.service),
        joinedload(Booking.provider).joinedload(ServiceProvider.user),
        joinedload(Booking.address),
        joinedload(Booking.assignments).joinedload(BookingAssignment.technician).joinedload(Technician.user),
        joinedload(Booking.images)
    )

    if current_user.role == "CUSTOMER":
        query = query.filter(Booking.customer_id == current_user.customer_profile.id)
    elif current_user.role == "SERVICE_PROVIDER":
        query = query.filter(Booking.provider_id == current_user.provider_profile.id)
    elif current_user.role == "TECHNICIAN":
        query = query.join(Booking.assignments).filter(
            BookingAssignment.technician_id == current_user.technician_profile.id
        )
    elif current_user.role == "SUPER_ADMIN":
        pass # Admin sees all
    else:
        raise PermissionDeniedError("Unauthorized role")

    if status_filter:
        query = query.filter(Booking.status == status_filter.upper())

    bookings = query.order_by(Booking.created_at.desc()).all()
    return APIResponse(data=[BookingResponse.model_validate(b) for b in bookings])


@router.get("/{id}", response_model=APIResponse[BookingResponse])
def get_booking(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves single booking with RBAC ownership check."""
    booking = db.query(Booking).options(
        joinedload(Booking.service),
        joinedload(Booking.provider).joinedload(ServiceProvider.user),
        joinedload(Booking.address),
        joinedload(Booking.assignments).joinedload(BookingAssignment.technician).joinedload(Technician.user),
        joinedload(Booking.images)
    ).filter(Booking.id == id).first()

    if not booking:
        raise NotFoundError("Booking not found")

    # RBAC check
    if current_user.role == "CUSTOMER" and booking.customer_id != current_user.customer_profile.id:
        raise PermissionDeniedError("You do not have access to this booking")
    elif current_user.role == "SERVICE_PROVIDER" and booking.provider_id != current_user.provider_profile.id:
        raise PermissionDeniedError("You do not have access to this booking")

    return APIResponse(data=BookingResponse.model_validate(booking))


@router.patch("/{id}/accept", response_model=APIResponse[BookingResponse])
def accept_booking(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provider accepts incoming booking request."""
    if current_user.role != "SERVICE_PROVIDER":
        raise PermissionDeniedError("Only service providers can accept bookings")

    booking = db.query(Booking).filter(
        Booking.id == id,
        Booking.provider_id == current_user.provider_profile.id
    ).first()
    if not booking:
        raise NotFoundError("Booking not found")

    if booking.status not in ["PENDING", "CONFIRMED"]:
        raise BusinessLogicError(f"Cannot accept booking in current status '{booking.status}'")

    booking.status = "CONFIRMED"
    db.commit()

    if booking.customer and booking.customer.user:
        create_notification(
            db,
            user_id=booking.customer.user.id,
            title="Booking Accepted",
            message=f"Provider accepted your booking #{booking.booking_reference}. A technician will be assigned shortly.",
            type="BOOKING"
        )

    return APIResponse(message="Booking accepted", data=BookingResponse.model_validate(booking))


@router.patch("/{id}/reject", response_model=APIResponse[BookingResponse])
def reject_booking(
    id: str,
    payload: BookingActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provider rejects booking request with reason."""
    if current_user.role != "SERVICE_PROVIDER":
        raise PermissionDeniedError("Only service providers can reject bookings")

    booking = db.query(Booking).filter(
        Booking.id == id,
        Booking.provider_id == current_user.provider_profile.id
    ).first()
    if not booking:
        raise NotFoundError("Booking not found")

    if booking.status not in ["PENDING"]:
        raise BusinessLogicError(f"Cannot reject booking in current status '{booking.status}'")

    booking.status = "REJECTED"
    booking.rejection_reason = payload.reason or "Provider unavailable at the requested time"
    db.commit()

    if booking.customer and booking.customer.user:
        create_notification(
            db,
            user_id=booking.customer.user.id,
            title="Booking Request Declined",
            message=f"Your booking #{booking.booking_reference} was declined: {booking.rejection_reason}",
            type="BOOKING"
        )

    return APIResponse(message="Booking rejected", data=BookingResponse.model_validate(booking))


@router.post("/{id}/assign-technician", response_model=APIResponse[BookingResponse])
def assign_technician(
    id: str,
    payload: TechnicianAssignRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provider assigns a technician to a confirmed booking."""
    if current_user.role != "SERVICE_PROVIDER":
        raise PermissionDeniedError("Only service providers can assign technicians")

    booking = db.query(Booking).filter(
        Booking.id == id,
        Booking.provider_id == current_user.provider_profile.id
    ).first()
    if not booking:
        raise NotFoundError("Booking not found")

    # Verify technician belongs to provider
    technician = db.query(Technician).filter(
        Technician.id == payload.technician_id,
        Technician.provider_id == current_user.provider_profile.id
    ).first()
    if not technician:
        raise NotFoundError("Technician not found under your organization")

    # Create assignment
    assignment = BookingAssignment(
        booking_id=booking.id,
        technician_id=technician.id
    )
    db.add(assignment)
    booking.status = "PROVIDER_ASSIGNED"
    db.commit()

    # Notify technician
    if technician.user:
        create_notification(
            db,
            user_id=technician.user.id,
            title="New Job Assigned",
            message=f"You have been assigned to booking #{booking.booking_reference} on {booking.booking_date}.",
            type="JOB"
        )

    # Notify customer
    if booking.customer and booking.customer.user:
        create_notification(
            db,
            user_id=booking.customer.user.id,
            title="Technician Assigned",
            message=f"Technician {technician.user.full_name if technician.user else ''} has been assigned to your booking #{booking.booking_reference}.",
            type="BOOKING"
        )

    return APIResponse(message="Technician assigned successfully", data=BookingResponse.model_validate(booking))


@router.patch("/{id}/cancel", response_model=APIResponse[BookingResponse])
def cancel_booking(
    id: str,
    payload: BookingActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer or Admin cancels booking according to cancellation policy."""
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise NotFoundError("Booking not found")

    if current_user.role == "CUSTOMER":
        if booking.customer_id != current_user.customer_profile.id:
            raise PermissionDeniedError("You cannot cancel another customer's booking")
        if booking.status in ["IN_PROGRESS", "COMPLETED", "CANCELLED"]:
            raise BusinessLogicError(f"Booking in status '{booking.status}' cannot be cancelled")
    elif current_user.role not in ["SUPER_ADMIN", "SERVICE_PROVIDER"]:
        raise PermissionDeniedError("Unauthorized to cancel this booking")

    booking.status = "CANCELLED"
    booking.cancellation_reason = payload.reason or "Cancelled by user"
    db.commit()

    return APIResponse(message="Booking cancelled successfully", data=BookingResponse.model_validate(booking))


@router.post("/{id}/images", response_model=APIResponse[BookingImageResponse], status_code=status.HTTP_201_CREATED)
def add_booking_image(
    id: str,
    image_url: str = Body(..., embed=True),
    image_type: str = Body("AFTER_WORK", embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Uploads verification photos (before/after work or customer reference)."""
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise NotFoundError("Booking not found")

    b_img = BookingImage(
        booking_id=booking.id,
        image_url=image_url,
        image_type=image_type
    )
    db.add(b_img)
    db.commit()
    db.refresh(b_img)

    return APIResponse(message="Image attached to booking", data=BookingImageResponse.model_validate(b_img))
