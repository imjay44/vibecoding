from typing import List
from datetime import datetime, timezone
from decimal import Decimal
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import require_admin, get_current_user
from app.core.exceptions import ConflictError, NotFoundError, BusinessLogicError
from app.models.entities import Coupon, User
from app.schemas.all_schemas import (
    CouponCreate, CouponResponse, CouponValidateRequest, CouponValidateResponse
)
from app.schemas.common import APIResponse

router = APIRouter()


@router.post("/validate", response_model=APIResponse[CouponValidateResponse])
def validate_coupon(
    payload: CouponValidateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Checks coupon validity and calculates discounted order amount."""
    code = payload.code.upper().strip()
    coupon = db.query(Coupon).filter(
        Coupon.code == code,
        Coupon.is_active == True,
        Coupon.valid_until > datetime.now(timezone.utc)
    ).first()

    if not coupon:
        return APIResponse(
            success=False,
            message="Invalid or expired promo coupon",
            data=CouponValidateResponse(
                is_valid=False,
                code=code,
                discount_amount=Decimal("0.00"),
                final_amount=payload.order_amount,
                message="Promo code is invalid or has expired."
            )
        )

    if payload.order_amount < coupon.min_order_amount:
        return APIResponse(
            success=False,
            message=f"Minimum order amount of ₹{coupon.min_order_amount} required for this coupon",
            data=CouponValidateResponse(
                is_valid=False,
                code=code,
                discount_amount=Decimal("0.00"),
                final_amount=payload.order_amount,
                message=f"Minimum order amount of ₹{coupon.min_order_amount} required."
            )
        )

    discount = Decimal("0.00")
    if coupon.discount_percent:
        discount = (payload.order_amount * (coupon.discount_percent / Decimal("100.00"))).quantize(Decimal("0.01"))
        if coupon.max_discount and discount > coupon.max_discount:
            discount = coupon.max_discount
    elif coupon.flat_discount:
        discount = min(coupon.flat_discount, payload.order_amount)

    final_amount = max(Decimal("0.00"), payload.order_amount - discount)

    return APIResponse(
        message="Coupon applied successfully",
        data=CouponValidateResponse(
            is_valid=True,
            code=code,
            discount_amount=discount,
            final_amount=final_amount,
            message=f"₹{discount} discount applied!"
        )
    )


@router.get("", response_model=APIResponse[List[CouponResponse]])
def list_coupons(db: Session = Depends(get_db)):
    """Retrieves all active coupons."""
    coupons = db.query(Coupon).filter(
        Coupon.is_active == True,
        Coupon.valid_until > datetime.now(timezone.utc)
    ).all()
    return APIResponse(data=[CouponResponse.model_validate(c) for c in coupons])


@router.post("", response_model=APIResponse[CouponResponse], status_code=status.HTTP_201_CREATED)
def create_coupon(
    payload: CouponCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Creates a new promotional coupon (Admin only)."""
    code = payload.code.upper().strip()
    if db.query(Coupon).filter(Coupon.code == code).first():
        raise ConflictError("A coupon with this code already exists")

    coupon = Coupon(
        code=code,
        discount_percent=payload.discount_percent,
        flat_discount=payload.flat_discount,
        min_order_amount=payload.min_order_amount,
        max_discount=payload.max_discount,
        valid_until=payload.valid_until,
        is_active=True
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)

    return APIResponse(message="Coupon created successfully", data=CouponResponse.model_validate(coupon))
