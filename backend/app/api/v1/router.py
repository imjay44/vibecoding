from fastapi import APIRouter

from app.api.v1.endpoints import (
    health, auth, categories, services, customers, providers,
    technicians, bookings, payments, invoices, reviews, complaints,
    coupons, notifications, admin, analytics, upload
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(categories.router, prefix="/categories", tags=["Service Categories"])
api_router.include_router(services.router, prefix="/services", tags=["Services Catalog"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customer Portal"])
api_router.include_router(providers.router, prefix="/providers", tags=["Service Provider Portal"])
api_router.include_router(technicians.router, prefix="/technicians", tags=["Technician Workforce"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings Lifecycle"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments & Gateway"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews & Ratings"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["Complaints & Disputes"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["Coupons & Discounts"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notification Center"])
api_router.include_router(admin.router, prefix="/admin", tags=["Super Admin"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Platform Analytics"])
api_router.include_router(upload.router, prefix="/upload", tags=["Media Upload"])
