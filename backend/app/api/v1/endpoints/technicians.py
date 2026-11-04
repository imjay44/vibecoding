from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies import require_technician
from app.core.exceptions import NotFoundError, PermissionDeniedError, BusinessLogicError
from app.models.entities import Technician, Booking, BookingAssignment, User, Customer
from app.schemas.all_schemas import BookingResponse
from app.schemas.common import APIResponse
from app.services.notification_service import create_notification

router = APIRouter()


@router.get("/jobs", response_model=APIResponse[List[BookingResponse]])
def get_assigned_jobs(
    current_user: User = Depends(require_technician),
    db: Session = Depends(get_db)
):
    """Retrieves all jobs assigned to the logged-in technician."""
    technician = current_user.technician_profile
    if not technician:
        raise NotFoundError("Technician profile not found")

    assignments = db.query(BookingAssignment).options(
        joinedload(BookingAssignment.booking).joinedload(Booking.service),
        joinedload(BookingAssignment.booking).joinedload(Booking.address),
        joinedload(BookingAssignment.booking).joinedload(Booking.customer).joinedload(Customer.user)
    ).filter(BookingAssignment.technician_id == technician.id).order_by(BookingAssignment.assigned_at.desc()).all()

    bookings = [a.booking for a in assignments if a.booking]
    return APIResponse(data=[BookingResponse.model_validate(b) for b in bookings])


@router.get("/jobs/{id}", response_model=APIResponse[BookingResponse])
def get_assigned_job_detail(
    id: str,
    current_user: User = Depends(require_technician),
    db: Session = Depends(get_db)
):
    """Retrieves a single assigned job's details."""
    technician = current_user.technician_profile
    assignment = db.query(BookingAssignment).filter(
        BookingAssignment.booking_id == id,
        BookingAssignment.technician_id == technician.id
    ).first()

    if not assignment:
        raise PermissionDeniedError("You do not have permission to view this job")

    booking = db.query(Booking).options(
        joinedload(Booking.service),
        joinedload(Booking.address),
        joinedload(Booking.assignments),
        joinedload(Booking.images)
    ).filter(Booking.id == id).first()

    return APIResponse(data=BookingResponse.model_validate(booking))


@router.patch("/jobs/{id}/accept", response_model=APIResponse[BookingResponse])
def accept_job(
    id: str,
    current_user: User = Depends(require_technician),
    db: Session = Depends(get_db)
):
    """Technician accepts an assigned job."""
    technician = current_user.technician_profile
    assignment = db.query(BookingAssignment).filter(
        BookingAssignment.booking_id == id,
        BookingAssignment.technician_id == technician.id
    ).first()

    if not assignment:
        raise PermissionDeniedError("You are not assigned to this booking")

    assignment.accepted_at = datetime.now(timezone.utc)
    db.commit()

    booking = db.query(Booking).filter(Booking.id == id).first()
    return APIResponse(message="Job assignment accepted", data=BookingResponse.model_validate(booking))


@router.patch("/jobs/{id}/arrive", response_model=APIResponse[BookingResponse])
def mark_job_arrival(
    id: str,
    current_user: User = Depends(require_technician),
    db: Session = Depends(get_db)
):
    """Marks technician arrival at customer site and transitions status to IN_PROGRESS."""
    technician = current_user.technician_profile
    assignment = db.query(BookingAssignment).filter(
        BookingAssignment.booking_id == id,
        BookingAssignment.technician_id == technician.id
    ).first()

    if not assignment:
        raise PermissionDeniedError("You are not assigned to this booking")

    booking = db.query(Booking).filter(Booking.id == id).first()
    assignment.arrival_time = datetime.now(timezone.utc)
    booking.status = "IN_PROGRESS"
    db.commit()

    if booking.customer and booking.customer.user:
        create_notification(
            db,
            user_id=booking.customer.user.id,
            title="Technician Arrived",
            message=f"Technician {current_user.full_name} has arrived at your address for booking #{booking.booking_reference}.",
            type="BOOKING"
        )

    return APIResponse(message="Arrival recorded. Work marked in-progress.", data=BookingResponse.model_validate(booking))


@router.patch("/jobs/{id}/complete", response_model=APIResponse[BookingResponse])
def complete_job(
    id: str,
    remarks: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(require_technician),
    db: Session = Depends(get_db)
):
    """Marks work as completed and updates technician job count."""
    technician = current_user.technician_profile
    assignment = db.query(BookingAssignment).filter(
        BookingAssignment.booking_id == id,
        BookingAssignment.technician_id == technician.id
    ).first()

    if not assignment:
        raise PermissionDeniedError("You are not assigned to this booking")

    booking = db.query(Booking).filter(Booking.id == id).first()
    assignment.completed_at = datetime.now(timezone.utc)
    assignment.technician_remarks = remarks
    booking.status = "COMPLETED"

    technician.total_jobs_completed += 1
    db.commit()

    if booking.customer and booking.customer.user:
        create_notification(
            db,
            user_id=booking.customer.user.id,
            title="Service Completed",
            message=f"Your service for booking #{booking.booking_reference} has been completed! Please leave a review.",
            type="BOOKING"
        )

    return APIResponse(message="Service successfully marked as completed", data=BookingResponse.model_validate(booking))
