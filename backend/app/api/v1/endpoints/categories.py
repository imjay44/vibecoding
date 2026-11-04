import re
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import require_admin
from app.core.exceptions import ConflictError, NotFoundError
from app.models.entities import ServiceCategory, User
from app.schemas.all_schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.common import APIResponse

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    return re.sub(r"[^\w\s-]", "", text).replace(" ", "-")


@router.get("", response_model=APIResponse[List[CategoryResponse]])
def list_categories(db: Session = Depends(get_db)):
    """Retrieves all active service categories."""
    categories = db.query(ServiceCategory).filter(ServiceCategory.is_active == True).order_by(ServiceCategory.name).all()
    return APIResponse(data=[CategoryResponse.model_validate(c) for c in categories])


@router.post("", response_model=APIResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Creates a new service category (Admin only)."""
    slug = payload.slug or slugify(payload.name)
    if db.query(ServiceCategory).filter(ServiceCategory.slug == slug).first():
        raise ConflictError(f"Category slug '{slug}' already exists")

    category = ServiceCategory(
        name=payload.name,
        slug=slug,
        description=payload.description,
        icon=payload.icon,
        image_url=payload.image_url,
        is_active=True
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return APIResponse(
        message="Category created successfully",
        data=CategoryResponse.model_validate(category)
    )


@router.put("/{id}", response_model=APIResponse[CategoryResponse])
def update_category(
    id: str,
    payload: CategoryUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Updates category details (Admin only)."""
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise NotFoundError("Category not found")

    if payload.name is not None:
        category.name = payload.name
    if payload.description is not None:
        category.description = payload.description
    if payload.icon is not None:
        category.icon = payload.icon
    if payload.image_url is not None:
        category.image_url = payload.image_url
    if payload.is_active is not None:
        category.is_active = payload.is_active

    db.commit()
    db.refresh(category)
    return APIResponse(message="Category updated successfully", data=CategoryResponse.model_validate(category))


@router.delete("/{id}", response_model=APIResponse[dict])
def delete_category(
    id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Deactivates a category (Admin only)."""
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise NotFoundError("Category not found")

    category.is_active = False
    db.commit()
    return APIResponse(message="Category deactivated successfully")
