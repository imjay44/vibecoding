from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.db.session import get_db
from app.dependencies import get_current_user, require_customer, require_provider
from app.core.exceptions import (
    NotFoundError, ConflictError, BusinessLogicError, PermissionDeniedError
)
from app.models.entities import Review, Booking, ServiceProvider, User
from app.schemas.all_schemas import ReviewCreate, ReviewReplyRequest, ReviewResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.post("", response_model=APIResponse[ReviewResponse], status_code=status.HTTP_201_CREATED)
def submit_review(
    payload: ReviewCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Submits a customer rating (1-5) and review for a completed booking."""
    customer = current_user.customer_profile
    booking = db.query(Booking).filter(
        Booking.id == payload.booking_id,
        Booking.customer_id == customer.id
    ).first()

    if not booking:
        raise NotFoundError("Booking not found")

    if booking.status != "COMPLETED":
        raise BusinessLogicError("Reviews can only be submitted for completed services")

    # Anti-duplicate check
    existing_review = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing_review:
        raise ConflictError("You have already reviewed this booking")

    review = Review(
        booking_id=booking.id,
        customer_id=customer.id,
        provider_id=booking.provider_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(review)
    db.flush()

    # Recalculate provider average rating and review count
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == booking.provider_id).first()
    if provider:
        stats = db.query(
            func.avg(Review.rating),
            func.count(Review.id)
        ).filter(Review.provider_id == provider.id).first()

        provider.average_rating = Decimal(str(round(stats[0] or 0.0, 2)))
        provider.total_reviews = stats[1] or 0

    db.commit()
    db.refresh(review)

    resp = ReviewResponse.model_validate(review)
    resp.customer_name = current_user.full_name
    return APIResponse(message="Thank you! Your review has been submitted.", data=resp)


@router.get("/provider/{provider_id}", response_model=APIResponse[List[ReviewResponse]])
def get_provider_reviews(provider_id: str, db: Session = Depends(get_db)):
    """Retrieves all reviews for a provider."""
    reviews = db.query(Review).options(
        joinedload(Review.customer).joinedload(Customer.user)
    ).filter(Review.provider_id == provider_id).order_by(Review.created_at.desc()).all()

    result = []
    for r in reviews:
        item = ReviewResponse.model_validate(r)
        if r.customer and r.customer.user:
            item.customer_name = r.customer.user.full_name
        result.append(item)

    return APIResponse(data=result)


@router.post("/{id}/reply", response_model=APIResponse[ReviewResponse])
def reply_to_review(
    id: str,
    payload: ReviewReplyRequest,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Allows service provider to reply to customer feedback."""
    provider = current_user.provider_profile
    review = db.query(Review).filter(Review.id == id, Review.provider_id == provider.id).first()
    if not review:
        raise NotFoundError("Review not found")

    review.provider_reply = payload.reply
    db.commit()
    db.refresh(review)

    return APIResponse(message="Reply published", data=ReviewResponse.model_validate(review))
