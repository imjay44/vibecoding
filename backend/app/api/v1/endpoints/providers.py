from typing import List, Optional
from datetime import time
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies import require_provider, get_current_user
from app.core.exceptions import NotFoundError, ConflictError, BusinessLogicError
from app.core.security import get_password_hash
from app.models.entities import (
    ServiceProvider, ProviderService, ServiceArea, AvailabilitySlot,
    Technician, User, ProviderEarning, Service
)
from app.schemas.all_schemas import (
    ServiceProviderResponse, ProviderServiceCreate, ProviderServiceUpdate,
    ProviderServiceResponse, AvailabilitySlotCreate, AvailabilitySlotResponse,
    ServiceAreaCreate, ServiceAreaResponse, TechnicianCreateRequest,
    TechnicianResponse, ProviderEarningResponse
)
from app.schemas.common import APIResponse

router = APIRouter()


# ---------------- Public Provider APIs ---------------- #

@router.get("", response_model=APIResponse[List[ServiceProviderResponse]])
def list_approved_providers(
    city: Optional[str] = Query(None),
    service_id: Optional[str] = Query(None),
    min_rating: Optional[Decimal] = Query(None),
    db: Session = Depends(get_db)
):
    """Browses approved service providers with filters."""
    query = db.query(ServiceProvider).options(
        joinedload(ServiceProvider.user),
        joinedload(ServiceProvider.service_areas),
        joinedload(ServiceProvider.provider_services).joinedload(ProviderService.service)
    ).filter(ServiceProvider.verification_status == "APPROVED")

    if min_rating is not None:
        query = query.filter(ServiceProvider.average_rating >= min_rating)

    if city:
        query = query.join(ServiceProvider.service_areas).filter(ServiceArea.city.ilike(f"%{city.strip()}%"))

    if service_id:
        query = query.join(ServiceProvider.provider_services).filter(
            ProviderService.service_id == service_id,
            ProviderService.is_available == True
        )

    providers = query.distinct().all()
    return APIResponse(data=[ServiceProviderResponse.model_validate(p) for p in providers])


@router.get("/{id}", response_model=APIResponse[ServiceProviderResponse])
def get_provider_details(id: str, db: Session = Depends(get_db)):
    """Retrieves full public profile for a specific provider."""
    provider = db.query(ServiceProvider).options(
        joinedload(ServiceProvider.user),
        joinedload(ServiceProvider.service_areas),
        joinedload(ServiceProvider.provider_services).joinedload(ProviderService.service)
    ).filter(ServiceProvider.id == id).first()

    if not provider:
        raise NotFoundError("Provider not found")

    return APIResponse(data=ServiceProviderResponse.model_validate(provider))


# ---------------- Provider Authenticated Dashboard APIs ---------------- #

@router.get("/me/services", response_model=APIResponse[List[ProviderServiceResponse]])
def get_my_services(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Retrieves all services configured by the logged-in provider."""
    provider = current_user.provider_profile
    services = db.query(ProviderService).options(
        joinedload(ProviderService.service)
    ).filter(ProviderService.provider_id == provider.id).all()
    return APIResponse(data=[ProviderServiceResponse.model_validate(s) for s in services])


@router.post("/me/services", response_model=APIResponse[ProviderServiceResponse], status_code=status.HTTP_201_CREATED)
def add_my_service(
    payload: ProviderServiceCreate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Configures a catalog service offering with custom price."""
    provider = current_user.provider_profile
    if provider.verification_status != "APPROVED":
        raise BusinessLogicError("Your provider profile is pending admin approval. You cannot publish services yet.")

    existing = db.query(ProviderService).filter(
        ProviderService.provider_id == provider.id,
        ProviderService.service_id == payload.service_id
    ).first()

    if existing:
        existing.custom_price = payload.custom_price
        existing.is_available = payload.is_available
        db.commit()
        db.refresh(existing)
        return APIResponse(message="Service offering updated", data=ProviderServiceResponse.model_validate(existing))

    ps = ProviderService(
        provider_id=provider.id,
        service_id=payload.service_id,
        custom_price=payload.custom_price,
        is_available=payload.is_available
    )
    db.add(ps)
    db.commit()
    db.refresh(ps)
    return APIResponse(message="Service added successfully", data=ProviderServiceResponse.model_validate(ps))


@router.put("/me/services/{id}", response_model=APIResponse[ProviderServiceResponse])
def update_my_service(
    id: str,
    payload: ProviderServiceUpdate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Updates custom pricing or availability for a provider service."""
    provider = current_user.provider_profile
    ps = db.query(ProviderService).filter(ProviderService.id == id, ProviderService.provider_id == provider.id).first()
    if not ps:
        raise NotFoundError("Provider service record not found")

    if payload.custom_price is not None:
        ps.custom_price = payload.custom_price
    if payload.is_available is not None:
        ps.is_available = payload.is_available

    db.commit()
    db.refresh(ps)
    return APIResponse(message="Service updated successfully", data=ProviderServiceResponse.model_validate(ps))


@router.delete("/me/services/{id}", response_model=APIResponse[dict])
def delete_my_service(
    id: str,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Removes a service offering from provider."""
    provider = current_user.provider_profile
    ps = db.query(ProviderService).filter(ProviderService.id == id, ProviderService.provider_id == provider.id).first()
    if not ps:
        raise NotFoundError("Provider service record not found")

    db.delete(ps)
    db.commit()
    return APIResponse(message="Service offering removed")


@router.get("/me/availability", response_model=APIResponse[List[AvailabilitySlotResponse]])
def get_my_availability(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Retrieves operational availability schedule."""
    provider = current_user.provider_profile
    slots = db.query(AvailabilitySlot).filter(AvailabilitySlot.provider_id == provider.id).order_by(AvailabilitySlot.day_of_week).all()
    return APIResponse(data=[AvailabilitySlotResponse.model_validate(s) for s in slots])


@router.put("/me/availability", response_model=APIResponse[List[AvailabilitySlotResponse]])
def update_my_availability(
    slots_data: List[AvailabilitySlotCreate],
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Configures complete weekly availability schedule."""
    provider = current_user.provider_profile
    db.query(AvailabilitySlot).filter(AvailabilitySlot.provider_id == provider.id).delete()

    created_slots = []
    for s in slots_data:
        try:
            parts_s = [int(p) for p in s.start_time.split(":")[:2]]
            parts_e = [int(p) for p in s.end_time.split(":")[:2]]
            start_t = time(hour=parts_s[0], minute=parts_s[1])
            end_t = time(hour=parts_e[0], minute=parts_e[1])
        except Exception:
            start_t = time(hour=9, minute=0)
            end_t = time(hour=18, minute=0)

        slot = AvailabilitySlot(
            provider_id=provider.id,
            day_of_week=s.day_of_week,
            start_time=start_t,
            end_time=end_t,
            slot_capacity=s.slot_capacity,
            is_active=s.is_active
        )
        db.add(slot)
        created_slots.append(slot)

    db.commit()
    return APIResponse(message="Availability schedule saved", data=[AvailabilitySlotResponse.model_validate(s) for s in created_slots])


@router.get("/me/service-areas", response_model=APIResponse[List[ServiceAreaResponse]])
def get_my_service_areas(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Retrieves provider coverage areas."""
    provider = current_user.provider_profile
    areas = db.query(ServiceArea).filter(ServiceArea.provider_id == provider.id).all()
    return APIResponse(data=[ServiceAreaResponse.model_validate(a) for a in areas])


@router.post("/me/service-areas", response_model=APIResponse[ServiceAreaResponse], status_code=status.HTTP_201_CREATED)
def add_my_service_area(
    payload: ServiceAreaCreate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Adds a new operational city/pincode for the provider."""
    provider = current_user.provider_profile
    area = ServiceArea(
        provider_id=provider.id,
        city=payload.city,
        pincode=payload.pincode
    )
    db.add(area)
    db.commit()
    db.refresh(area)
    return APIResponse(message="Service area added", data=ServiceAreaResponse.model_validate(area))


@router.delete("/me/service-areas/{id}", response_model=APIResponse[dict])
def delete_my_service_area(
    id: str,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Removes a service area."""
    provider = current_user.provider_profile
    area = db.query(ServiceArea).filter(ServiceArea.id == id, ServiceArea.provider_id == provider.id).first()
    if not area:
        raise NotFoundError("Service area not found")

    db.delete(area)
    db.commit()
    return APIResponse(message="Service area removed")


@router.get("/me/technicians", response_model=APIResponse[List[TechnicianResponse]])
def get_my_technicians(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Lists all technicians employed under the provider."""
    provider = current_user.provider_profile
    technicians = db.query(Technician).options(joinedload(Technician.user)).filter(Technician.provider_id == provider.id).all()
    return APIResponse(data=[TechnicianResponse.model_validate(t) for t in technicians])


@router.post("/me/technicians", response_model=APIResponse[TechnicianResponse], status_code=status.HTTP_201_CREATED)
def create_technician_account(
    payload: TechnicianCreateRequest,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Creates a new technician employee account under the provider."""
    provider = current_user.provider_profile
    if provider.verification_status != "APPROVED":
        raise BusinessLogicError("Only approved service providers can onboard technicians")

    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise ConflictError("An account with this email already exists")

    if db.query(User).filter(User.phone_number == payload.phone_number).first():
        raise ConflictError("An account with this phone number already exists")

    user = User(
        email=payload.email.lower(),
        phone_number=payload.phone_number,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="TECHNICIAN",
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.flush()

    technician = Technician(
        user_id=user.id,
        provider_id=provider.id,
        specialization=payload.specialization,
        is_available=True
    )
    db.add(technician)
    db.commit()
    db.refresh(technician)

    return APIResponse(message="Technician account created successfully", data=TechnicianResponse.model_validate(technician))


@router.get("/me/earnings", response_model=APIResponse[List[ProviderEarningResponse]])
def get_my_earnings(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    """Retrieves financial ledger and earnings breakdown for provider."""
    provider = current_user.provider_profile
    earnings = db.query(ProviderEarning).filter(ProviderEarning.provider_id == provider.id).order_by(ProviderEarning.created_at.desc()).all()
    return APIResponse(data=[ProviderEarningResponse.model_validate(e) for e in earnings])
