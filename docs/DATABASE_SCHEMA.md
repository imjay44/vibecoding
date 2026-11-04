# HomeServe Technologies – Database Schema Specification

## 1. Relational Design Overview
The relational schema is engineered on **MySQL 8.0+** using the **InnoDB** storage engine for full ACID transaction compliance, foreign key integrity, and row-level locking.

## 2. Table Specifications

### 2.1 `users`
Master identity authentication table.
- `id` (VARCHAR(36), Primary Key, UUID)
- `email` (VARCHAR(255), Unique, Indexed, NOT NULL)
- `phone_number` (VARCHAR(20), Unique, Indexed, NOT NULL)
- `hashed_password` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(150), NOT NULL)
- `role` (ENUM: 'SUPER_ADMIN', 'CUSTOMER', 'SERVICE_PROVIDER', 'TECHNICIAN', NOT NULL)
- `is_active` (BOOLEAN, Default: TRUE)
- `is_verified` (BOOLEAN, Default: FALSE)
- `avatar_url` (VARCHAR(500), Nullable)
- `created_at` (DATETIME (UTC), Default: CURRENT_TIMESTAMP)
- `updated_at` (DATETIME (UTC), On Update: CURRENT_TIMESTAMP)

### 2.2 `customers`
Profile extensions for individual service consumers.
- `id` (VARCHAR(36), Primary Key, UUID)
- `user_id` (VARCHAR(36), Foreign Key -> users.id ON DELETE CASCADE, Unique)
- `emergency_contact` (VARCHAR(20), Nullable)
- `default_address_id` (VARCHAR(36), Nullable)
- `created_at` (DATETIME)

### 2.3 `service_providers`
Contractor business entities.
- `id` (VARCHAR(36), Primary Key, UUID)
- `user_id` (VARCHAR(36), Foreign Key -> users.id ON DELETE CASCADE, Unique)
- `business_name` (VARCHAR(200), NOT NULL)
- `description` (TEXT, Nullable)
- `business_address` (TEXT, NOT NULL)
- `years_of_experience` (INT, Default: 1)
- `verification_status` (ENUM: 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', Default: 'PENDING')
- `rejection_reason` (TEXT, Nullable)
- `id_proof_url` (VARCHAR(500), Nullable)
- `license_doc_url` (VARCHAR(500), Nullable)
- `commission_rate` (DECIMAL(5, 2), Default: 10.00)
- `average_rating` (DECIMAL(3, 2), Default: 0.00)
- `total_reviews` (INT, Default: 0)
- `created_at` (DATETIME)

### 2.4 `technicians`
Workforce members dispatched by service providers.
- `id` (VARCHAR(36), Primary Key, UUID)
- `user_id` (VARCHAR(36), Foreign Key -> users.id ON DELETE CASCADE, Unique)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE CASCADE)
- `specialization` (VARCHAR(150), Nullable)
- `is_available` (BOOLEAN, Default: TRUE)
- `rating` (DECIMAL(3, 2), Default: 0.00)
- `total_jobs_completed` (INT, Default: 0)
- `created_at` (DATETIME)

### 2.5 `addresses`
Geographical locations for customers.
- `id` (VARCHAR(36), Primary Key, UUID)
- `customer_id` (VARCHAR(36), Foreign Key -> customers.id ON DELETE CASCADE)
- `title` (VARCHAR(50), e.g., 'Home', 'Office', 'Villa')
- `address_line1` (VARCHAR(255), NOT NULL)
- `address_line2` (VARCHAR(255), Nullable)
- `landmark` (VARCHAR(150), Nullable)
- `city` (VARCHAR(100), NOT NULL)
- `state` (VARCHAR(100), NOT NULL)
- `pincode` (VARCHAR(20), NOT NULL, Indexed)
- `latitude` (DECIMAL(10, 8), Nullable)
- `longitude` (DECIMAL(11, 8), Nullable)
- `is_default` (BOOLEAN, Default: FALSE)
- `created_at` (DATETIME)

### 2.6 `service_categories`
Marketplace taxonomy.
- `id` (VARCHAR(36), Primary Key, UUID)
- `name` (VARCHAR(100), Unique, NOT NULL)
- `slug` (VARCHAR(120), Unique, NOT NULL)
- `description` (TEXT, Nullable)
- `icon` (VARCHAR(100), Nullable)
- `image_url` (VARCHAR(500), Nullable)
- `is_active` (BOOLEAN, Default: TRUE)
- `created_at` (DATETIME)

### 2.7 `services`
Standard platform service catalog items.
- `id` (VARCHAR(36), Primary Key, UUID)
- `category_id` (VARCHAR(36), Foreign Key -> service_categories.id ON DELETE RESTRICT)
- `name` (VARCHAR(150), NOT NULL)
- `slug` (VARCHAR(180), Unique, NOT NULL)
- `description` (TEXT, NOT NULL)
- `base_price` (DECIMAL(10, 2), NOT NULL)
- `estimated_duration_minutes` (INT, Default: 60)
- `image_url` (VARCHAR(500), Nullable)
- `is_active` (BOOLEAN, Default: TRUE)
- `created_at` (DATETIME)

### 2.8 `provider_services`
Provider-specific offerings, custom rates, and activation.
- `id` (VARCHAR(36), Primary Key, UUID)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE CASCADE)
- `service_id` (VARCHAR(36), Foreign Key -> services.id ON DELETE CASCADE)
- `custom_price` (DECIMAL(10, 2), NOT NULL)
- `is_available` (BOOLEAN, Default: TRUE)
- UniqueConstraint: `(provider_id, service_id)`

### 2.9 `service_areas`
Operational coverage boundaries for providers.
- `id` (VARCHAR(36), Primary Key, UUID)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE CASCADE)
- `city` (VARCHAR(100), NOT NULL)
- `pincode` (VARCHAR(20), NOT NULL, Indexed)
- `created_at` (DATETIME)

### 2.10 `availability_slots`
Time slot configurations for providers.
- `id` (VARCHAR(36), Primary Key, UUID)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE CASCADE)
- `day_of_week` (INT, 0=Monday, 6=Sunday)
- `start_time` (TIME, NOT NULL)
- `end_time` (TIME, NOT NULL)
- `slot_capacity` (INT, Default: 1)
- `is_active` (BOOLEAN, Default: TRUE)

### 2.11 `bookings`
Core operational transaction entity.
- `id` (VARCHAR(36), Primary Key, UUID)
- `booking_reference` (VARCHAR(30), Unique, Indexed, NOT NULL)
- `customer_id` (VARCHAR(36), Foreign Key -> customers.id ON DELETE RESTRICT)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE RESTRICT)
- `service_id` (VARCHAR(36), Foreign Key -> services.id ON DELETE RESTRICT)
- `address_id` (VARCHAR(36), Foreign Key -> addresses.id ON DELETE RESTRICT)
- `booking_date` (DATE, NOT NULL, Indexed)
- `time_slot` (VARCHAR(50), NOT NULL)
- `problem_description` (TEXT, NOT NULL)
- `status` (ENUM: 'PENDING', 'CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED', Default: 'PENDING')
- `cancellation_reason` (TEXT, Nullable)
- `rejection_reason` (TEXT, Nullable)
- `base_amount` (DECIMAL(10, 2), NOT NULL)
- `discount_amount` (DECIMAL(10, 2), Default: 0.00)
- `platform_fee` (DECIMAL(10, 2), NOT NULL)
- `final_amount` (DECIMAL(10, 2), NOT NULL)
- `payment_status` (ENUM: 'PENDING', 'PARTIALLY_PAID', 'PAID', 'FAILED', 'REFUNDED', Default: 'PENDING')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 2.12 `booking_assignments`
Technician dispatch records.
- `id` (VARCHAR(36), Primary Key, UUID)
- `booking_id` (VARCHAR(36), Foreign Key -> bookings.id ON DELETE CASCADE)
- `technician_id` (VARCHAR(36), Foreign Key -> technicians.id ON DELETE RESTRICT)
- `assigned_at` (DATETIME, Default: CURRENT_TIMESTAMP)
- `accepted_at` (DATETIME, Nullable)
- `arrival_time` (DATETIME, Nullable)
- `completed_at` (DATETIME, Nullable)
- `technician_remarks` (TEXT, Nullable)

### 2.13 `booking_images`
Before, during, and completion photos.
- `id` (VARCHAR(36), Primary Key, UUID)
- `booking_id` (VARCHAR(36), Foreign Key -> bookings.id ON DELETE CASCADE)
- `image_url` (VARCHAR(500), NOT NULL)
- `image_type` (ENUM: 'CUSTOMER_REFERENCE', 'BEFORE_WORK', 'AFTER_WORK')
- `uploaded_at` (DATETIME)

### 2.14 `payments`
Razorpay gateway transactions.
- `id` (VARCHAR(36), Primary Key, UUID)
- `booking_id` (VARCHAR(36), Foreign Key -> bookings.id ON DELETE RESTRICT)
- `razorpay_order_id` (VARCHAR(100), Unique, Indexed)
- `razorpay_payment_id` (VARCHAR(100), Unique, Nullable)
- `razorpay_signature` (VARCHAR(255), Nullable)
- `amount` (DECIMAL(10, 2), NOT NULL)
- `currency` (VARCHAR(10), Default: 'INR')
- `status` (ENUM: 'PENDING', 'PAID', 'FAILED', 'REFUNDED')
- `created_at` (DATETIME)

### 2.15 `invoices`
Formal financial receipts and tax invoices.
- `id` (VARCHAR(36), Primary Key, UUID)
- `invoice_number` (VARCHAR(50), Unique, Indexed)
- `booking_id` (VARCHAR(36), Foreign Key -> bookings.id ON DELETE CASCADE)
- `subtotal` (DECIMAL(10, 2), NOT NULL)
- `tax_amount` (DECIMAL(10, 2), Default: 0.00)
- `discount` (DECIMAL(10, 2), Default: 0.00)
- `total_amount` (DECIMAL(10, 2), NOT NULL)
- `issued_at` (DATETIME)

### 2.16 `coupons`
Discount promotional campaigns.
- `id` (VARCHAR(36), Primary Key, UUID)
- `code` (VARCHAR(30), Unique, Indexed)
- `discount_percent` (DECIMAL(5, 2), Nullable)
- `flat_discount` (DECIMAL(10, 2), Nullable)
- `min_order_amount` (DECIMAL(10, 2), Default: 0.00)
- `max_discount` (DECIMAL(10, 2), Nullable)
- `valid_until` (DATETIME)
- `is_active` (BOOLEAN, Default: TRUE)

### 2.17 `reviews`
Verified customer feedback on completed bookings.
- `id` (VARCHAR(36), Primary Key, UUID)
- `booking_id` (VARCHAR(36), Foreign Key -> bookings.id ON DELETE CASCADE, Unique)
- `customer_id` (VARCHAR(36), Foreign Key -> customers.id ON DELETE CASCADE)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE CASCADE)
- `rating` (INT, 1 to 5, NOT NULL)
- `comment` (TEXT, Nullable)
- `provider_reply` (TEXT, Nullable)
- `created_at` (DATETIME)

### 2.18 `complaints`
Customer dispute ticket management.
- `id` (VARCHAR(36), Primary Key, UUID)
- `booking_id` (VARCHAR(36), Foreign Key -> bookings.id ON DELETE CASCADE)
- `customer_id` (VARCHAR(36), Foreign Key -> customers.id ON DELETE CASCADE)
- `title` (VARCHAR(200), NOT NULL)
- `description` (TEXT, NOT NULL)
- `status` (ENUM: 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED', Default: 'OPEN')
- `admin_notes` (TEXT, Nullable)
- `created_at` (DATETIME)

### 2.19 `notifications`
In-app notification records.
- `id` (VARCHAR(36), Primary Key, UUID)
- `user_id` (VARCHAR(36), Foreign Key -> users.id ON DELETE CASCADE)
- `title` (VARCHAR(200), NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (VARCHAR(50), NOT NULL)
- `is_read` (BOOLEAN, Default: FALSE)
- `created_at` (DATETIME)

### 2.20 `provider_earnings`
Financial accounting of provider share vs platform commission.
- `id` (VARCHAR(36), Primary Key, UUID)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE CASCADE)
- `booking_id` (VARCHAR(36), Foreign Key -> bookings.id ON DELETE CASCADE)
- `gross_amount` (DECIMAL(10, 2), NOT NULL)
- `platform_commission` (DECIMAL(10, 2), NOT NULL)
- `net_earnings` (DECIMAL(10, 2), NOT NULL)
- `payout_status` (ENUM: 'PENDING', 'PROCESSED', Default: 'PENDING')
- `created_at` (DATETIME)

### 2.21 `refresh_tokens`
Cryptographically secure session token tracking and revocation.
- `id` (VARCHAR(36), Primary Key, UUID)
- `user_id` (VARCHAR(36), Foreign Key -> users.id ON DELETE CASCADE)
- `token` (VARCHAR(500), Unique, NOT NULL)
- `expires_at` (DATETIME, NOT NULL)
- `is_revoked` (BOOLEAN, Default: FALSE)
- `created_at` (DATETIME)

### 2.22 `favorites`
Customer saved providers.
- `id` (VARCHAR(36), Primary Key, UUID)
- `customer_id` (VARCHAR(36), Foreign Key -> customers.id ON DELETE CASCADE)
- `provider_id` (VARCHAR(36), Foreign Key -> service_providers.id ON DELETE CASCADE)
- UniqueConstraint: `(customer_id, provider_id)`
