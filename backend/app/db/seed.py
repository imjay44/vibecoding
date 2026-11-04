import sys
import os
from datetime import datetime, date, time, timedelta, timezone
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.entities import (
    User, Customer, ServiceProvider, Technician, Address,
    ServiceCategory, Service, ProviderService, ServiceArea,
    AvailabilitySlot, Booking, BookingAssignment, BookingImage,
    Payment, Invoice, Coupon, Review, Complaint, Notification,
    ProviderEarning
)


def run_seed():
    print("[INFO] Creating all tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Ensure convenience aliases always exist even on pre-seeded databases
        alias_users = [
            ("customer@example.com", "+919876543299", "Customer@123456", "Verified Customer", "CUSTOMER"),
            ("provider@apexhome.com", "+919811111119", "Provider@123456", "Apex Administrator", "SERVICE_PROVIDER"),
            ("rajesh@apexhome.com", "+919844444449", "Tech@123456", "Rajesh Sharma", "TECHNICIAN"),
        ]
        for email, phone, pwd, name, role in alias_users:
            if not db.query(User).filter(User.email == email).first():
                u = User(
                    email=email,
                    phone_number=phone,
                    hashed_password=get_password_hash(pwd),
                    full_name=name,
                    role=role,
                    is_active=True,
                    is_verified=True
                )
                db.add(u)
                db.flush()
                if role == "CUSTOMER":
                    c = Customer(user_id=u.id)
                    db.add(c)
                    db.flush()
                    db.add(Address(customer_id=c.id, title="Home", address_line1="702, Palm Beach Residency", city="Mumbai", state="Maharashtra", pincode="400021", is_default=True))
                elif role == "SERVICE_PROVIDER":
                    p = ServiceProvider(user_id=u.id, business_name="Apex Home Solutions", business_address="Shop 14, Commercial Center, Andheri West, Mumbai", years_of_experience=8, verification_status="APPROVED", commission_rate=Decimal("10.00"), average_rating=Decimal("4.85"), total_reviews=12)
                    db.add(p)
                elif role == "TECHNICIAN":
                    p = db.query(ServiceProvider).first()
                    if p:
                        t = Technician(user_id=u.id, provider_id=p.id, specialization="Master Electrician", is_available=True, rating=Decimal("4.90"), total_jobs_completed=25)
                        db.add(t)
                db.commit()

        if db.query(ServiceCategory).first():
            print("[INFO] Database already contains seed data. Skipping re-seed.")
            return

        print("[INFO] Seeding platform accounts...")

        # 1. Super Admin
        admin = User(
            email="admin@homeserve.com",
            phone_number="+919800000001",
            hashed_password=get_password_hash("Admin@123456"),
            full_name="Platform Super Admin",
            role="SUPER_ADMIN",
            is_active=True,
            is_verified=True
        )
        db.add(admin)

        # 2. Customers
        customer_user1 = User(
            email="rahul.customer@example.com",
            phone_number="+919876543210",
            hashed_password=get_password_hash("Customer@123456"),
            full_name="Rahul Sharma",
            role="CUSTOMER",
            is_active=True,
            is_verified=True
        )
        customer_user2 = User(
            email="priya.patel@example.com",
            phone_number="+919876543211",
            hashed_password=get_password_hash("Customer@123456"),
            full_name="Priya Patel",
            role="CUSTOMER",
            is_active=True,
            is_verified=True
        )
        customer_user3 = User(
            email="customer@example.com",
            phone_number="+919876543212",
            hashed_password=get_password_hash("Customer@123456"),
            full_name="Verified Customer",
            role="CUSTOMER",
            is_active=True,
            is_verified=True
        )
        db.add_all([customer_user1, customer_user2, customer_user3])
        db.flush()

        cust1 = Customer(user_id=customer_user1.id, emergency_contact="+919876543200")
        cust2 = Customer(user_id=customer_user2.id, emergency_contact="+919876543201")
        cust3 = Customer(user_id=customer_user3.id, emergency_contact="+919876543202")
        db.add_all([cust1, cust2, cust3])
        db.flush()

        # Customer Addresses
        addr1 = Address(
            customer_id=cust1.id,
            title="Home",
            address_line1="Flat 402, Sunshine Heights",
            address_line2="Near Green Park Avenue",
            landmark="Opposite Metro Station Gate 2",
            city="Mumbai",
            state="Maharashtra",
            pincode="400001",
            is_default=True
        )
        addr2 = Address(
            customer_id=cust1.id,
            title="Office",
            address_line1="Office 12B, Tech Hub Towers",
            address_line2="BKC Complex",
            landmark="Near Diamond Bourse",
            city="Mumbai",
            state="Maharashtra",
            pincode="400051",
            is_default=False
        )
        addr3 = Address(
            customer_id=cust3.id,
            title="Home",
            address_line1="702, Palm Beach Residency",
            address_line2="Marine Drive",
            landmark="Near Nariman Point",
            city="Mumbai",
            state="Maharashtra",
            pincode="400021",
            is_default=True
        )
        db.add_all([addr1, addr2, addr3])

        # 3. Service Providers
        # Provider 1: Apex Home Solutions (Approved)
        prov_user1 = User(
            email="apex.services@example.com",
            phone_number="+919811111111",
            hashed_password=get_password_hash("Provider@123456"),
            full_name="Rajesh Verma",
            role="SERVICE_PROVIDER",
            is_active=True,
            is_verified=True
        )
        prov_user1_alias = User(
            email="provider@apexhome.com",
            phone_number="+919811111119",
            hashed_password=get_password_hash("Provider@123456"),
            full_name="Apex Administrator",
            role="SERVICE_PROVIDER",
            is_active=True,
            is_verified=True
        )
        # Provider 2: RapidFix Multi-Services (Approved)
        prov_user2 = User(
            email="rapid.fix@example.com",
            phone_number="+919822222222",
            hashed_password=get_password_hash("Provider@123456"),
            full_name="Vikram Malhotra",
            role="SERVICE_PROVIDER",
            is_active=True,
            is_verified=True
        )
        # Provider 3: Citywide Care (Pending Verification)
        prov_user3 = User(
            email="citywide.care@example.com",
            phone_number="+919833333333",
            hashed_password=get_password_hash("Provider@123456"),
            full_name="Anil Deshmukh",
            role="SERVICE_PROVIDER",
            is_active=True,
            is_verified=False
        )
        db.add_all([prov_user1, prov_user1_alias, prov_user2, prov_user3])
        db.flush()

        prov1 = ServiceProvider(
            user_id=prov_user1.id,
            business_name="Apex Home Solutions",
            description="Premium certified technicians for all electrical, plumbing, and AC requirements with 8+ years experience.",
            business_address="Shop 14, Commercial Center, Andheri West, Mumbai",
            years_of_experience=8,
            verification_status="APPROVED",
            commission_rate=Decimal("10.00"),
            average_rating=Decimal("4.85"),
            total_reviews=12
        )
        prov1_alias = ServiceProvider(
            user_id=prov_user1_alias.id,
            business_name="Apex Home Solutions (Alias)",
            description="Premium certified technicians for all electrical, plumbing, and AC requirements with 8+ years experience.",
            business_address="Shop 14, Commercial Center, Andheri West, Mumbai",
            years_of_experience=8,
            verification_status="APPROVED",
            commission_rate=Decimal("10.00"),
            average_rating=Decimal("4.85"),
            total_reviews=12
        )
        prov2 = ServiceProvider(
            user_id=prov_user2.id,
            business_name="RapidFix Multi-Services",
            description="Fast, reliable doorstep repair and maintenance for home appliances, cleaning, and carpentry.",
            business_address="Unit 5, Industrial Estate, Powai, Mumbai",
            years_of_experience=5,
            verification_status="APPROVED",
            commission_rate=Decimal("10.00"),
            average_rating=Decimal("4.70"),
            total_reviews=8
        )
        prov3 = ServiceProvider(
            user_id=prov_user3.id,
            business_name="Citywide Care Services",
            description="Specialized in pest control, deep sanitization, and residential painting.",
            business_address="Ground Floor, New Era Complex, Thane West, Mumbai",
            years_of_experience=3,
            verification_status="PENDING",
            commission_rate=Decimal("10.00"),
            average_rating=Decimal("0.00"),
            total_reviews=0
        )
        db.add_all([prov1, prov1_alias, prov2, prov3])
        db.flush()

        # Provider Service Areas
        area1 = ServiceArea(provider_id=prov1.id, city="Mumbai", pincode="400001")
        area2 = ServiceArea(provider_id=prov1.id, city="Mumbai", pincode="400051")
        area3 = ServiceArea(provider_id=prov2.id, city="Mumbai", pincode="400001")
        db.add_all([area1, area2, area3])

        # Provider Working Hours (Slots)
        for day in range(7):
            slot_p1 = AvailabilitySlot(
                provider_id=prov1.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(19, 0),
                slot_capacity=3,
                is_active=True
            )
            slot_p2 = AvailabilitySlot(
                provider_id=prov2.id,
                day_of_week=day,
                start_time=time(8, 30),
                end_time=time(20, 0),
                slot_capacity=4,
                is_active=True
            )
            db.add_all([slot_p1, slot_p2])

        # 4. Technicians
        tech_user1 = User(
            email="amit.tech@example.com",
            phone_number="+919844444441",
            hashed_password=get_password_hash("Tech@123456"),
            full_name="Amit Verma",
            role="TECHNICIAN",
            is_active=True,
            is_verified=True
        )
        tech_user1_alias = User(
            email="rajesh@apexhome.com",
            phone_number="+919844444449",
            hashed_password=get_password_hash("Tech@123456"),
            full_name="Rajesh Sharma",
            role="TECHNICIAN",
            is_active=True,
            is_verified=True
        )
        tech_user2 = User(
            email="suresh.tech@example.com",
            phone_number="+919844444442",
            hashed_password=get_password_hash("Tech@123456"),
            full_name="Suresh Kumar",
            role="TECHNICIAN",
            is_active=True,
            is_verified=True
        )
        db.add_all([tech_user1, tech_user1_alias, tech_user2])
        db.flush()

        tech1 = Technician(
            user_id=tech_user1.id,
            provider_id=prov1.id,
            specialization="Master Electrician & HVAC Specialist",
            is_available=True,
            rating=Decimal("4.90"),
            total_jobs_completed=28
        )
        tech1_alias = Technician(
            user_id=tech_user1_alias.id,
            provider_id=prov1.id,
            specialization="Master Electrician & HVAC Specialist",
            is_available=True,
            rating=Decimal("4.90"),
            total_jobs_completed=28
        )
        tech2 = Technician(
            user_id=tech_user2.id,
            provider_id=prov2.id,
            specialization="Certified Appliance Technician & Plumber",
            is_available=True,
            rating=Decimal("4.75"),
            total_jobs_completed=19
        )
        db.add_all([tech1, tech1_alias, tech2])
        db.flush()

        print("[INFO] Seeding service catalog categories...")

        # 5. Service Categories
        categories_data = [
            ("Electrical Services", "electrical", "Certified electricians for fan, wiring, switchboards and power points.", "Zap"),
            ("Plumbing Services", "plumbing", "Expert leak repairs, pipe fitting, water heaters, and fixture installations.", "Wrench"),
            ("AC Repair & Maintenance", "ac-repair", "Complete AC servicing, jet pump cleaning, gas refills, and cooling fixes.", "Wind"),
            ("Home Cleaning", "cleaning", "Deep home cleaning, bathroom disinfection, and sofa sanitization.", "Sparkles"),
            ("Painting Services", "painting", "Interior, exterior, waterproof wall painting and modern texture accents.", "Paintbrush"),
            ("Carpentry Services", "carpentry", "Furniture repair, lock assembly, cabinet fixes, and custom woodcraft.", "Hammer"),
            ("Appliance Repair", "appliance-repair", "Doorstep diagnostics and repairs for washing machines, fridges, and ovens.", "Tv"),
            ("Pest Control", "pest-control", "Safe, odorless extermination of cockroaches, termites, and bedbugs.", "ShieldAlert")
        ]

        created_categories = {}
        for name, slug, desc, icon in categories_data:
            cat = ServiceCategory(
                name=name,
                slug=slug,
                description=desc,
                icon=icon,
                image_url=f"/assets/categories/{slug}.jpg",
                is_active=True
            )
            db.add(cat)
            db.flush()
            created_categories[slug] = cat

        print("[INFO] Seeding individual services...")

        # 6. Services under Categories
        services_data = [
            # Electrical
            ("electrical", "Ceiling Fan Installation & Repair", "fan-install", "Quick replacement, regulator fix, and wobble alignment.", Decimal("299.00"), 45),
            ("electrical", "Switchboard & Socket Replacement", "switchboard-repair", "Repair faulty switches, short circuits, and MCB trips.", Decimal("199.00"), 30),
            ("electrical", "Complete Home Wiring Inspection", "wiring-inspection", "Comprehensive safety audit and earthing test.", Decimal("899.00"), 90),
            
            # Plumbing
            ("plumbing", "Tap & Shower Mixer Repair", "tap-mixer-repair", "Fix leaking taps, aerators, and low water pressure issues.", Decimal("249.00"), 40),
            ("plumbing", "Toilet Flush & Drain Blockage", "flush-blockage-repair", "Unblock severe bathroom and kitchen sink clogs.", Decimal("399.00"), 60),
            ("plumbing", "Water Tank Deep Cleaning", "tank-cleaning", "Sediment removal and antibacterial disinfection.", Decimal("799.00"), 90),
            
            # AC
            ("ac-repair", "AC Deep Jet Cleaning Service", "ac-jet-service", "High-pressure indoor and outdoor unit jet cleaning.", Decimal("599.00"), 60),
            ("ac-repair", "AC Gas Refill & Leak Fix", "ac-gas-refill", "Refrigerant pressure top-up and joint leak solder test.", Decimal("1499.00"), 75),

            # Cleaning
            ("cleaning", "Full Home Deep Cleaning (2 BHK)", "full-deep-cleaning", "Intensive scrubbing, degreasing, and floor buffing.", Decimal("2499.00"), 240),
            ("cleaning", "Bathroom & Kitchen Intensive Clean", "bath-kitchen-clean", "Descaling tiles, chimney degrease, and sanitization.", Decimal("1199.00"), 120),

            # Painting
            ("painting", "Fresh Wall Painting (Per Sq Ft)", "wall-painting", "Two coats of premium emulsion with primer and putty.", Decimal("1299.00"), 300),

            # Carpentry
            ("carpentry", "Door Lock & Handle Assembly", "lock-assembly", "Mortise lock, latch, and hinge realignment.", Decimal("349.00"), 45),
            ("carpentry", "Bed & Wardrobe Assembly", "furniture-assembly", "Precision knockdown furniture joining and leveling.", Decimal("699.00"), 90),

            # Appliance
            ("appliance-repair", "Washing Machine Diagnostics", "washing-machine-repair", "Motor, belt, drain pump, and motherboard repair.", Decimal("399.00"), 60),
            ("appliance-repair", "Refrigerator Cooling Repair", "fridge-repair", "Thermostat, compressor, and gas checking.", Decimal("499.00"), 60),

            # Pest Control
            ("pest-control", "Complete Pest & Termite Control", "termite-control", "Targeted gel and spray application with 90-day warranty.", Decimal("999.00"), 90)
        ]

        created_services = {}
        for cat_slug, name, slug, desc, price, duration in services_data:
            svc = Service(
                category_id=created_categories[cat_slug].id,
                name=name,
                slug=slug,
                description=desc,
                base_price=price,
                estimated_duration_minutes=duration,
                image_url=f"/assets/services/{slug}.jpg",
                is_active=True
            )
            db.add(svc)
            db.flush()
            created_services[slug] = svc

        # 7. Map Services to Providers with Custom Pricing
        for slug in ["fan-install", "switchboard-repair", "wiring-inspection", "tap-mixer-repair", "ac-jet-service", "ac-gas-refill"]:
            ps1 = ProviderService(
                provider_id=prov1.id,
                service_id=created_services[slug].id,
                custom_price=created_services[slug].base_price,
                is_available=True
            )
            db.add(ps1)

        for slug in ["flush-blockage-repair", "full-deep-cleaning", "washing-machine-repair", "fridge-repair", "furniture-assembly"]:
            ps2 = ProviderService(
                provider_id=prov2.id,
                service_id=created_services[slug].id,
                custom_price=created_services[slug].base_price,
                is_available=True
            )
            db.add(ps2)

        print("[INFO] Seeding promotional coupons...")

        # 8. Coupons
        coupon1 = Coupon(
            code="WELCOME100",
            flat_discount=Decimal("100.00"),
            min_order_amount=Decimal("499.00"),
            valid_until=datetime.now(timezone.utc) + timedelta(days=180),
            is_active=True
        )
        coupon2 = Coupon(
            code="FESTIVE20",
            discount_percent=Decimal("20.00"),
            max_discount=Decimal("500.00"),
            min_order_amount=Decimal("799.00"),
            valid_until=datetime.now(timezone.utc) + timedelta(days=90),
            is_active=True
        )
        coupon3 = Coupon(
            code="CLEAN50",
            flat_discount=Decimal("50.00"),
            min_order_amount=Decimal("299.00"),
            valid_until=datetime.now(timezone.utc) + timedelta(days=60),
            is_active=True
        )
        db.add_all([coupon1, coupon2, coupon3])

        print("[INFO] Seeding demonstration bookings...")

        # 9. Bookings & Reviews
        # Booking 1: Completed with review
        today = date.today()
        b1 = Booking(
            booking_reference="HS-20261101-A1B2",
            customer_id=cust1.id,
            provider_id=prov1.id,
            service_id=created_services["ac-jet-service"].id,
            address_id=addr1.id,
            booking_date=today - timedelta(days=3),
            time_slot="10:00 AM - 12:00 PM",
            problem_description="AC is not cooling properly and airflow is weak.",
            status="COMPLETED",
            base_amount=Decimal("599.00"),
            discount_amount=Decimal("50.00"),
            platform_fee=Decimal("0.00"),
            final_amount=Decimal("549.00"),
            payment_status="PAID"
        )
        db.add(b1)
        db.flush()

        # Assignment for b1
        assign1 = BookingAssignment(
            booking_id=b1.id,
            technician_id=tech1.id,
            assigned_at=datetime.now(timezone.utc) - timedelta(days=3, hours=3),
            accepted_at=datetime.now(timezone.utc) - timedelta(days=3, hours=2),
            arrival_time=datetime.now(timezone.utc) - timedelta(days=3, hours=1),
            completed_at=datetime.now(timezone.utc) - timedelta(days=3),
            technician_remarks="Complete deep jet cleaning done. Filters cleaned, airflow normalized."
        )
        db.add(assign1)

        # Payment for b1
        pay1 = Payment(
            booking_id=b1.id,
            razorpay_order_id="order_demo_1001",
            razorpay_payment_id="pay_demo_1001",
            razorpay_signature="test_signature_valid",
            amount=Decimal("549.00"),
            currency="INR",
            status="PAID"
        )
        db.add(pay1)

        # Invoice for b1
        inv1 = Invoice(
            invoice_number="INV-HS-20261101-A1B2",
            booking_id=b1.id,
            subtotal=Decimal("599.00"),
            tax_amount=Decimal("0.00"),
            discount=Decimal("50.00"),
            total_amount=Decimal("549.00")
        )
        db.add(inv1)

        # Provider Earning for b1
        earn1 = ProviderEarning(
            provider_id=prov1.id,
            booking_id=b1.id,
            gross_amount=Decimal("549.00"),
            platform_commission=Decimal("54.90"),
            net_earnings=Decimal("494.10"),
            payout_status="PENDING"
        )
        db.add(earn1)

        # Review for b1
        rev1 = Review(
            booking_id=b1.id,
            customer_id=cust1.id,
            provider_id=prov1.id,
            rating=5,
            comment="Excellent service by Amit! AC is cooling like brand new now. Arrived right on time.",
            provider_reply="Thank you Rahul! Always happy to deliver top-notch cooling solutions."
        )
        db.add(rev1)

        # Booking 2: Confirmed upcoming
        b2 = Booking(
            booking_reference="HS-20261104-C3D4",
            customer_id=cust1.id,
            provider_id=prov1.id,
            service_id=created_services["fan-install"].id,
            address_id=addr1.id,
            booking_date=today + timedelta(days=1),
            time_slot="02:00 PM - 04:00 PM",
            problem_description="Need to mount and connect two new decorative ceiling fans in living room.",
            status="CONFIRMED",
            base_amount=Decimal("299.00"),
            discount_amount=Decimal("0.00"),
            platform_fee=Decimal("0.00"),
            final_amount=Decimal("299.00"),
            payment_status="PAID"
        )
        db.add(b2)
        db.flush()

        pay2 = Payment(
            booking_id=b2.id,
            razorpay_order_id="order_demo_1002",
            razorpay_payment_id="pay_demo_1002",
            razorpay_signature="test_signature_valid",
            amount=Decimal("299.00"),
            currency="INR",
            status="PAID"
        )
        db.add(pay2)

        # Notifications
        notif1 = Notification(
            user_id=customer_user1.id,
            title="Booking Confirmed",
            message="Your booking #HS-20261104-C3D4 for Ceiling Fan Installation is confirmed.",
            type="BOOKING",
            is_read=False
        )
        notif2 = Notification(
            user_id=prov_user1.id,
            title="New Confirmed Booking",
            message="You have a confirmed booking #HS-20261104-C3D4 scheduled for tomorrow.",
            type="BOOKING",
            is_read=False
        )
        db.add_all([notif1, notif2])

        db.commit()
        print("[SUCCESS] Database successfully seeded with rich demo data!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {str(e)}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
