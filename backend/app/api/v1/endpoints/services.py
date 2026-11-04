import re
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.dependencies import require_admin
from app.core.exceptions import ConflictError, NotFoundError
from app.models.entities import Service, ServiceCategory, User
from app.schemas.all_schemas import ServiceCreate, ServiceUpdate, ServiceResponse
from app.schemas.common import APIResponse

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    return re.sub(r"[^\w\s-]", "", text).replace(" ", "-")


@router.get("", response_model=APIResponse[List[ServiceResponse]])
def list_services(
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    db: Session = Depends(get_db)
):
    """Browses platform services with multi-field search and filters."""
    query = db.query(Service).options(joinedload(Service.category)).filter(Service.is_active == True)

    if category_id:
        query = query.filter(Service.category_id == category_id)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Service.name.ilike(search_fmt),
                Service.description.ilike(search_fmt)
            )
        )

    if min_price is not None:
        query = query.filter(Service.base_price >= min_price)

    if max_price is not None:
        query = query.filter(Service.base_price <= max_price)

    services = query.order_by(Service.name).all()
    return APIResponse(data=[ServiceResponse.model_validate(s) for s in services])


@router.get("/{id}", response_model=APIResponse[ServiceResponse])
def get_service(id: str, db: Session = Depends(get_db)):
    """Retrieves full details for a single service."""
    service = db.query(Service).options(joinedload(Service.category)).filter(Service.id == id).first()
    if not service:
        raise NotFoundError("Service not found")
    return APIResponse(data=ServiceResponse.model_validate(service))


@router.post("", response_model=APIResponse[ServiceResponse], status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Creates a new service in the catalog (Admin only)."""
    # Verify category exists
    category = db.query(ServiceCategory).filter(ServiceCategory.id == payload.category_id).first()
    if not category:
        raise NotFoundError("Specified category does not exist")

    slug = payload.slug or slugify(payload.name)
    if db.query(Service).filter(Service.slug == slug).first():
        slug = f"{slug}-{payload.category_id[:6]}"

    service = Service(
        category_id=payload.category_id,
        name=payload.name,
        slug=slug,
        description=payload.description,
        base_price=payload.base_price,
        estimated_duration_minutes=payload.estimated_duration_minutes,
        image_url=payload.image_url,
        is_active=True
    )
    db.add(service)
    db.commit()
    db.refresh(service)

    return APIResponse(message="Service created successfully", data=ServiceResponse.model_validate(service))


@router.put("/{id}", response_model=APIResponse[ServiceResponse])
def update_service(
    id: str,
    payload: ServiceUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Updates service details (Admin only)."""
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise NotFoundError("Service not found")

    if payload.category_id is not None:
        service.category_id = payload.category_id
    if payload.name is not None:
        service.name = payload.name
    if payload.description is not None:
        service.description = payload.description
    if payload.base_price is not None:
        service.base_price = payload.base_price
    if payload.estimated_duration_minutes is not None:
        service.estimated_duration_minutes = payload.estimated_duration_minutes
    if payload.image_url is not None:
        service.image_url = payload.image_url
    if payload.is_active is not None:
        service.is_active = payload.is_active

    db.commit()
    db.refresh(service)
    return APIResponse(message="Service updated successfully", data=ServiceResponse.model_validate(service))


@router.delete("/{id}", response_model=APIResponse[dict])
def delete_service(
    id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Deactivates a service (Admin only)."""
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise NotFoundError("Service not found")

    service.is_active = False
    db.commit()
    return APIResponse(message="Service deactivated successfully")
