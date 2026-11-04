# HomeServe Technologies – Security & Compliance Checklist

## 1. Authentication & Session Security
- [x] **Password Hashing**: Strong bcrypt hashing with salt rounds. Plaintext passwords never stored or logged.
- [x] **JWT Token Separation**: Short-lived access tokens (60 minutes) combined with revocable refresh tokens stored in database.
- [x] **RBAC Enforcement**: Server-side role checks on every protected endpoint. Client-side hiding alone is never trusted.
- [x] **No Self-Assigned Privileges**: SUPER_ADMIN role can never be self-selected during registration; only bootstrapped via secure CLI or DB seed.
- [x] **Provider Verification Gate**: Newly registered service providers remain in `PENDING` state and cannot publish services or accept bookings until approved by an administrator.

## 2. Authorization & Data Isolation
- [x] **Tenant/Ownership Isolation**: Customers can only query and mutate their own bookings, addresses, and complaints.
- [x] **Provider Boundaries**: Providers cannot view or modify bookings belonging to competitor providers.
- [x] **Technician Scoping**: Technicians are strictly restricted to jobs specifically assigned to them by their parent provider.

## 3. Concurrency & Business Logic Protection
- [x] **Double Booking Defense**: Atomic time-slot check with database transactions. Race conditions between concurrent customer checkouts are prevented.
- [x] **Server-Side Pricing**: Payment amounts, platform commissions, and coupon discounts are calculated entirely on the backend. Frontend prices are never trusted.
- [x] **Payment Verification**: Razorpay HMAC-SHA256 signatures are calculated and verified server-side prior to updating booking or payment status.
- [x] **Webhook Deduplication**: Incoming payment gateway webhooks are deduplicated using payment event IDs to prevent replay attacks.

## 4. Input Validation & Injection Mitigation
- [x] **SQL Injection**: Prevented using SQLAlchemy 2.x ORM parameterized queries.
- [x] **Input Validation**: Strict Pydantic v2 schemas for all request payloads.
- [x] **CORS Configuration**: Restrictive Allowed Origins matching frontend domains, disabling wildcards (`*`) with credentials in production.
- [x] **File Upload Security**: MIME type verification, file extension whitelisting, file size restrictions, and secure Cloudinary storage.
