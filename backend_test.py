import requests
import sys
import json
from datetime import datetime

class CastrezAPITester:
    def __init__(self, base_url="https://workshop-manager-44.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test basic health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_admin_login(self):
        """Test admin login with correct credentials"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "admin@castrezautrans.com",
                "password": "Castrez2024!"
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        success, _ = self.run_test(
            "Admin Login Invalid",
            "POST",
            "auth/login",
            401,
            data={
                "email": "wrong@email.com",
                "password": "wrongpassword"
            }
        )
        return success

    def test_verify_token(self):
        """Test token verification"""
        if not self.token:
            print("❌ No token available for verification")
            return False
        
        return self.run_test(
            "Verify Token",
            "POST",
            "auth/verify",
            200
        )[0]

    def test_workplaces(self):
        """Test workplace management"""
        # Get workplaces
        success, workplaces = self.run_test("Get Workplaces", "GET", "admin/workplaces", 200)
        if not success:
            return False

        # Create workplace
        workplace_data = {
            "name": "Test Workshop",
            "address": "123 Test Street",
            "latitude": 45.7640,
            "longitude": 4.8357,
            "is_active": True
        }
        success, new_workplace = self.run_test(
            "Create Workplace", "POST", "admin/workplaces", 200, workplace_data
        )
        
        if success and 'id' in new_workplace:
            workplace_id = new_workplace['id']
            
            # Update workplace
            update_data = {"name": "Updated Test Workshop"}
            self.run_test(
                "Update Workplace", "PUT", f"admin/workplaces/{workplace_id}", 200, update_data
            )
            
            # Delete workplace
            self.run_test(
                "Delete Workplace", "DELETE", f"admin/workplaces/{workplace_id}", 200
            )
        
        return True

    def test_employees(self):
        """Test employee management"""
        # First create a workplace for the employee
        workplace_data = {
            "name": "Employee Test Workshop",
            "address": "456 Employee Street",
            "is_active": True
        }
        success, workplace = self.run_test(
            "Create Workplace for Employee", "POST", "admin/workplaces", 200, workplace_data
        )
        
        if not success or 'id' not in workplace:
            print("❌ Failed to create workplace for employee test")
            return False
        
        workplace_id = workplace['id']
        
        # Get employees
        success, employees = self.run_test("Get Employees", "GET", "admin/employees", 200)
        if not success:
            return False

        # Create employee
        employee_data = {
            "internal_id": "EMP001",
            "full_name": "Test Employee",
            "position": "Mechanic",
            "workplace_id": workplace_id,
            "is_active": True
        }
        success, new_employee = self.run_test(
            "Create Employee", "POST", "admin/employees", 200, employee_data
        )
        
        if success and 'id' in new_employee:
            employee_id = new_employee['id']
            
            # Update employee
            update_data = {"full_name": "Updated Test Employee"}
            self.run_test(
                "Update Employee", "PUT", f"admin/employees/{employee_id}", 200, update_data
            )
            
            # Search employees
            self.run_test(
                "Search Employees", "GET", "employees/search?q=Test", 200
            )
            
            # Delete employee
            self.run_test(
                "Delete Employee", "DELETE", f"admin/employees/{employee_id}", 200
            )
        
        # Clean up workplace
        self.run_test(
            "Delete Employee Test Workplace", "DELETE", f"admin/workplaces/{workplace_id}", 200
        )
        
        return True

    def test_attendance(self):
        """Test attendance functionality"""
        # Get active workplaces
        success, workplaces = self.run_test("Get Active Workplaces", "GET", "workplaces/active", 200)
        if not success:
            return False

        # Get attendance records
        success, attendance = self.run_test("Get Attendance", "GET", "admin/attendance", 200)
        if not success:
            return False

        # Get attendance stats
        success, stats = self.run_test("Get Attendance Stats", "GET", "admin/stats/attendance", 200)
        return success

    def test_products(self):
        """Test product management"""
        # Get products
        success, products = self.run_test("Get Products", "GET", "products", 200)
        if not success:
            return False

        # Get featured products
        success, featured = self.run_test("Get Featured Products", "GET", "products/featured", 200)
        if not success:
            return False

        # Get weekly deals
        success, deals = self.run_test("Get Weekly Deals", "GET", "products/weekly-deals", 200)
        return success

    def test_appointments(self):
        """Test appointment management"""
        # Get appointments (admin)
        success, appointments = self.run_test("Get Appointments", "GET", "admin/appointments", 200)
        if not success:
            return False

        # Create appointment (public)
        appointment_data = {
            "license_plate": "ABC123",
            "service_type": "Maintenance",
            "preferred_date": "2024-12-20",
            "name": "Test Customer",
            "phone": "123456789",
            "email": "test@example.com",
            "notes": "Test appointment"
        }
        success, new_appointment = self.run_test(
            "Create Appointment", "POST", "appointments", 200, appointment_data
        )
        
        if success and 'id' in new_appointment:
            appointment_id = new_appointment['id']
            
            # Update appointment
            update_data = {"status": "confirmed"}
            self.run_test(
                "Update Appointment", "PUT", f"admin/appointments/{appointment_id}", 200, update_data
            )
            
            # Delete appointment
            self.run_test(
                "Delete Appointment", "DELETE", f"admin/appointments/{appointment_id}", 200
            )
        
        return True

    def test_banners(self):
        """Test banner management"""
        # Get banners
        success, banners = self.run_test("Get Banners", "GET", "admin/banners", 200)
        if not success:
            return False

        # Get active banner (public)
        success, active_banner = self.run_test("Get Active Banner", "GET", "banners/active", 200)
        return success

def main():
    print("🚀 Starting Castrez Autrans API Tests")
    print("=" * 50)
    
    tester = CastrezAPITester()
    
    # Basic tests
    print("\n📋 BASIC TESTS")
    tester.test_health_check()
    
    # Authentication tests
    print("\n🔐 AUTHENTICATION TESTS")
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
    
    tester.test_admin_login_invalid()
    tester.test_verify_token()
    
    # Core functionality tests
    print("\n🏢 WORKPLACE TESTS")
    tester.test_workplaces()
    
    print("\n👥 EMPLOYEE TESTS")
    tester.test_employees()
    
    print("\n📊 ATTENDANCE TESTS")
    tester.test_attendance()
    
    print("\n🛠️ PRODUCT TESTS")
    tester.test_products()
    
    print("\n📅 APPOINTMENT TESTS")
    tester.test_appointments()
    
    print("\n🎯 BANNER TESTS")
    tester.test_banners()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS ({len(tester.failed_tests)}):")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test.get('test', 'Unknown')}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test.get('expected')}, Got: {test.get('actual')}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())