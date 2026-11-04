import uuid
from datetime import datetime, date, time, timezone
from typing import Optional, List
from decimal import Decimal

from sqlalchemy import (
    String, Integer, Numeric, Boolean, DateTime, Date, Time, Text,
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, index=True) # SUPER_ADMIN, CUSTOMER, SERVICE_PROVIDER, TECHNICIAN
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    customer_profile: Mapped[Optional["Customer"]] = relationship("Customer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    provider_profile: Mapped[Optional["ServiceProvider"]] = relationship("ServiceProvider", back_populates="user", uselist=False, cascade="all, delete-orphan")
    technician_profile: Mapped[Optional["Technician"]] = relationship("Technician", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="customer_profile")
    addresses: Mapped[List["Address"]] = relationship("Address", back_populates="customer", cascade="all, delete-orphan")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="customer")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="customer")
    complaints: Mapped[List["Complaint"]] = relationship("Complaint", back_populates="customer")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="customer", cascade="all, delete-orphan")


class ServiceProvider(Base):
    __tablename__ = "service_providers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    business_address: Mapped[str] = mapped_column(Text, nullable=False)
    years_of_experience: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    verification_status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True, nullable=False) # PENDING, APPROVED, REJECTED, SUSPENDED
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    id_proof_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    license_doc_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    commission_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("10.00"), nullable=False)
    average_rating: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0.00"), nullable=False)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="provider_profile")
    technicians: Mapped[List["Technician"]] = relationship("Technician", back_populates="provider", cascade="all, delete-orphan")
    provider_services: Mapped[List["ProviderService"]] = relationship("ProviderService", back_populates="provider", cascade="all, delete-orphan")
    service_areas: Mapped[List["ServiceArea"]] = relationship("ServiceArea", back_populates="provider", cascade="all, delete-orphan")
    availability_slots: Mapped[List["AvailabilitySlot"]] = relationship("AvailabilitySlot", back_populates="provider", cascade="all, delete-orphan")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="provider")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="provider")
    earnings: Mapped[List["ProviderEarning"]] = relationship("ProviderEarning", back_populates="provider")


class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False)
    specialization: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rating: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0.00"), nullable=False)
    total_jobs_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="technician_profile")
    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider", back_populates="technicians")
    assignments: Mapped[List["BookingAssignment"]] = relationship("BookingAssignment", back_populates="technician")


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(50), default="Home", nullable=False)
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    landmark: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(11, 8), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="addresses")


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    services: Mapped[List["Service"]] = relationship("Service", back_populates="category", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_categories.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    base_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    estimated_duration_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    category: Mapped["ServiceCategory"] = relationship("ServiceCategory", back_populates="services")
    provider_services: Mapped[List["ProviderService"]] = relationship("ProviderService", back_populates="service")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="service")


class ProviderService(Base):
    __tablename__ = "provider_services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    custom_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider", back_populates="provider_services")
    service: Mapped["Service"] = relationship("Service", back_populates="provider_services")

    __table_args__ = (
        UniqueConstraint("provider_id", "service_id", name="uq_provider_service"),
    )


class ServiceArea(Base):
    __tablename__ = "service_areas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider", back_populates="service_areas")


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    slot_capacity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider", back_populates="availability_slots")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    booking_reference: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="RESTRICT"), nullable=False)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id", ondelete="RESTRICT"), nullable=False)
    address_id: Mapped[str] = mapped_column(String(36), ForeignKey("addresses.id", ondelete="RESTRICT"), nullable=False)
    
    booking_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    time_slot: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "10:00 AM - 12:00 PM"
    problem_description: Mapped[str] = mapped_column(Text, nullable=False)
    
    status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True, nullable=False) 
    # PENDING, CONFIRMED, PROVIDER_ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED
    
    cancellation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    base_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    platform_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    final_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    payment_status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True, nullable=False)
    # PENDING, PARTIALLY_PAID, PAID, FAILED, REFUNDED
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="bookings")
    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider", back_populates="bookings")
    service: Mapped["Service"] = relationship("Service", back_populates="bookings")
    address: Mapped["Address"] = relationship("Address")
    assignments: Mapped[List["BookingAssignment"]] = relationship("BookingAssignment", back_populates="booking", cascade="all, delete-orphan")
    images: Mapped[List["BookingImage"]] = relationship("BookingImage", back_populates="booking", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="booking")
    invoice: Mapped[Optional["Invoice"]] = relationship("Invoice", back_populates="booking", uselist=False)
    review: Mapped[Optional["Review"]] = relationship("Review", back_populates="booking", uselist=False)
    complaints: Mapped[List["Complaint"]] = relationship("Complaint", back_populates="booking")
    earning: Mapped[Optional["ProviderEarning"]] = relationship("ProviderEarning", back_populates="booking", uselist=False)

    __table_args__ = (
        Index("idx_booking_provider_slot", "provider_id", "booking_date", "time_slot"),
    )


class BookingAssignment(Base):
    __tablename__ = "booking_assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    technician_id: Mapped[str] = mapped_column(String(36), ForeignKey("technicians.id", ondelete="RESTRICT"), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    accepted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    arrival_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    technician_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="assignments")
    technician: Mapped["Technician"] = relationship("Technician", back_populates="assignments")


class BookingImage(Base):
    __tablename__ = "booking_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    image_type: Mapped[str] = mapped_column(String(50), nullable=False) # CUSTOMER_REFERENCE, BEFORE_WORK, AFTER_WORK
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="images")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False)
    razorpay_order_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    razorpay_signature: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True, nullable=False) # PENDING, PAID, FAILED, REFUNDED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payments")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    discount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="invoice")


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    discount_percent: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    flat_discount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    min_order_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    max_discount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    valid_until: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False) # 1 to 5
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    provider_reply: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="review")
    customer: Mapped["Customer"] = relationship("Customer", back_populates="reviews")
    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider", back_populates="reviews")


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="OPEN", index=True, nullable=False) # OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="complaints")
    customer: Mapped["Customer"] = relationship("Customer", back_populates="complaints")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="notifications")


class ProviderEarning(Base):
    __tablename__ = "provider_earnings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="CASCADE"), index=True, nullable=False)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    platform_commission: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    net_earnings: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payout_status: Mapped[str] = mapped_column(String(30), default="PENDING", nullable=False) # PENDING, PROCESSED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider", back_populates="earnings")
    booking: Mapped["Booking"] = relationship("Booking", back_populates="earning")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="favorites")
    provider: Mapped["ServiceProvider"] = relationship("ServiceProvider")

    __table_args__ = (
        UniqueConstraint("customer_id", "provider_id", name="uq_customer_favorite_provider"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
