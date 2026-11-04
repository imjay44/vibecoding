# HomeServe Technologies – Enterprise Home Services Booking SaaS Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0%20%2F%20SQLAlchemy%202.x-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com)
[![Playwright](https://img.shields.io/badge/E2E-Playwright%20Green-2EAD33.svg?logo=playwright&logoColor=white)](https://playwright.dev)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/imjay44/vibecoding&base=frontend)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Commercial-blue.svg)](#license)

**HomeServe Technologies** is an enterprise-grade, multi-role online marketplace SaaS platform connecting homeowners with vetted, insured, top-tier home service contractors and certified technicians. Designed from the ground up for resilience, speed, security, and responsive touch-first UX.

---

## 📑 Table of Contents

- [Supported Service Domains](#-supported-service-domains)
- [Role-Based Architecture & Feature Matrix](#-role-based-architecture--feature-matrix)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Local Installation & Setup](#-local-installation--setup)
  - [1. Backend Setup](#1-backend-setup-fastapi--sqlalchemy)
  - [2. Database Migrations & Seeding](#2-database-migrations--deterministic-seeding)
  - [3. Frontend Setup](#3-frontend-setup-react--vite--tailwind)
- [Demo Credentials](#-demo-credentials-all-4-roles)
- [Automated Testing](#-automated-testing)
  - [Backend Pytest Suite](#backend-pytest-suite)
  - [End-to-End Playwright Suite](#end-to-end-playwright-suite)
- [Deployment Guide](#-deployment-guide)
  - [Render (FastAPI Backend)](#render-fastapi-backend)
  - [Netlify (React Frontend)](#netlify-react-frontend)
  - [Managed Cloud MySQL Database](#managed-cloud-mysql-database)
- [API Documentation & Health Endpoints](#-api-documentation--health-endpoints)
- [Security & Compliance Matrix](#-security--compliance-matrix)
- [Engineering Documentation](#-engineering-documentation)
- [License](#-license)

---

## 🛠 Supported Service Domains

HomeServe Technologies provides end-to-end service discovery, real-time availability booking, pricing estimation, and automated dispatch across 8 high-demand categories:

1. **Electrical Services**: Circuit breaker diagnostics, rewiring, smart home lighting, fan & switchboard installation.
2. **Plumbing Services**: Leak repair, pipeline installation, bathroom fittings, drain unblocking, water pump servicing.
3. **AC Repair & Maintenance**: Gas charging, seasonal AC jet cleaning, compressor overhaul, split/window installation.
4. **Home Cleaning**: Deep home sanitization, kitchen chimney degreasing, sofa & carpet shampooing, bathroom descaling.
5. **Painting Services**: Interior/exterior wall painting, waterproofing coats, texture design, wood polishing.
6. **Carpentry Services**: Furniture assembly, door lock fitting, bespoke cabinetry, termite damage repair.
7. **Appliance Repair**: Refrigerator cooling repair, washing machine drum service, microwave magnetron repair, RO water purifier filter replacement.
8. **Pest Control**: Anti-termite barrier treatment, kitchen cockroach gel, bedbug eradication, general pest fogging.

---

## 👥 Role-Based Architecture & Feature Matrix

The platform enforces strict role-based access control (RBAC) across four dedicated actor interfaces:

| Capability / Module | Customer | Service Provider | Technician | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Public Service Discovery & Search** | ✅ | ✅ | ✅ | ✅ |
| **Address Book Management** | ✅ | ❌ | ❌ | ❌ |
| **Real-time Appointment Booking** | ✅ | ❌ | ❌ | ❌ |
| **Coupon Code Redemption** | ✅ | ❌ | ❌ | ❌ |
| **Razorpay Payment Integration** | ✅ | ❌ | ❌ | ❌ |
| **Live Job Status Tracking** | ✅ | ✅ | ✅ | ✅ |
| **Download PDF/HTML Invoices** | ✅ | ✅ | ❌ | ✅ |
| **Provider Profile & Team Management** | ❌ | ✅ | ❌ | ❌ |
| **Service Catalog & Pricing Matrix** | ❌ | ✅ | ❌ | ❌ |
| **Availability Calendar Configuration** | ❌ | ✅ | ❌ | ❌ |
| **Accept / Reject Bookings** | ❌ | ✅ | ❌ | ❌ |
| **Technician Job Dispatch** | ❌ | ✅ | ❌ | ❌ |
| **Technician Job Status Updates** | ❌ | ❌ | ✅ | ❌ |
| **Customer Support & Complaints** | File / View | View related | ❌ | Resolve / Escalate |
| **Contractor KYC Document Review** | ❌ | ❌ | ❌ | Approve / Reject |
| **Platform Revenue & Payout Analytics**| ❌ | Earnings view | ❌ | Complete Platform Metrics |
| **Category & Global Settings Config** | ❌ | ❌ | ❌ | ✅ |

---

## 💻 Technology Stack

### Frontend Architecture
- **Framework**: [React 18.2](https://react.dev) with [Vite 6](https://vitejs.dev) for high-speed HMR and optimized production bundles.
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com) with `@tailwindcss/forms` for a bespoke, responsive design system.
- **Navigation**: [React Router DOM v6](https://reactrouter.com) with strict `RoleProtectedRoute` route guards.
- **State & HTTP**: Context API for auth and global toast notifications; [Axios](https://axios-http.com) with request/response interceptors for automatic JWT token rotation.
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com) paired with [Zod](https://zod.dev) schema validation.
- **Analytics Visuals**: [Recharts](https://recharts.org) for responsive revenue and booking distribution charts.
- **Icons & Assets**: [Lucide React](https://lucide.dev) icons.

### Backend Architecture
- **Runtime & Web Framework**: Python 3.12+ (tested through 3.14) running on [FastAPI](https://fastapi.tiangolo.com) with [Uvicorn](https://www.uvicorn.org) ASGI server.
- **ORM & Data Layer**: [SQLAlchemy 2.0](https://www.sqlalchemy.org) with strict declarative models and relationship loading strategies (`joinedload`).
- **Database Driver**: [PyMySQL](https://github.com/PyMySQL/PyMySQL) for cloud MySQL connectivity, with seamless SQLite compatibility for local offline development.
- **Schema Validation**: [Pydantic v2](https://docs.pydantic.dev) with custom field validators and ISO datetime serialization.
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org) automated version tracking and zero-downtime schema evolution.
- **Cryptography & Security**: Native `bcrypt` key derivation with constant-time password verification; `python-jose` for signed JWT access/refresh token pairs.
- **Payment Gateway**: [Razorpay](https://razorpay.com) SDK with server-side HMAC-SHA256 signature verification.
- **Asset Storage**: [Cloudinary](https://cloudinary.com) integration with automated local disk fallback for media uploads.

---

## 📂 Repository Structure

```
homeserve-saas/
│
├── frontend/                               # React 18 + Vite SPA Client
│   ├── public/                             # Public static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                     # Reusable design tokens (Button, Input, Modal, Badge, Toast, etc.)
│   │   │   ├── layout/                     # Navbar, Footer, Sidebar, DashboardLayout
│   │   │   ├── forms/                      # AddressModal, BookingModal (multistep stepper)
│   │   │   ├── dashboard/                  # StatCard, DataTable, metric charts
│   │   │   └── services/                   # ServiceCard, CategoryCard, ProviderCard
│   │   ├── context/                        # AuthContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── public/                     # Home, All Services, Service Details, Provider Profile, Static
│   │   │   ├── auth/                       # Login (with 1-click demos), Register, Provider Onboarding
│   │   │   ├── customer/                   # Dashboard, Bookings, Addresses, Invoices, Complaints
│   │   │   ├── provider/                   # Dashboard, Services, Bookings, Technicians, Availability, Earnings
│   │   │   ├── technician/                 # Dashboard, Assigned Jobs, Profile
│   │   │   └── admin/                      # Dashboard, Users, Providers, Bookings, Categories, Complaints
│   │   ├── routes/                         # AppRoutes, RoleProtectedRoute
│   │   ├── services/                       # Axios client & centralized endpoint bindings
│   │   ├── App.jsx                         # Main application root
│   │   └── main.jsx                        # React DOM entry point
│   ├── e2e/                                # Playwright automated end-to-end test scenarios
│   ├── netlify.toml                        # Netlify edge redirects and build directives
│   ├── playwright.config.js                # Playwright test harness configuration
│   ├── tailwind.config.js                  # Custom palette, typography, and styling hooks
│   └── package.json
│
├── backend/                                # FastAPI High-Performance Backend
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/                  # 17 granular REST controller modules
│   │   │   └── router.py                   # Consolidated API v1 endpoint aggregator
│   │   ├── core/                           # Environment settings, bcrypt security, custom exceptions
│   │   ├── db/                             # Engine session factory, seed engine, admin CLI bootstrap
│   │   ├── models/                         # 23 relational SQLAlchemy models
│   │   ├── schemas/                        # Pydantic v2 validation models
│   │   ├── services/                       # Razorpay, Cloudinary, Notification, and Booking logic
│   │   ├── dependencies.py                 # JWT extraction, user identity, and RBAC gatekeepers
│   │   └── main.py                         # FastAPI ASGI lifecycle configuration
│   ├── alembic/                            # Database migrations schema directory
│   ├── tests/                              # Pytest test suite (health, auth, booking, invoices)
│   ├── alembic.ini                         # Database migration configuration
│   ├── pytest.ini                          # Pytest environment rules
│   └── requirements.txt                    # Python dependencies
│
├── docs/                                   # System Engineering Documentation
│   ├── REQUIREMENTS.md                     # Comprehensive Functional & Technical Requirements
│   ├── ARCHITECTURE.md                     # Concurrency, state machine, and data flow models
│   ├── DATABASE_SCHEMA.md                  # Complete 23-table relational schema dictionary
│   ├── ER_DIAGRAM.md                       # Mermaid entity-relationship diagrams
│   ├── API_DOCUMENTATION.md                # REST API specifications and payloads
│   ├── SECURITY_CHECKLIST.md               # Security audit, OWASP mitigations, and compliance
│   ├── TESTING_REPORT.md                   # Automated unit, integration, and E2E test report
│   └── DEPLOYMENT_GUIDE.md                 # Production deployment runbook (Render, Netlify, Cloud MySQL)
│
├── .gitignore                              # Git exclusion rules
├── README.md                               # Project documentation & master setup guide
└── render.yaml                             # Infrastructure-as-code for Render deployment
```

---

## 🏛 System Architecture

The following diagram illustrates the decoupled client-server architecture, security boundaries, and external integration points:

```mermaid
flowchart TD
    subgraph Clients["Presentation Layer (Netlify CDN)"]
        Browser["React 18 SPA (Vite + Tailwind CSS)"]
        Mobile["Responsive Mobile Web Browser"]
    end

    subgraph Gateway["Edge & Security Layer"]
        CORS["CORS Middleware"]
        AuthBearer["JWT Bearer Token Guard"]
        RBAC["Role-Based Access Controller (Super Admin / Provider / Tech / Customer)"]
    end

    subgraph API["Application Layer (Render Web Service)"]
        FastAPI["FastAPI 0.115+ ASGI Engine"]
        BookingEngine["Booking & Scheduling Engine"]
        PaymentEngine["Razorpay Payment Service"]
        NotificationEngine["Notification Dispatcher"]
        UploadEngine["Cloudinary / Storage Service"]
    end

    subgraph Persistence["Data & External Services"]
        MySQL[("Cloud MySQL 8.0 Database\n(23 Relational Tables)")]
        RazorpayAPI["Razorpay Payment Gateway API"]
        CloudinaryCDN["Cloudinary Media Storage"]
    end

    Browser -->|HTTPS / REST API| CORS
    Mobile -->|HTTPS / REST API| CORS
    CORS --> AuthBearer
    AuthBearer --> RBAC
    RBAC --> FastAPI

    FastAPI --> BookingEngine
    FastAPI --> PaymentEngine
    FastAPI --> NotificationEngine
    FastAPI --> UploadEngine

    BookingEngine --> MySQL
    PaymentEngine --> RazorpayAPI
    UploadEngine --> CloudinaryCDN
    PaymentEngine --> MySQL
    NotificationEngine --> MySQL
```

---

## 📋 Prerequisites

Ensure the following runtimes are installed on your workstation or host system:

- **Python**: Version `3.12` or higher (tested compatible through Python `3.14`).
- **Node.js**: Version `18.0.0` or higher (LTS recommended) and `npm` 9+.
- **Database Engine**:
  - **Local Development**: SQLite is enabled by default for zero-friction setup (`sqlite:///./homeserve.db`).
  - **Production**: MySQL `8.0` or higher (AWS RDS, PlanetScale, Aiven, or standard Ubuntu MySQL Server).

---

## 🚀 Local Installation & Setup

Clone the repository and follow the step-by-step setup below:

### 1. Backend Setup (FastAPI & SQLAlchemy)

Open a terminal and navigate to the `backend/` directory:

```bash
cd /Users/ChallangeApp/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### Environment Configuration:
Create your local environment file by copying `.env.example`:

```bash
cp .env.example .env
```

Ensure the key variables in `backend/.env` are populated:
```ini
PROJECT_NAME="HomeServe Technologies"
ENVIRONMENT="development"
SECRET_KEY="your-super-secret-random-hex-string-for-jwt-signing"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# For local offline development (SQLite):
DATABASE_URL="sqlite:///./homeserve.db"

# For Cloud or Local MySQL:
# DATABASE_URL="mysql+pymysql://homeserve_user:securepassword@localhost:3306/homeserve_db"

CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

RAZORPAY_KEY_ID="rzp_test_YourTestKeyId"
RAZORPAY_KEY_SECRET="YourTestKeySecret"
```

---

### 2. Database Migrations & Deterministic Seeding

With your virtual environment active in `backend/`:

```bash
# 1. Apply database migrations via Alembic
alembic upgrade head

# 2. Seed database with categories, services, contractors, and demo accounts
python -m app.db.seed

# 3. (Optional) Create an independent custom Super Administrator via CLI
python -m app.db.bootstrap_admin --email admin@homeserve.com --password Admin@123456 --first-name System --last-name Administrator
```

#### Start the FastAPI Server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000`.
- Interactive Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Alternative ReDoc UI: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

### 3. Frontend Setup (React + Vite + Tailwind)

In a separate terminal window, navigate to the `frontend/` directory:

```bash
cd /Users/ChallangeApp/frontend

# Install frontend dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Verify your `frontend/.env` points to the local backend:
```ini
VITE_API_URL=http://localhost:8000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
```

#### Start the Vite Development Server:
```bash
npm run dev
```
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Credentials (All 4 Roles)

The platform comes pre-seeded with test accounts for all four system roles. You can click the **"Quick Demo Login"** buttons on the Login page (`/login`) to sign in with one click, or enter these credentials manually:

| Role | Email Address | Password | Account Context |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@homeserve.com` | `Admin@123456` | Platform Master: Contractor verification, dispute resolution, platform stats, category creation |
| **Service Provider** | `provider@apexhome.com` | `Provider@123456` | Apex Home Solutions: Catalog pricing, slot schedules, booking approvals, technician dispatch |
| **Technician** | `rajesh@apexhome.com` | `Tech@123456` | Field Tech: Job dispatch view, on-site status progression (En Route, In Progress, Completed) |
| **Customer** | `customer@example.com` | `Customer@123456` | Verified Customer: Booking history, multi-address manager, instant checkout, reviews, complaints |

---

## 🧪 Automated Testing

### Backend Pytest Suite
The backend includes automated integration tests covering authentication, hashing, RBAC security, coupon validation, Razorpay HMAC signatures, and end-to-end booking/invoice flows.

To run the backend test suite:
```bash
cd /Users/ChallangeApp/backend
source venv/bin/activate
pytest tests/ -v
```
**Expected Test Output**:
```
backend/tests/test_api.py::test_health_check PASSED                      [ 11%]
backend/tests/test_api.py::test_password_hashing PASSED                  [ 22%]
backend/tests/test_api.py::test_customer_registration_and_login PASSED   [ 33%]
backend/tests/test_api.py::test_provider_registration_and_admin_verification PASSED [ 44%]
backend/tests/test_api.py::test_services_catalog_and_search PASSED       [ 55%]
backend/tests/test_api.py::test_coupon_validation PASSED                 [ 66%]
backend/tests/test_api.py::test_razorpay_signature_verification PASSED   [ 77%]
backend/tests/test_api.py::test_customer_booking_creation_and_invoice PASSED [ 88%]
backend/tests/test_api.py::test_admin_stats_authorization PASSED         [100%]
============================== 9 passed in 3.05s ===============================
```

### End-to-End Playwright Suite
The frontend includes end-to-end browser test specifications exercising live page transitions, multi-role dashboard navigation, and authentication redirects.

To execute the Playwright test suite:
```bash
cd /Users/ChallangeApp/frontend
npx playwright test
```
**Expected Test Output**:
```
Running 7 tests using 1 worker
  ✓  1 [chromium] › homeserve.spec.js:15:7 › Homepage and Public Discovery Flow (1.8s)
  ✓  2 [chromium] › homeserve.spec.js:33:7 › Customer Authentication and Dashboard Flow (2.3s)
  ✓  3 [chromium] › homeserve.spec.js:46:7 › Super Admin Dashboard and Management Tabs (1.9s)
  ✓  4 [chromium] › homeserve.spec.js:61:7 › Service Provider Dashboard Flow (1.9s)
  ✓  5 [chromium] › homeserve.spec.js:73:7 › Technician Dashboard Flow (1.8s)
  ✓  6 [chromium] › homeserve.spec.js:84:7 › Service Detail Page and Booking Modal Trigger (1.5s)
  ✓  7 [chromium] › homeserve.spec.js:96:7 › Unauthorized Route Protection and Redirection (1.2s)

  7 passed (14.6s)
```

---

## 🚢 Deployment Guide

### Render (FastAPI Backend)

The project includes a production-ready `render.yaml` infrastructure-as-code blueprint:

1. Connect your GitHub repository to [Render](https://render.com).
2. Select **Blueprints** and point Render to `render.yaml`.
3. Alternatively, create a **Web Service** manually with the following settings:
   - **Environment**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head && python -m app.db.seed`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables in the Render dashboard:
   - `DATABASE_URL`: `mysql+pymysql://<user>:<password>@<cloud-mysql-host>:3306/<dbname>`
   - `SECRET_KEY`: `<production-random-secret>`
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: `https://your-frontend.netlify.app`
   - `RAZORPAY_KEY_ID`: `<live_or_test_key>`
   - `RAZORPAY_KEY_SECRET`: `<live_or_test_secret>`

---

### Netlify (React Frontend)

The `frontend/netlify.toml` file includes build configurations and SPA edge rewrite rules:

1. Connect your repository to [Netlify](https://netlify.com).
2. Configure your build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api/v1`
   - `VITE_RAZORPAY_KEY_ID`: `<your_razorpay_key_id>`
4. Trigger deploy. Netlify handles single-page route fallback automatically via `/* /index.html 200`.

---

### Managed Cloud MySQL Database

For high-availability production environments:
1. Provision a MySQL 8.0 instance on **Aiven**, **PlanetScale**, **Amazon RDS**, or **DigitalOcean Managed Databases**.
2. Create database user and grant permissions:
   ```sql
   CREATE DATABASE homeserve_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'homeserve_admin'@'%' IDENTIFIED BY 'StrongGeneratedPassword';
   GRANT ALL PRIVILEGES ON homeserve_production.* TO 'homeserve_admin'@'%';
   FLUSH PRIVILEGES;
   ```
3. Set the `DATABASE_URL` connection string:
   ```
   mysql+pymysql://homeserve_admin:StrongGeneratedPassword@<db-host>:3306/homeserve_production
   ```
4. Run `alembic upgrade head` from CI/CD to apply all migrations automatically.

---

## 📖 API Documentation & Health Endpoints

FastAPI automatically generates live, interactive documentation:
- **Swagger Interactive UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Technical UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Service Health Check**: `GET /api/v1/health`
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-04T10:15:30.123456Z",
    "environment": "development",
    "version": "1.0.0"
  }
  ```

---

## 🛡 Security & Compliance Matrix

- **Zero Plain-Text Credentials**: Passwords hashed using standard `bcrypt` key-stretching.
- **State-of-the-Art Token Security**: Short-lived (60 min) signed HS256 JWT access tokens paired with revocable refresh tokens.
- **Protection Against IDOR & Privilege Escalation**: Database queries explicitly verify ownership (`user_id == current_user.id`) or require explicit role elevations.
- **SQL Injection Prevention**: SQLAlchemy 2.0 parameterized queries exclusively; zero raw string SQL interpolation.
- **HMAC Signature Verification**: All Razorpay webhooks and payment callbacks verified using cryptographic SHA256 signatures before booking state transitions.
- **CSRF & CORS Controls**: Explicit origin whitelisting in FastAPI CORS middleware.

---

## 📚 Engineering Documentation

Detailed architectural and operational documentation is stored inside the `/docs` directory:

1. **[Requirements Specification (`docs/REQUIREMENTS.md`)](docs/REQUIREMENTS.md)**: Exhaustive breakdown of features, actors, and functional scopes.
2. **[System Architecture (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md)**: Component diagrams, lifecycle state machines, and concurrency controls.
3. **[Database Schema Dictionary (`docs/DATABASE_SCHEMA.md`)](docs/DATABASE_SCHEMA.md)**: 23 relational database tables, columns, constraints, and indexes.
4. **[Entity-Relationship Diagram (`docs/ER_DIAGRAM.md`)](docs/ER_DIAGRAM.md)**: Comprehensive Mermaid ER diagram and foreign key mapping.
5. **[REST API Specifications (`docs/API_DOCUMENTATION.md`)](docs/API_DOCUMENTATION.md)**: Complete endpoint contract listing request/response payloads.
6. **[Security Checklist & Audit (`docs/SECURITY_CHECKLIST.md`)](docs/SECURITY_CHECKLIST.md)**: OWASP Top 10 mitigation verification matrix.
7. **[Testing Report (`docs/TESTING_REPORT.md`)](docs/TESTING_REPORT.md)**: Automated backend and E2E browser test coverage matrices.
8. **[Production Deployment Runbook (`docs/DEPLOYMENT_GUIDE.md`)](docs/DEPLOYMENT_GUIDE.md)**: Step-by-step Netlify, Render, and MySQL hosting instructions.

---

## 📄 License

This software is developed and licensed as a proprietary SaaS application for **HomeServe Technologies**. All rights reserved. For commercial distribution and white-labeling terms, contact `support@homeserve.com`.
