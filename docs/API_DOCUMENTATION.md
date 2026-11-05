# HomeServe Technologies – API Specification Document

All endpoints are prefixed with `/api/v1/`.

## 1. Authentication & Identity (`/api/v1/auth`)
- `POST /auth/register/customer` – Register a new customer.
- `POST /auth/register/provider` – Register a service contractor (pending admin verification).
- `POST /auth/login` – Authenticate with email/password; returns JWT access & refresh tokens with user role.
- `POST /auth/refresh` – Exchange refresh token for fresh short-lived access token.
- `POST /auth/logout` – Revoke refresh token and invalidate session.
- `GET /auth/me` – Retrieve current authenticated user profile and role details.
- `PUT /auth/profile` – Update personal details (full name, phone, avatar).
- `POST /auth/change-password` – Update current password with verification.
- `POST /auth/forgot-password` – Request password reset token.
- `POST /auth/reset-password` – Reset password using token.

## 2. Service Catalog (`/api/v1/categories`, `/api/v1/services`)
- `GET /categories` – List active service categories.
- `POST /categories` – [SUPER_ADMIN] Create a new category.
- `PUT /categories/{id}` – [SUPER_ADMIN] Update category details.
- `DELETE /categories/{id}` – [SUPER_ADMIN] Deactivate category.
- `GET /services` – List and filter platform services (search, category_id, min_price, max_price, sort).
- `GET /services/{id}` – Retrieve detailed service information.
- `POST /services` – [SUPER_ADMIN] Add standard platform service.
- `PUT /services/{id}` – [SUPER_ADMIN] Update service.
- `DELETE /services/{id}` – [SUPER_ADMIN] Soft-delete/deactivate service.

## 3. Customer Operations (`/api/v1/customers`)
- `GET /customers/addresses` – List saved customer addresses.
- `POST /customers/addresses` – Add a new address.
- `PUT /customers/addresses/{id}` – Update existing address.
- `DELETE /customers/addresses/{id}` – Delete an address.
- `GET /customers/favorites` – List bookmarked service providers.
- `POST /customers/favorites/{provider_id}` – Toggle provider bookmark.

## 4. Provider Operations (`/api/v1/providers`)
- `GET /providers` – Public list of approved providers (filter by service, city, rating).
- `GET /providers/{id}` – Detailed public profile, pricing, and reviews.
- `GET /providers/me/services` – List provider's configured services.
- `POST /providers/me/services` – Add/activate custom service pricing.
- `PUT /providers/me/services/{id}` – Update custom service price/availability.
- `GET /providers/me/availability` – Get weekly availability schedule slots.
- `PUT /providers/me/availability` – Update weekly availability schedule slots.
- `GET /providers/me/technicians` – List provider's technicians.
- `POST /providers/me/technicians` – Create a technician account.
- `GET /providers/me/earnings` – Provider earnings breakdown and transaction ledger.

## 5. Bookings Lifecycle (`/api/v1/bookings`)
- `POST /bookings` – [CUSTOMER] Initialize booking with atomic slot reservation.
- `GET /bookings` – Role-filtered booking list (Customer sees own, Provider sees business bookings, Technician sees assigned jobs, Admin sees all).
- `GET /bookings/{id}` – Retrieve booking details with status timeline, address, photos, and assignments.
- `PATCH /bookings/{id}/accept` – [PROVIDER] Accept booking request.
- `PATCH /bookings/{id}/reject` – [PROVIDER] Reject booking request with reason.
- `POST /bookings/{id}/assign-technician` – [PROVIDER] Assign technician to confirmed booking.
- `PATCH /bookings/{id}/cancel` – [CUSTOMER / ADMIN] Cancel booking according to cancellation policy.
- `POST /bookings/{id}/images` – Upload customer reference or before/after work verification images.

## 6. Technician Operations (`/api/v1/technicians`)
- `GET /technicians/jobs` – List assigned jobs.
- `PATCH /technicians/jobs/{id}/accept` – Accept job assignment.
- `PATCH /technicians/jobs/{id}/arrive` – Record arrival timestamp at customer address.
- `PATCH /technicians/jobs/{id}/complete` – Submit completion remarks and mark job COMPLETED.

## 7. Payments & Invoices (`/api/v1/payments`, `/api/v1/invoices`)
- `POST /payments/create-order` – Create backend Razorpay order for booking.
- `POST /payments/verify` – Verify Razorpay signature, mark booking PAID, generate invoice.
- `POST /payments/webhook` – Idempotent Razorpay webhook listener for payment capture/failure.
- `GET /payments/history` – Role-based transaction list.
- `GET /invoices/{booking_id}` – Retrieve structured invoice data.

## 8. Reviews & Complaints (`/api/v1/reviews`, `/api/v1/complaints`)
- `POST /reviews` – [CUSTOMER] Submit 1-5 star review for completed booking.
- `GET /reviews/provider/{provider_id}` – Public reviews for provider.
- `POST /reviews/{id}/reply` – [PROVIDER] Reply to customer review.
- `POST /complaints` – [CUSTOMER] File ticket for booking dispute.
- `GET /complaints` – Role-based complaints list (Customer / Admin).
- `PATCH /complaints/{id}` – [ADMIN] Update complaint status and resolution notes.

## 9. Admin Governance (`/api/v1/admin`, `/api/v1/analytics`)
- `GET /admin/stats` – High-level KPI summary (total customers, providers, revenue, commission).
- `GET /admin/providers/pending` – List providers awaiting verification.
- `PATCH /admin/providers/{id}/verify` – Approve or reject provider with reason.
- `GET /admin/users` – User management list with role, status filter, and deactivation.
- `PATCH /admin/users/{id}/toggle-status` – Activate/suspend user account.
- `GET /admin/coupons` – Manage discount coupons.
- `POST /admin/coupons` – Create promotional coupon.
- `GET /analytics/charts` – Monthly revenue, booking distribution, and customer growth trends.


## 11. RAG AI Handbook & Policy Assistant (`/api/v1/chat`)

Powered by LangChain and Google Gemini (`gemini-2.5-flash`), answering queries strictly using the HomeServe Company Handbook (`ragbased.pdf`) with static fallback handling for out-of-scope inquiries.

- `POST /chat` or `POST /chat/ask` – Ask a question to the AI Assistant.
  - **Request Body**:
    ```json
    {
      "message": "What is the warranty period for plumbing and electrical work?",
      "history": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi! How can I assist you with company policies today?"}
      ]
    }
    ```
  - **In-Scope Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Response generated successfully from company policies handbook",
      "data": {
        "reply": "All completed plumbing work is covered by a 30-day workmanship warranty from the date of the invoice. Parts warranty is as per manufacturer.",
        "is_fallback": false,
        "source": "ragbased.pdf"
      }
    }
    ```
  - **Out-of-Scope Response (HTTP 200)**:
    ```json
    {
      "success": true,
      "message": "Response generated successfully from company policies handbook",
      "data": {
        "reply": "I am sorry, but I can only answer questions related to the HomeServe company policies, services, warranties, and operating procedures covered in our official handbook. For other queries or customized assistance, please reach out to HomeServe Support at support@homeserve.com or call our helpline.",
        "is_fallback": true,
        "source": "ragbased.pdf"
      }
    }
    ```
