"""
Backend API Tests for Castrez Autrans Workshop Management System
Tests: Appointments, Products, Excel Export, Auth, Employee
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

class TestHealthAndPublicEndpoints:
    """Health check and public API endpoints"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("Health check passed")

    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("Root endpoint passed")

class TestProductsEndpoints:
    """Product CRUD and listing endpoints"""
    
    def test_get_products(self):
        """Test fetching all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Products endpoint returned {len(data)} products")

    def test_get_weekly_deals(self):
        """Test weekly deals endpoint"""
        response = requests.get(f"{BASE_URL}/api/products/weekly-deals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Weekly deals returned {len(data)} products")

    def test_get_featured_products(self):
        """Test featured products endpoint"""
        response = requests.get(f"{BASE_URL}/api/products/featured")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Featured products returned {len(data)} products")

    def test_products_search(self):
        """Test product search functionality"""
        response = requests.get(f"{BASE_URL}/api/products?search=freno")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Search returned {len(data)} products")

    def test_products_by_category(self):
        """Test filtering products by category"""
        response = requests.get(f"{BASE_URL}/api/products?category=frenos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Category filter returned {len(data)} products")


class TestAppointmentsEndpoint:
    """Appointment creation and email notification tests"""
    
    def test_create_appointment_success(self):
        """Test creating a new appointment with all required fields - sends email"""
        appointment_data = {
            "license_plate": "TEST1234",
            "service_type": "essential",
            "preferred_date": "2026-04-01",
            "name": "TEST_Appointment User",
            "phone": "+34600000001",
            "email": "test@example.com",
            "notes": "Test appointment via pytest"
        }
        response = requests.post(f"{BASE_URL}/api/appointments", json=appointment_data)
        assert response.status_code == 200
        data = response.json()
        
        # Verify returned data matches input
        assert data["license_plate"] == appointment_data["license_plate"]
        assert data["service_type"] == appointment_data["service_type"]
        assert data["name"] == appointment_data["name"]
        assert data["phone"] == appointment_data["phone"]
        assert data["status"] == "pending"
        assert "id" in data
        print(f"Appointment created with ID: {data['id']}")
        print("Email notification should have been triggered (check backend logs)")

    def test_create_appointment_minimal_fields(self):
        """Test creating appointment with only required fields"""
        appointment_data = {
            "license_plate": "TEST5678",
            "service_type": "diagnosis",
            "preferred_date": "2026-04-02",
            "name": "TEST_Minimal User",
            "phone": "+34600000002"
        }
        response = requests.post(f"{BASE_URL}/api/appointments", json=appointment_data)
        assert response.status_code == 200
        data = response.json()
        assert data["license_plate"] == appointment_data["license_plate"]
        assert data["email"] is None  # Optional field
        print("Minimal appointment created successfully")

    def test_create_appointment_missing_required(self):
        """Test appointment creation fails without required fields"""
        appointment_data = {
            "license_plate": "TEST0000",
            "service_type": "essential"
            # Missing: name, phone, preferred_date
        }
        response = requests.post(f"{BASE_URL}/api/appointments", json=appointment_data)
        assert response.status_code == 422  # Validation error
        print("Validation correctly rejects incomplete appointment")


class TestAdminAuthentication:
    """Admin login and JWT verification"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@castrezautrans.com",
            "password": "Castrez2024!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@castrezautrans.com"
        assert data["user"]["role"] == "admin"
        print(f"Admin login successful, token received")
        return data["token"]

    def test_admin_login_invalid_email(self):
        """Test admin login with wrong email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "Castrez2024!"
        })
        assert response.status_code == 401
        print("Invalid email correctly rejected")

    def test_admin_login_invalid_password(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@castrezautrans.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid password correctly rejected")

    def test_token_verification(self):
        """Test JWT token verification endpoint"""
        # First get a token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@castrezautrans.com",
            "password": "Castrez2024!"
        })
        token = login_response.json()["token"]
        
        # Verify the token
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/verify",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert verify_response.status_code == 200
        data = verify_response.json()
        assert data["valid"] == True
        print("Token verification passed")


class TestEmployeeAuthentication:
    """Employee login tests"""
    
    def test_employee_login_invalid(self):
        """Test employee login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/employee/login", json={
            "username": "nonexistent",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("Invalid employee credentials correctly rejected")


class TestExcelExport:
    """Excel export endpoint tests"""
    
    def test_attendance_excel_export(self):
        """Test Excel export endpoint returns valid xlsx"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports/attendance/excel",
            params={"date_from": "2026-01-01", "date_to": "2026-12-31"}
        )
        assert response.status_code == 200
        
        # Check content type
        content_type = response.headers.get("Content-Type", "")
        assert "spreadsheetml" in content_type or "application/vnd" in content_type
        
        # Check content disposition
        content_disposition = response.headers.get("Content-Disposition", "")
        assert "attachment" in content_disposition
        assert ".xlsx" in content_disposition
        
        # Check file has content
        assert len(response.content) > 0
        
        # Check XLSX magic bytes (PK\x03\x04)
        assert response.content[:4] == b'PK\x03\x04'
        print(f"Excel export successful, file size: {len(response.content)} bytes")

    def test_attendance_excel_export_default_dates(self):
        """Test Excel export with default date range"""
        response = requests.get(f"{BASE_URL}/api/admin/reports/attendance/excel")
        assert response.status_code == 200
        assert len(response.content) > 0
        print("Excel export with default dates successful")


class TestAdminAppointments:
    """Admin appointment management"""
    
    def test_get_all_appointments(self):
        """Test fetching all appointments as admin"""
        response = requests.get(f"{BASE_URL}/api/admin/appointments")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Admin can view {len(data)} appointments")

    def test_get_appointments_by_status(self):
        """Test filtering appointments by status"""
        response = requests.get(f"{BASE_URL}/api/admin/appointments?status=pending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Pending appointments: {len(data)}")


class TestAdminEmployeesAndWorkplaces:
    """Admin employee and workplace management"""
    
    def test_get_employees(self):
        """Test fetching all employees"""
        response = requests.get(f"{BASE_URL}/api/admin/employees")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Employees count: {len(data)}")

    def test_get_workplaces(self):
        """Test fetching all workplaces"""
        response = requests.get(f"{BASE_URL}/api/admin/workplaces")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Workplaces count: {len(data)}")

    def test_get_active_workplaces(self):
        """Test fetching active workplaces (public)"""
        response = requests.get(f"{BASE_URL}/api/workplaces/active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Active workplaces: {len(data)}")


class TestAttendanceEndpoints:
    """Attendance management endpoints"""
    
    def test_get_attendance(self):
        """Test fetching attendance records"""
        response = requests.get(f"{BASE_URL}/api/admin/attendance")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Attendance records: {len(data)}")

    def test_get_attendance_stats(self):
        """Test attendance statistics endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/stats/attendance")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "by_employee" in data
        assert "total_records" in data["summary"]
        print(f"Stats: {data['summary']['total_records']} records, {data['summary']['total_hours']}h total")


class TestBanners:
    """Banner management"""
    
    def test_get_active_banner(self):
        """Test fetching active banner"""
        response = requests.get(f"{BASE_URL}/api/banners/active")
        # Can return null or banner object
        assert response.status_code == 200
        print("Active banner endpoint works")

    def test_get_all_banners_admin(self):
        """Test admin fetching all banners"""
        response = requests.get(f"{BASE_URL}/api/admin/banners")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Banners count: {len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
