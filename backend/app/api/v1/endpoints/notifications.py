from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.core.exceptions import NotFoundError
from app.models.entities import Notification, User
from app.schemas.all_schemas import NotificationResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[List[NotificationResponse]])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves notifications for the authenticated user."""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()

    return APIResponse(data=[NotificationResponse.model_validate(n) for n in notifications])


@router.patch("/{id}/read", response_model=APIResponse[dict])
def mark_notification_as_read(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks a single notification as read."""
    n = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not n:
        raise NotFoundError("Notification not found")

    n.is_read = True
    db.commit()
    return APIResponse(message="Notification marked as read")


@router.post("/read-all", response_model=APIResponse[dict])
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks all user notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return APIResponse(message="All notifications marked as read")
