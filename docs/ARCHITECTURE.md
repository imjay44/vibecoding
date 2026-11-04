# HomeServe Technologies – System Architecture

## 1. High-Level System Architecture

```
                       [ Web Browsers & Mobile Clients ]
                                      |
                              HTTPS / JSON (REST)
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
[ Netlify Edge CDN ]                                     [ Render Web Service ]
React + Vite Frontend (SPA)                              FastAPI Backend Server
- React Router DOM v6                                    - REST API v1 (/api/v1/)
- Tailwind CSS Theme                                     - JWT Auth & RBAC Middleware
- Axios Interceptors                                     - Transactional Service Layer
- Lucide React & Recharts                                - SQLAlchemy 2.x ORM
         |                                                         |
         |---------------------------------------------------------+
                                      |
                 +--------------------+--------------------+
                 |                    |                    |
                 v                    v                    v
       [ Cloud MySQL DB ]       [ Razorpay ]         [ Cloudinary ]
       Alembic Migrations       Payments Gateway     Asset & Document
       InnoDB ACID Storage      Orders & Webhooks    Secure Cloud Storage
```

## 2. Directory Structure & Responsibilities

```
homeserve-saas/
├── frontend/                     # React 18+ Vite Single Page Application
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── assets/               # Branding assets & SVG illustrations
│   │   ├── components/
│   │   │   ├── common/           # Button, Modal, Card, Input, Badge, Table, Alert
│   │   │   ├── layout/           # Navbar, Footer, Sidebar, MobileDrawer
│   │   │   ├── forms/            # Form controls, address forms, booking forms
│   │   │   ├── dashboard/        # StatCards, Charts, RecentActivities
│   │   │   └── services/         # ServiceCard, CategoryCard, FilterBar
│   │   ├── pages/
│   │   │   ├── public/           # Home, About, Contact, Services, ProviderProfile
│   │   │   ├── auth/             # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── customer/         # Customer dashboard, Bookings, Addresses, Reviews
│   │   │   ├── provider/         # Provider dashboard, Technicians, Earnings, Jobs
│   │   │   ├── technician/       # Technician dashboard, ActiveJobs, JobCompletion
│   │   │   └── admin/            # Admin dashboard, Verification, Users, Commission
│   │   ├── hooks/                # Custom React hooks (useAuth, useNotifications)
│   │   ├── context/              # AuthContext, NotificationContext, ThemeContext
│   │   ├── services/             # Axios API client modules (api.js, authService.js)
│   │   ├── utils/                # Date formatting, currency helpers, validators
│   │   ├── routes/               # RoleProtectedRoute, AppRoutes
│   │   ├── validations/          # Zod validation schemas
│   │   ├── App.jsx               # Top-level Router & Provider wrapper
│   │   └── main.jsx              # React DOM mounting
│   ├── .env.example
│   ├── netlify.toml              # Netlify SPA redirect rules & build commands
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/    # Auth, Users, Customers, Providers, Technicians,
│   │   │       │                 # Categories, Services, Bookings, Payments, etc.
│   │   │       └── router.py     # Aggregated v1 APIRouter
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic v2 Settings (environment variables)
│   │   │   ├── security.py       # Password hashing, JWT token generation & verification
│   │   │   └── exceptions.py     # Centralized HTTP and business domain exceptions
│   │   ├── models/               # SQLAlchemy 2.x Declarative Base entities
│   │   ├── schemas/              # Pydantic validation schemas (In/Out/Update)
│   │   ├── services/             # Business logic layer (Payment, Booking, Storage)
│   │   ├── repositories/         # Database access layer
│   │   ├── middleware/           # CORS, Request logging, Global Exception Handlers
│   │   ├── utils/                # Seed script, PDF/Invoice builder, helpers
│   │   ├── db/
│   │   │   ├── session.py        # SQLAlchemy engine & sessionmaker
│   │   │   ├── base.py           # Model imports for Alembic auto-discovery
│   │   │   ├── seed.py           # Deterministic realistic database seeder
│   │   │   └── bootstrap_admin.py# Secure CLI administrator creator
│   │   ├── main.py               # FastAPI application factory
│   │   └── dependencies.py       # Current user, RBAC, DB session dependency injection
│   ├── alembic/                  # Database migration scripts
│   ├── tests/                    # Pytest test suite (Auth, Bookings, RBAC, Payments)
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic.ini
│
├── docs/                         # Comprehensive engineering documentation
├── render.yaml                   # Infrastructure-as-code for Render deployment
└── README.md
```

## 3. Concurrency & Transactional Isolation

To prevent race conditions and duplicate bookings:
1. Availability checks use `SELECT ... FOR UPDATE` row locks within a transactional boundary or check distinct slot reservation records.
2. An atomic `booking_slots` uniqueness constraint `(provider_id, booking_date, time_slot)` guarantees that two simultaneous requests cannot both confirm for the same provider time slot.
3. If an allocation fails or a payment is aborted, the reservation is either rolled back immediately or expires via a state TTL.
