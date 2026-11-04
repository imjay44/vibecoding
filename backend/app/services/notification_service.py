from sqlalchemy.orm import Session
from app.models.entities import Notification


def create_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    type: str = "GENERAL"
) -> Notification:
    """Creates and persists an in-app notification for a user."""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
