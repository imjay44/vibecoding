from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies import get_current_user
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.entities import Invoice, Booking, User
from app.schemas.all_schemas import InvoiceResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("/{booking_id}", response_model=APIResponse[InvoiceResponse])
def get_invoice_for_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves tax invoice for a booking."""
    invoice = db.query(Invoice).options(
        joinedload(Invoice.booking).joinedload(Booking.service),
        joinedload(Invoice.booking).joinedload(Booking.address)
    ).filter(Invoice.booking_id == booking_id).first()

    if not invoice:
        raise NotFoundError("Invoice not found for this booking")

    booking = invoice.booking
    if current_user.role == "CUSTOMER" and booking.customer_id != current_user.customer_profile.id:
        raise PermissionDeniedError("Unauthorized access to this invoice")
    elif current_user.role == "SERVICE_PROVIDER" and booking.provider_id != current_user.provider_profile.id:
        raise PermissionDeniedError("Unauthorized access to this invoice")

    return APIResponse(data=InvoiceResponse.model_validate(invoice))
