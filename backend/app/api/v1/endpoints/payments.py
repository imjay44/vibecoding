import json
from typing import List
from fastapi import APIRouter, Depends, Request, Header, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.core.exceptions import (
    NotFoundError, PermissionDeniedError, BusinessLogicError, AuthenticationError
)
from app.models.entities import Booking, Payment, User
from app.schemas.all_schemas import (
    CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PaymentResponse
)
from app.schemas.common import APIResponse
from app.services.payment_service import (
    create_razorpay_order, verify_razorpay_signature, process_successful_payment,
    verify_webhook_signature
)

router = APIRouter()


@router.post("/create-order", response_model=APIResponse[CreateOrderResponse])
def create_order(
    payload: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a server-side Razorpay order in integer subunits."""
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise NotFoundError("Booking not found")

    if current_user.role == "CUSTOMER" and booking.customer_id != current_user.customer_profile.id:
        raise PermissionDeniedError("You cannot initiate payment for another customer's booking")

    order_data = create_razorpay_order(db, booking)
    return APIResponse(message="Razorpay order created", data=CreateOrderResponse(**order_data))


@router.post("/verify", response_model=APIResponse[PaymentResponse])
def verify_payment(
    payload: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verifies payment signature server-side and settles booking, invoice and provider earnings."""
    is_valid = verify_razorpay_signature(
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature
    )

    if not is_valid:
        raise BusinessLogicError("Payment signature verification failed. Untrusted payment transaction.")

    payment = process_successful_payment(
        db=db,
        booking_id=payload.booking_id,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature
    )

    return APIResponse(
        message="Payment verified and confirmed successfully",
        data=PaymentResponse.model_validate(payment)
    )


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """Asynchronous webhook handler for payment events with signature verification."""
    raw_body = await request.body()
    if x_razorpay_signature:
        if not verify_webhook_signature(raw_body, x_razorpay_signature):
            raise AuthenticationError("Invalid webhook signature")

    try:
        event = json.loads(raw_body.decode("utf-8"))
        event_name = event.get("event")

        if event_name == "payment.captured":
            payment_entity = event.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")

            # Find matching payment record
            payment = db.query(Payment).filter(Payment.razorpay_order_id == order_id).first()
            if payment and payment.status != "PAID":
                process_successful_payment(
                    db=db,
                    booking_id=payment.booking_id,
                    razorpay_order_id=order_id,
                    razorpay_payment_id=payment_id,
                    razorpay_signature="webhook_verified"
                )
    except Exception:
        pass

    return {"status": "ok"}


@router.get("/history", response_model=APIResponse[List[PaymentResponse]])
def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves payment history based on user role."""
    query = db.query(Payment).join(Payment.booking)

    if current_user.role == "CUSTOMER":
        query = query.filter(Booking.customer_id == current_user.customer_profile.id)
    elif current_user.role == "SERVICE_PROVIDER":
        query = query.filter(Booking.provider_id == current_user.provider_profile.id)
    elif current_user.role == "SUPER_ADMIN":
        pass
    else:
        raise PermissionDeniedError("Unauthorized")

    payments = query.order_by(Payment.created_at.desc()).all()
    return APIResponse(data=[PaymentResponse.model_validate(p) for p in payments])
