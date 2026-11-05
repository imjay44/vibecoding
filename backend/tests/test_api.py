import pytest
from decimal import Decimal
from datetime import date, timedelta
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.db.session import engine, Base
from app.db.seed import run_seed
from app.core.security import get_password_hash, verify_password
from app.services.payment_service import verify_razorpay_signature


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    run_seed()


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_password_hashing():
    raw_pass = "SecurePass123!"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


@pytest.mark.asyncio
async def test_customer_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        email = "test.cust.unit2@example.com"
        reg_payload = {
            "email": email,
            "phone_number": "+919998887799",
            "password": "Password@123",
            "full_name": "Test Customer 2",
            "emergency_contact": "+919998887798"
        }
        reg_res = await client.post("/api/v1/auth/register/customer", json=reg_payload)
        assert reg_res.status_code in [201, 409]

        login_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "Password@123"
        })
        assert login_res.status_code == 200
        token_data = login_res.json()["data"]
        assert "access_token" in token_data
        assert token_data["role"] == "CUSTOMER"


@pytest.mark.asyncio
async def test_provider_registration_and_admin_verification():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        email = "contractor.flow@example.com"
        payload = {
            "email": email,
            "phone_number": "+919998887788",
            "password": "Password@123",
            "full_name": "Contractor Flow",
            "business_name": "Flow Services",
            "business_address": "456 Avenue, Pune",
            "years_of_experience": 6
        }
        reg_res = await client.post("/api/v1/auth/register/provider", json=payload)
        assert reg_res.status_code in [201, 409]

        # Admin login
        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@homeserve.com",
            "password": "Admin@123456"
        })
        admin_token = admin_login.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}

        # Check pending providers list
        pending_res = await client.get("/api/v1/admin/providers/pending", headers=headers)
        assert pending_res.status_code == 200
        pending_list = pending_res.json()["data"]
        assert isinstance(pending_list, list)

        # Approve if pending provider exists
        if pending_list:
            prov_id = pending_list[0]["id"]
            verify_res = await client.patch(
                f"/api/v1/admin/providers/{prov_id}/verify",
                json={"action": "APPROVE"},
                headers=headers
            )
            assert verify_res.status_code == 200
            assert verify_res.json()["data"]["verification_status"] == "APPROVED"


@pytest.mark.asyncio
async def test_services_catalog_and_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/services")
        assert res.status_code == 200
        services = res.json()["data"]
        assert len(services) > 0

        # Search query
        search_res = await client.get("/api/v1/services?search=fan")
        assert search_res.status_code == 200
        fan_services = search_res.json()["data"]
        assert any("Fan" in s["name"] for s in fan_services)


@pytest.mark.asyncio
async def test_coupon_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "rahul.customer@example.com",
            "password": "Customer@123456"
        })
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.post("/api/v1/coupons/validate", json={
            "code": "WELCOME100",
            "order_amount": 599.0
        }, headers=headers)
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["is_valid"] is True
        assert float(data["discount_amount"]) == 100.0
        assert float(data["final_amount"]) == 499.0


@pytest.mark.asyncio
async def test_razorpay_signature_verification():
    assert verify_razorpay_signature("order_123", "pay_456", "test_signature_valid") is True
    assert verify_razorpay_signature("order_123", "pay_456", "invalid_bogus_signature") is False


@pytest.mark.asyncio
async def test_customer_booking_creation_and_invoice():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Customer login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "rahul.customer@example.com",
            "password": "Customer@123456"
        })
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch address
        addr_res = await client.get("/api/v1/customers/addresses", headers=headers)
        assert addr_res.status_code == 200
        addresses = addr_res.json()["data"]
        assert len(addresses) > 0
        addr_id = addresses[0]["id"]

        # Fetch approved provider
        prov_res = await client.get("/api/v1/providers")
        assert prov_res.status_code == 200
        providers = prov_res.json()["data"]
        assert len(providers) > 0
        prov_id = providers[0]["id"]

        # Fetch service
        svc_res = await client.get("/api/v1/services")
        assert svc_res.status_code == 200
        services = svc_res.json()["data"]
        svc_id = services[0]["id"]

        # Book service for open upcoming date
        import secrets
        target_date = (date.today() + timedelta(days=15 + secrets.randbelow(50))).isoformat()
        booking_payload = {
            "provider_id": prov_id,
            "service_id": svc_id,
            "address_id": addr_id,
            "booking_date": target_date,
            "time_slot": "10:00 AM - 12:00 PM",
            "problem_description": "General service required for master bedroom.",
            "coupon_code": "WELCOME100"
        }

        b_res = await client.post("/api/v1/bookings", json=booking_payload, headers=headers)
        assert b_res.status_code == 201
        booking = b_res.json()["data"]
        assert booking["status"] == "PENDING"
        assert "HS-" in booking["booking_reference"]
        booking_id = booking["id"]

        # Test Order Creation
        order_res = await client.post("/api/v1/payments/create-order", json={"booking_id": booking_id}, headers=headers)
        assert order_res.status_code == 200
        order_data = order_res.json()["data"]
        assert "order_id" in order_data

        # Verify Payment (Test Mode)
        verify_res = await client.post("/api/v1/payments/verify", json={
            "booking_id": booking_id,
            "razorpay_order_id": order_data["order_id"],
            "razorpay_payment_id": f"pay_test_{booking_id[:6]}",
            "razorpay_signature": "test_signature_valid"
        }, headers=headers)
        assert verify_res.status_code == 200

        # Check Invoice generated
        inv_res = await client.get(f"/api/v1/invoices/{booking_id}", headers=headers)
        assert inv_res.status_code == 200
        assert "INV-" in inv_res.json()["data"]["invoice_number"]


@pytest.mark.asyncio
async def test_admin_stats_authorization():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cust_login = await client.post("/api/v1/auth/login", json={
            "email": "rahul.customer@example.com",
            "password": "Customer@123456"
        })
        cust_token = cust_login.json()["data"]["access_token"]
        denied_res = await client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {cust_token}"})
        assert denied_res.status_code == 403

        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@homeserve.com",
            "password": "Admin@123456"
        })
        admin_token = admin_login.json()["data"]["access_token"]
        stats_res = await client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
        assert stats_res.status_code == 200
        stats = stats_res.json()["data"]
        assert stats["total_customers"] >= 1
        assert stats["total_providers"] >= 1


@pytest.mark.asyncio
async def test_rag_chat_handbook_and_fallback():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # In-PDF Question
        res_in = await client.post("/api/v1/chat", json={
            "message": "What is the warranty period for plumbing?"
        })
        assert res_in.status_code == 200
        data_in = res_in.json()["data"]
        assert "30" in data_in["reply"] or "workmanship" in data_in["reply"].lower()
        assert data_in["is_fallback"] is False

        # Out-of-PDF Question (Guaranteed Static Fallback)
        res_out = await client.post("/api/v1/chat", json={
            "message": "What is the distance between the Earth and Mars?"
        })
        assert res_out.status_code == 200
        data_out = res_out.json()["data"]
        assert "only answer questions related to the HomeServe company policies" in data_out["reply"]
        assert data_out["is_fallback"] is True
