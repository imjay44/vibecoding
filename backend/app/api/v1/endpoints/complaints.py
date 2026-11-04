from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user, require_customer, require_admin
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.entities import Complaint, Booking, User
from app.schemas.all_schemas import ComplaintCreate, ComplaintStatusUpdate, ComplaintResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.post("", response_model=APIResponse[ComplaintResponse], status_code=status.HTTP_201_CREATED)
def raise_complaint(
    payload: ComplaintCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Customer submits a formal dispute ticket regarding a booking."""
    customer = current_user.customer_profile
    booking = db.query(Booking).filter(
        Booking.id == payload.booking_id,
        Booking.customer_id == customer.id
    ).first()

    if not booking:
        raise NotFoundError("Associated booking was not found")

    complaint = Complaint(
        booking_id=booking.id,
        customer_id=customer.id,
        title=payload.title,
        description=payload.description,
        status="OPEN"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return APIResponse(
        message="Complaint submitted successfully. An administrator will review your ticket.",
        data=ComplaintResponse.model_validate(complaint)
    )


@router.get("", response_model=APIResponse[List[ComplaintResponse]])
def list_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves tickets based on role."""
    query = db.query(Complaint)
    if current_user.role == "CUSTOMER":
        query = query.filter(Complaint.customer_id == current_user.customer_profile.id)
    elif current_user.role == "SUPER_ADMIN":
        pass
    else:
        raise PermissionDeniedError("Unauthorized")

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return APIResponse(data=[ComplaintResponse.model_validate(c) for c in complaints])


@router.patch("/{id}", response_model=APIResponse[ComplaintResponse])
def update_complaint_status(
    id: str,
    payload: ComplaintStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Administrator reviews and resolves dispute ticket."""
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise NotFoundError("Complaint ticket not found")

    complaint.status = payload.status.upper()
    if payload.admin_notes:
        complaint.admin_notes = payload.admin_notes

    db.commit()
    db.refresh(complaint)
    return APIResponse(message="Complaint updated successfully", data=ComplaintResponse.model_validate(complaint))
