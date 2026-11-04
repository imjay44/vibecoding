from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------------- Auth Schemas ---------------- #

class CustomerRegisterRequest(BaseModel):
    email: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=150)
    emergency_contact: Optional[str] = None


class ProviderRegisterRequest(BaseModel):
    email: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=150)
    business_name: str = Field(..., min_length=2, max_length=200)
    business_address: str = Field(..., min_length=5)
    description: Optional[str] = None
    years_of_experience: int = Field(default=1, ge=0)
    id_proof_url: Optional[str] = None
    license_doc_url: Optional[str] = None


class TechnicianCreateRequest(BaseModel):
    email: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=150)
    specialization: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user: Dict[str, Any]


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


# ---------------- User & Profile Schemas ---------------- #

class UserResponse(BaseModel):
    id: str
    email: str
    phone_number: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None


# ---------------- Address Schemas ---------------- #

class AddressCreate(BaseModel):
    title: str = Field(default="Home", max_length=50)
    address_line1: str = Field(..., min_length=3, max_length=255)
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    pincode: str = Field(..., min_length=4, max_length=20)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    is_default: bool = False


class AddressUpdate(BaseModel):
    title: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: str
    customer_id: str
    title: str
    address_line1: str
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Category & Service Schemas ---------------- #

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ServiceCreate(BaseModel):
    category_id: str
    name: str = Field(..., min_length=2, max_length=150)
    slug: Optional[str] = None
    description: str
    base_price: Decimal = Field(..., gt=0)
    estimated_duration_minutes: int = Field(default=60, gt=0)
    image_url: Optional[str] = None


class ServiceUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = Field(None, gt=0)
    estimated_duration_minutes: Optional[int] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: str
    category_id: str
    name: str
    slug: str
    description: str
    base_price: Decimal
    estimated_duration_minutes: int
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Provider & Technician Schemas ---------------- #

class ProviderServiceCreate(BaseModel):
    service_id: str
    custom_price: Decimal = Field(..., gt=0)
    is_available: bool = True


class ProviderServiceUpdate(BaseModel):
    custom_price: Optional[Decimal] = Field(None, gt=0)
    is_available: Optional[bool] = None


class ProviderServiceResponse(BaseModel):
    id: str
    provider_id: str
    service_id: str
    custom_price: Decimal
    is_available: bool
    service: Optional[ServiceResponse] = None

    model_config = ConfigDict(from_attributes=True)


class AvailabilitySlotCreate(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str # "09:00:00"
    end_time: str   # "17:00:00"
    slot_capacity: int = Field(default=1, ge=1)
    is_active: bool = True


class AvailabilitySlotResponse(BaseModel):
    id: str
    provider_id: str
    day_of_week: int
    start_time: time
    end_time: time
    slot_capacity: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ServiceAreaCreate(BaseModel):
    city: str
    pincode: str


class ServiceAreaResponse(BaseModel):
    id: str
    provider_id: str
    city: str
    pincode: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ServiceProviderResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    description: Optional[str] = None
    business_address: str
    years_of_experience: int
    verification_status: str
    rejection_reason: Optional[str] = None
    id_proof_url: Optional[str] = None
    license_doc_url: Optional[str] = None
    commission_rate: Decimal
    average_rating: Decimal
    total_reviews: int
    created_at: datetime
    user: Optional[UserResponse] = None
    service_areas: Optional[List[ServiceAreaResponse]] = None
    provider_services: Optional[List[ProviderServiceResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class TechnicianResponse(BaseModel):
    id: str
    user_id: str
    provider_id: str
    specialization: Optional[str] = None
    is_available: bool
    rating: Decimal
    total_jobs_completed: int
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Booking Schemas ---------------- #

class BookingCreate(BaseModel):
    provider_id: str
    service_id: str
    address_id: str
    booking_date: date
    time_slot: str = Field(..., min_length=3, max_length=50) # e.g. "10:00 AM - 12:00 PM"
    problem_description: str = Field(..., min_length=5)
    coupon_code: Optional[str] = None
    reference_image_urls: Optional[List[str]] = None


class BookingActionRequest(BaseModel):
    reason: Optional[str] = None


class TechnicianAssignRequest(BaseModel):
    technician_id: str


class BookingImageResponse(BaseModel):
    id: str
    booking_id: str
    image_url: str
    image_type: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingAssignmentResponse(BaseModel):
    id: str
    booking_id: str
    technician_id: str
    assigned_at: datetime
    accepted_at: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    technician_remarks: Optional[str] = None
    technician: Optional[TechnicianResponse] = None

    model_config = ConfigDict(from_attributes=True)


class BookingResponse(BaseModel):
    id: str
    booking_reference: str
    customer_id: str
    provider_id: str
    service_id: str
    address_id: str
    booking_date: date
    time_slot: str
    problem_description: str
    status: str
    cancellation_reason: Optional[str] = None
    rejection_reason: Optional[str] = None
    base_amount: Decimal
    discount_amount: Decimal
    platform_fee: Decimal
    final_amount: Decimal
    payment_status: str
    created_at: datetime
    updated_at: datetime
    service: Optional[ServiceResponse] = None
    provider: Optional[ServiceProviderResponse] = None
    address: Optional[AddressResponse] = None
    assignments: Optional[List[BookingAssignmentResponse]] = None
    images: Optional[List[BookingImageResponse]] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Payment & Invoice Schemas ---------------- #

class CreateOrderRequest(BaseModel):
    booking_id: str


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int # Amount in paise (integer)
    currency: str
    key_id: str
    booking_id: str
    booking_reference: str


class VerifyPaymentRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    id: str
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    booking_id: str
    subtotal: Decimal
    tax_amount: Decimal
    discount: Decimal
    total_amount: Decimal
    issued_at: datetime
    booking: Optional[BookingResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Coupon Schemas ---------------- #

class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=30)
    discount_percent: Optional[Decimal] = Field(None, ge=0, le=100)
    flat_discount: Optional[Decimal] = Field(None, ge=0)
    min_order_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    max_discount: Optional[Decimal] = Field(None, ge=0)
    valid_until: datetime


class CouponValidateRequest(BaseModel):
    code: str
    order_amount: Decimal


class CouponValidateResponse(BaseModel):
    is_valid: bool
    code: str
    discount_amount: Decimal
    final_amount: Decimal
    message: str


class CouponResponse(BaseModel):
    id: str
    code: str
    discount_percent: Optional[Decimal] = None
    flat_discount: Optional[Decimal] = None
    min_order_amount: Decimal
    max_discount: Optional[Decimal] = None
    valid_until: datetime
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Review & Complaint Schemas ---------------- #

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewReplyRequest(BaseModel):
    reply: str = Field(..., min_length=2)


class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    provider_id: str
    rating: int
    comment: Optional[str] = None
    provider_reply: Optional[str] = None
    created_at: datetime
    customer_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintCreate(BaseModel):
    booking_id: str
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)


class ComplaintStatusUpdate(BaseModel):
    status: str # OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    admin_notes: Optional[str] = None


class ComplaintResponse(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    title: str
    description: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Notification Schemas ---------------- #

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Admin & Analytics Schemas ---------------- #

class ProviderVerifyRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    rejection_reason: Optional[str] = None


class AdminStatsResponse(BaseModel):
    total_customers: int
    total_providers: int
    total_technicians: int
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    total_revenue: Decimal
    platform_commission: Decimal
    provider_earnings: Decimal


class ProviderEarningResponse(BaseModel):
    id: str
    provider_id: str
    booking_id: str
    gross_amount: Decimal
    platform_commission: Decimal
    net_earnings: Decimal
    payout_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
