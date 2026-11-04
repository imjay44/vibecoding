import secrets
from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.exceptions import BusinessLogicError, NotFoundError
from app.models.entities import (
    Booking, BookingImage, ServiceProvider, Service, ProviderService,
    AvailabilitySlot, Coupon, Customer, Address
)
from app.services.notification_service import create_notification


def generate_booking_reference() -> str:
    """Generates a human-friendly unique booking reference."""
    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_suffix = secrets.token_hex(3).upper()
    return f"HS-{today_str}-{random_suffix}"


def check_slot_availability(
    db: Session,
    provider_id: str,
    booking_date: date,
    time_slot: str
) -> bool:
    """Checks whether the requested slot is available for the given provider without collision."""
    # Count existing non-cancelled bookings
    active_statuses = ["PENDING", "CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"]
    existing_count = db.query(func.count(Booking.id)).filter(
        Booking.provider_id == provider_id,
        Booking.booking_date == booking_date,
        Booking.time_slot == time_slot,
        Booking.status.in_(active_statuses)
    ).scalar() or 0

    # Provider day of week (0=Monday, 6=Sunday)
    weekday = booking_date.weekday()
    slot_config = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.provider_id == provider_id,
        AvailabilitySlot.day_of_week == weekday,
        AvailabilitySlot.is_active == True
    ).first()

    allowed_capacity = slot_config.slot_capacity if slot_config else 1
    return existing_count < allowed_capacity


def calculate_booking_pricing(
    db: Session,
    provider_id: str,
    service_id: str,
    coupon_code: Optional[str] = None
) -> dict:
    """Calculates base price, discount, platform fee, and final amount."""
    # Check custom provider price, fallback to service base price
    provider_service = db.query(ProviderService).filter(
        ProviderService.provider_id == provider_id,
        ProviderService.service_id == service_id,
        ProviderService.is_available == True
    ).first()

    if provider_service:
        base_price = provider_service.custom_price
    else:
        service = db.query(Service).filter(Service.id == service_id, Service.is_active == True).first()
        if not service:
            raise NotFoundError("Requested service is not available")
        base_price = service.base_price

    discount_amount = Decimal("0.00")
    if coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == coupon_code.upper().strip(),
            Coupon.is_active == True,
            Coupon.valid_until > datetime.now(timezone.utc)
        ).first()

        if coupon and base_price >= coupon.min_order_amount:
            if coupon.discount_percent:
                discount_amount = (base_price * (coupon.discount_percent / Decimal("100.00"))).quantize(Decimal("0.01"))
                if coupon.max_discount and discount_amount > coupon.max_discount:
                    discount_amount = coupon.max_discount
            elif coupon.flat_discount:
                discount_amount = min(coupon.flat_discount, base_price)

    platform_fee = Decimal("0.00") # Platform fee can be 0 or small nominal fee
    final_amount = max(Decimal("0.00"), base_price - discount_amount + platform_fee)

    return {
        "base_amount": base_price,
        "discount_amount": discount_amount,
        "platform_fee": platform_fee,
        "final_amount": final_amount
    }


def create_new_booking(
    db: Session,
    customer_id: str,
    provider_id: str,
    service_id: str,
    address_id: str,
    booking_date: date,
    time_slot: str,
    problem_description: str,
    coupon_code: Optional[str] = None,
    reference_image_urls: Optional[List[str]] = None
) -> Booking:
    """Atomically validates availability and persists the booking."""
    # Verify provider is approved
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider or provider.verification_status != "APPROVED":
        raise BusinessLogicError("The chosen service provider is currently not available for bookings")

    # Verify address belongs to customer
    address = db.query(Address).filter(Address.id == address_id, Address.customer_id == customer_id).first()
    if not address:
        raise NotFoundError("Selected address was not found in your saved addresses")

    # Ensure booking date is not in the past
    if booking_date < date.today():
        raise BusinessLogicError("Booking date cannot be in the past")

    # Concurrency check & double-booking prevention
    if not check_slot_availability(db, provider_id, booking_date, time_slot):
        raise BusinessLogicError(
            f"The time slot '{time_slot}' on {booking_date} is fully booked for this provider. Please select another slot."
        )

    # Calculate pricing
    pricing = calculate_booking_pricing(db, provider_id, service_id, coupon_code)

    booking = Booking(
        booking_reference=generate_booking_reference(),
        customer_id=customer_id,
        provider_id=provider_id,
        service_id=service_id,
        address_id=address_id,
        booking_date=booking_date,
        time_slot=time_slot,
        problem_description=problem_description,
        status="PENDING",
        base_amount=pricing["base_amount"],
        discount_amount=pricing["discount_amount"],
        platform_fee=pricing["platform_fee"],
        final_amount=pricing["final_amount"],
        payment_status="PENDING"
    )
    db.add(booking)
    db.flush() # Populate booking.id

    # Add reference images if provided
    if reference_image_urls:
        for img_url in reference_image_urls:
            b_img = BookingImage(
                booking_id=booking.id,
                image_url=img_url,
                image_type="CUSTOMER_REFERENCE"
            )
            db.add(b_img)

    db.commit()
    db.refresh(booking)

    # Send notification to Provider
    if provider.user:
        create_notification(
            db,
            user_id=provider.user.id,
            title="New Booking Request",
            message=f"New booking request #{booking.booking_reference} received for {booking_date} ({time_slot}).",
            type="BOOKING"
        )

    return booking
