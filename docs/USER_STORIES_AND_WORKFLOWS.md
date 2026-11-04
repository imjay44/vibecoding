# HomeServe Technologies – User Stories, Workflows & Development Roadmap

**Project Phase**: Phase 1 – Requirement Analysis & Planning  
**Target Platform**: HomeServe Technologies (Enterprise Multi-Role SaaS)  
**Roles**: Super Admin, Customer, Service Provider, Technician

---

## 1. User Stories Matrix

### 1.1 Customer User Stories
- **US-CUST-01 (Discovery)**: *As a Customer*, I want to search and filter home services by category, keyword, and pincode, *so that* I can quickly locate verified professionals for my specific repair needs.
- **US-CUST-02 (Provider Vetting)**: *As a Customer*, I want to view service provider profiles, ratings, past customer reviews, and verification badges, *so that* I can trust the contractor I invite into my home.
- **US-CUST-03 (Slot Booking)**: *As a Customer*, I want to select a preferred date and time slot and provide my exact service address and problem description, *so that* the contractor arrives at my convenience.
- **US-CUST-04 (Promotional Discounts)**: *As a Customer*, I want to enter coupon codes (e.g., `HOMESERVE50`, `WELCOME100`), *so that* I can receive discounts on my total booking amount.
- **US-CUST-05 (Digital Payment)**: *As a Customer*, I want to pay securely via Razorpay (UPI, Cards, NetBanking), *so that* I have a tamper-proof digital payment receipt and zero cash handling hassles.
- **US-CUST-06 (Live Tracking)**: *As a Customer*, I want to track the real-time status of my booking (Pending $\to$ Confirmed $\to$ In Progress $\to$ Completed), *so that* I stay updated on technician arrival.
- **US-CUST-07 (Review & Dispute)**: *As a Customer*, I want to leave a 1-5 star review after service completion or raise a formal support complaint, *so that* my feedback is acknowledged.

### 1.2 Service Provider User Stories
- **US-PROV-01 (Onboarding)**: *As a Service Provider*, I want to register my business, specify trade specialties, and upload government licenses, *so that* I can become an approved contractor on the platform.
- **US-PROV-02 (Catalog & Pricing)**: *As a Service Provider*, I want to configure the services I offer, set custom base prices, define service areas, and set working hours, *so that* I receive bookings aligned with my capacity.
- **US-PROV-03 (Job Triage)**: *As a Service Provider*, I want to review incoming customer booking requests and either Accept or Reject them with a reason, *so that* I maintain quality schedules.
- **US-PROV-04 (Fleet Dispatch)**: *As a Service Provider*, I want to assign certified technicians from my workforce to confirmed bookings, *so that* field execution is delegated efficiently.
- **US-PROV-05 (Earnings Ledger)**: *As a Service Provider*, I want to view gross earnings, automated platform commission deductions, and net payout balances, *so that* I have full financial transparency.

### 1.3 Field Technician User Stories
- **US-TECH-01 (Job Queue)**: *As a Technician*, I want to access a mobile-optimized view of my assigned jobs with customer addresses, contact numbers, and issue notes, *so that* I can navigate directly to the job site.
- **US-TECH-02 (Execution Stepper)**: *As a Technician*, I want to mark when I have arrived on site and when work is completed, *so that* customer and provider are notified in real time.
- **US-TECH-03 (Completion Proof)**: *As a Technician*, I want to upload completion notes and job photos, *so that* work quality is verified before job closure.

### 1.4 Super Admin User Stories
- **US-ADM-01 (Provider Verification)**: *As a Super Admin*, I want to inspect submitted contractor documents and Approve or Reject applications, *so that* only qualified contractors operate on the platform.
- **US-ADM-02 (Master Catalog)**: *As a Super Admin*, I want to manage categories, subcategories, standard platform services, and base rates, *so that* the marketplace stays organized.
- **US-ADM-03 (Executive KPIs)**: *As a Super Admin*, I want to monitor platform revenue, completed bookings, active contractors, commission earnings, and customer growth analytics, *so that* I can steer platform strategy.
- **US-ADM-04 (Dispute Intervention)**: *As a Super Admin*, I want to review customer complaints, inspect booking audit trails, and intervene to resolve disputes, *so that* marketplace trust is maintained.

---

## 2. Business Workflow Diagrams

### 2.1 End-to-End Booking & Service Fulfillment Workflow

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant API as FastAPI Backend
    participant DB as MySQL Database
    participant RZP as Razorpay Gateway
    actor P as Service Provider
    actor T as Technician
    actor A as Super Admin

    Note over C,API: 1. Discovery & Reservation
    C->>API: GET /services (Filter by Category & Pincode)
    API-->>C: Return Available Services & Providers
    C->>API: POST /bookings (Service, Slot, Address, Notes)
    API->>DB: Check Double Booking & Persist PENDING Booking
    DB-->>API: Booking ID Created (#HS-XXXXXX)

    Note over C,RZP: 2. Checkout & Payment
    C->>API: POST /coupons/validate (Apply Discount Code)
    API-->>C: Return Net Payable Amount
    C->>API: POST /payments/create-order
    API->>RZP: Generate Razorpay Order ID
    RZP-->>API: Order Created
    API-->>C: Order ID & Public Key
    C->>RZP: Complete Payment (UPI / Card)
    RZP-->>C: Payment Signature Returned
    C->>API: POST /payments/verify-signature (HMAC-SHA256)
    API->>DB: Update Payment Status = PAID

    Note over P,T: 3. Triage, Acceptance & Dispatch
    API->>P: In-App Notification (New Booking Alert)
    P->>API: PATCH /bookings/{id}/status (Accept -> CONFIRMED)
    P->>API: POST /bookings/{id}/assign-technician (Assign Tech)
    API->>DB: Create Assignment Record
    API->>T: In-App Notification (Dispatched Job Alert)

    Note over T,C: 4. On-Site Job Execution
    T->>API: PATCH /bookings/{id}/status (Status -> IN_PROGRESS / Arrived)
    T->>API: Upload Work Proof & Remarks
    T->>API: PATCH /bookings/{id}/status (Status -> COMPLETED)
    API->>DB: Calculate Platform Commission (10%) & Provider Net Earnings
    API->>DB: Generate Sequential Tax Invoice

    Note over C,A: 5. Review & Platform Ledger
    C->>API: POST /reviews (1-5 Stars + Feedback)
    C->>API: GET /bookings/{id}/invoice (Download Official Tax Invoice)
    A->>API: GET /admin/stats (Platform Revenue & Commission Analytics)
```

---

## 3. Module List & Functional Mapping

| Module # | Module Name | Primary Actors | Core Database Entities | Key Endpoints |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Authentication & RBAC** | All 4 Roles | `users`, `refresh_tokens` | `/auth/login`, `/auth/register/*`, `/auth/refresh` |
| **02** | **Customer Management** | Customer, Admin | `customers`, `addresses`, `favorites` | `/customers/addresses`, `/customers/favorites` |
| **03** | **Service Catalog** | All Roles | `service_categories`, `services` | `/categories`, `/services` |
| **04** | **Provider Management** | Provider, Admin | `service_providers`, `provider_services`, `service_areas` | `/providers`, `/admin/providers/{id}/verify` |
| **05** | **Booking & Scheduling** | Customer, Provider | `bookings`, `availability_slots` | `/bookings`, `/bookings/{id}/status` |
| **06** | **Technician Management** | Provider, Tech | `technicians`, `booking_assignments` | `/technicians`, `/bookings/{id}/assign-technician` |
| **07** | **Payment & Invoicing** | Customer, Provider | `payments`, `invoices`, `coupons`, `provider_earnings` | `/payments/*`, `/coupons/*`, `/bookings/{id}/invoice` |
| **08** | **Notifications** | All Roles | `notifications` | `/notifications`, `/notifications/{id}/read` |
| **09** | **Reviews & Complaints**| Customer, Provider, Admin | `reviews`, `complaints` | `/reviews`, `/complaints` |
| **10** | **Analytics & Reports** | Admin, Provider | Aggregated Ledger | `/admin/stats`, `/providers/me/earnings` |

---

## 4. Complete SDLC Development Roadmap

```mermaid
gantt
    title HomeServe Technologies – SDLC Execution Phases
    dateFormat  YYYY-MM-DD
    section Phase 1: Planning
    Requirements & User Stories          :done, p1, 2026-11-01, 1d
    section Phase 2: UI/UX & Frontend
    React + Tailwind Component Library   :done, p2, 2026-11-02, 1d
    Role-Based Responsive Dashboards     :done, p2b, 2026-11-02, 1d
    section Phase 3: Database Design
    ER Modeling & 23 InnoDB Tables       :done, p3, 2026-11-02, 1d
    Deterministic Seed & Concurrency     :done, p3b, 2026-11-03, 1d
    section Phase 4: Backend
    FastAPI REST APIs (64 Endpoints)     :done, p4, 2026-11-03, 1d
    JWT Auth & Starlette Middleware      :done, p4b, 2026-11-03, 1d
    section Phase 5: Integration
    Axios Interceptors & Dynamic State   :done, p5, 2026-11-03, 1d
    Razorpay Sandbox Payment Flow        :done, p5b, 2026-11-04, 1d
    section Phase 6: Testing & QA
    Pytest Suite (9/9 Passed)            :done, p6, 2026-11-04, 1d
    Playwright E2E Suite (7/7 Passed)    :done, p6b, 2026-11-04, 1d
    15-Stage Live SaaS Lifecycle Test    :done, p6c, 2026-11-04, 1d
    section Phase 7: Security
    Bcrypt, JWT Rotation & OWASP Audit   :done, p7, 2026-11-04, 1d
    section Phase 8: Git & GitHub
    Repo, Clean Commits, .env.example    :done, p8, 2026-11-04, 1d
    section Phase 9: Deployment
    Render Backend & Netlify Frontend    :done, p9, 2026-11-04, 1d
```
