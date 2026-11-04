# HomeServe Technologies – Requirement Specification Document

## 1. Executive Summary
**HomeServe Technologies** is a multi-sided SaaS marketplace platform connecting residential and commercial property owners ("Customers") with verified local service contractors ("Service Providers") and their field workforces ("Technicians"), governed and monitored by a centralized administration authority ("Super Admin").

## 2. Platform Roles & Permission Model
The system enforces strict Role-Based Access Control (RBAC):

1. **SUPER_ADMIN**:
   - Master platform governance.
   - Provider onboarding verification (document review, approve/reject with audit reasoning).
   - Global catalog management (categories, subcategories, standard platform services).
   - Platform booking overview, assignment tracking, cancellation and dispute intervention.
   - Financial ledger management (platform commission configuration, transaction inspection, refund authorization).
   - Dispute and customer complaint resolution.
   - Platform performance analytics and CSV reporting.

2. **CUSTOMER**:
   - Dynamic catalog browsing, searching, and filtering (by category, service area/pincode, rating, and price).
   - Provider profile inspection with real ratings, reviews, and completed job statistics.
   - End-to-end booking reservation with backend concurrency locking (time-slot double booking prevention).
   - Secure digital payments via Razorpay (orders, signatures, webhooks, advance and post-service payments).
   - Real-time booking tracking (PENDING, CONFIRMED, ASSIGNED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED).
   - Address book management (Home, Office, Other with geographical coordinates and landmarks).
   - Booking cancellation and rescheduling under configurable business policy.
   - Review and rating submission for completed bookings with anti-duplicate enforcement.
   - Formal complaint escalation with photographic attachments.

3. **SERVICE_PROVIDER**:
   - Detailed business onboarding with document submission (trade license, ID proof, insurance).
   - Dynamic service offering catalog, custom pricing, duration estimates, and service area radiuses.
   - Operational calendar management (working days, shifts, slot capacities).
   - Incoming booking request triage (Accept or Reject with mandatory audit reason).
   - Technician workforce provisioning and direct dispatching.
   - Before and after photographic work verification.
   - Net earnings monitoring after automated platform commission deduction (e.g. 10%).
   - Customer review engagement (replying to feedback).

4. **TECHNICIAN**:
   - Dedicated mobile-first workforce portal.
   - Real-time view of provider-assigned jobs with customer service locations and customer instructions.
   - Work status updates: Job Acceptance, Mark Arrival on Site, Job In-Progress, Work Completion.
   - Work completion photographic proof uploads and final technician remarks.
   - Personal job completion history and customer ratings.

## 3. Supported Service Domains
- Electrical Installation & Repair
- Plumbing & Sanitary Solutions
- Air Conditioning (HVAC) Maintenance & Repair
- Deep Home & Commercial Cleaning
- Residential Painting & Waterproofing
- Carpentry & Furniture Assembly
- Home Appliance Repair (Refrigerators, Washing Machines, Microwaves, Water Purifiers)
- Pest Control & Disinfection

## 4. Non-Functional & Security Requirements
- **Architecture**: Decoupled RESTful API (FastAPI) and Single Page Application (React + Vite).
- **Security**: Argon2/bcrypt password hashing, JWT stateless access tokens with cryptographically verified refresh token rotation, ownership-level database authorization queries, parameterized ORM operations against SQL injection, strict CORS policies.
- **Double Booking Prevention**: Backend database transaction isolation with atomic slot reservation to eliminate race conditions.
- **Payment Integrity**: Server-side Razorpay order generation, HMAC-SHA256 signature verification, idempotent webhook processing.
- **Responsive Layout**: Fluid breakpoints covering 320px mobile viewport up to 4K ultra-wide displays without horizontal overflow.
