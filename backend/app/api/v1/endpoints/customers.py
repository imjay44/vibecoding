from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies import require_customer
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.entities import Address, Customer, Favorite, ServiceProvider, User
from app.schemas.all_schemas import AddressCreate, AddressUpdate, AddressResponse, ServiceProviderResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("/addresses", response_model=APIResponse[List[AddressResponse]])
def get_customer_addresses(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Retrieves all addresses for the authenticated customer."""
    customer = current_user.customer_profile
    if not customer:
        raise NotFoundError("Customer profile not found")

    addresses = db.query(Address).filter(Address.customer_id == customer.id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()
    return APIResponse(data=[AddressResponse.model_validate(a) for a in addresses])


@router.post("/addresses", response_model=APIResponse[AddressResponse], status_code=status.HTTP_201_CREATED)
def create_customer_address(
    payload: AddressCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Adds a new address to customer address book."""
    customer = current_user.customer_profile
    if not customer:
        raise NotFoundError("Customer profile not found")

    # If is_default is true, clear default from existing
    if payload.is_default:
        db.query(Address).filter(Address.customer_id == customer.id).update({"is_default": False})

    address = Address(
        customer_id=customer.id,
        title=payload.title,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        landmark=payload.landmark,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        latitude=payload.latitude,
        longitude=payload.longitude,
        is_default=payload.is_default
    )
    db.add(address)
    db.commit()
    db.refresh(address)

    return APIResponse(message="Address saved successfully", data=AddressResponse.model_validate(address))


@router.put("/addresses/{id}", response_model=APIResponse[AddressResponse])
def update_customer_address(
    id: str,
    payload: AddressUpdate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Updates an existing address."""
    customer = current_user.customer_profile
    address = db.query(Address).filter(Address.id == id, Address.customer_id == customer.id).first()
    if not address:
        raise NotFoundError("Address not found")

    if payload.is_default is True:
        db.query(Address).filter(Address.customer_id == customer.id).update({"is_default": False})
        address.is_default = True
    elif payload.is_default is False:
        address.is_default = False

    if payload.title is not None:
        address.title = payload.title
    if payload.address_line1 is not None:
        address.address_line1 = payload.address_line1
    if payload.address_line2 is not None:
        address.address_line2 = payload.address_line2
    if payload.landmark is not None:
        address.landmark = payload.landmark
    if payload.city is not None:
        address.city = payload.city
    if payload.state is not None:
        address.state = payload.state
    if payload.pincode is not None:
        address.pincode = payload.pincode

    db.commit()
    db.refresh(address)
    return APIResponse(message="Address updated successfully", data=AddressResponse.model_validate(address))


@router.delete("/addresses/{id}", response_model=APIResponse[dict])
def delete_customer_address(
    id: str,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Deletes an address from the customer address book."""
    customer = current_user.customer_profile
    address = db.query(Address).filter(Address.id == id, Address.customer_id == customer.id).first()
    if not address:
        raise NotFoundError("Address not found")

    db.delete(address)
    db.commit()
    return APIResponse(message="Address removed successfully")


@router.get("/favorites", response_model=APIResponse[List[ServiceProviderResponse]])
def get_favorites(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Lists saved favorite providers for customer."""
    customer = current_user.customer_profile
    favorites = db.query(Favorite).options(
        joinedload(Favorite.provider).joinedload(ServiceProvider.user)
    ).filter(Favorite.customer_id == customer.id).all()

    providers = [f.provider for f in favorites if f.provider]
    return APIResponse(data=[ServiceProviderResponse.model_validate(p) for p in providers])


@router.post("/favorites/{provider_id}", response_model=APIResponse[dict])
def toggle_favorite(
    provider_id: str,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Toggles bookmark status for a service provider."""
    customer = current_user.customer_profile
    existing = db.query(Favorite).filter(
        Favorite.customer_id == customer.id,
        Favorite.provider_id == provider_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return APIResponse(message="Provider removed from favorites", data={"is_favorite": False})
    else:
        new_fav = Favorite(customer_id=customer.id, provider_id=provider_id)
        db.add(new_fav)
        db.commit()
        return APIResponse(message="Provider added to favorites", data={"is_favorite": True})
