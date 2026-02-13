from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import io
import xlsxwriter
import jwt
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Google OAuth config (optional)
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

# Admin credentials (simple auth)
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@castrezautrans.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Castrez2024!')
JWT_SECRET = os.environ.get('JWT_SECRET', 'castrez-autrans-jwt-secret-2024-secure')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI()

# Add session middleware for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get('SESSION_SECRET', 'castrez-autrans-secret-key-2024')
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    discount_price: Optional[float] = None
    category: str
    reference: str
    image_url: Optional[str] = None
    is_reconditioned: bool = False
    is_featured: bool = False
    is_weekly_deal: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    discount_price: Optional[float] = None
    category: str
    reference: str
    image_url: Optional[str] = None
    is_reconditioned: bool = False
    is_featured: bool = False
    is_weekly_deal: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    category: Optional[str] = None
    reference: Optional[str] = None
    image_url: Optional[str] = None
    is_reconditioned: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_weekly_deal: Optional[bool] = None

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    license_plate: str
    service_type: str
    preferred_date: str
    name: str
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    license_plate: str
    service_type: str
    preferred_date: str
    name: str
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class Banner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    discount_text: str
    is_active: bool = True
    expires_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BannerCreate(BaseModel):
    title: str
    description: str
    discount_text: str
    is_active: bool = True
    expires_at: Optional[str] = None

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    google_id: str
    is_admin: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoogleAuthRequest(BaseModel):
    credential: str

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    token: str
    user: dict

# ============ EMPLOYEE MODELS ============

class Workplace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkplaceCreate(BaseModel):
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool = True

class Employee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    internal_id: str
    full_name: str
    position: str
    workplace_id: str
    workplace_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmployeeCreate(BaseModel):
    internal_id: str
    full_name: str
    position: str
    workplace_id: str
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: bool = True

class EmployeeUpdate(BaseModel):
    internal_id: Optional[str] = None
    full_name: Optional[str] = None
    position: Optional[str] = None
    workplace_id: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeLoginRequest(BaseModel):
    username: str
    password: str

class AttendanceCreate(BaseModel):
    employee_id: str
    workplace_id: str
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: str = "present"
    notes: Optional[str] = None

class Attendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    employee_name: str
    date: str
    check_in: Optional[str] = None
    check_in_lat: Optional[float] = None
    check_in_lng: Optional[float] = None
    check_out: Optional[str] = None
    check_out_lat: Optional[float] = None
    check_out_lng: Optional[float] = None
    workplace_id: str
    workplace_name: Optional[str] = None
    hours_worked: Optional[float] = None
    status: str = "present"  # present, late, absent
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AttendanceCheckIn(BaseModel):
    employee_id: str
    workplace_id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AttendanceCheckOut(BaseModel):
    attendance_id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AttendanceUpdate(BaseModel):
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

# ============ HELPER FUNCTIONS ============

def serialize_doc(doc: dict) -> dict:
    """Convert datetime to ISO string for JSON serialization"""
    if doc.get('created_at') and isinstance(doc['created_at'], datetime):
        doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('expires_at') and isinstance(doc['expires_at'], datetime):
        doc['expires_at'] = doc['expires_at'].isoformat()
    return doc

def deserialize_doc(doc: dict) -> dict:
    """Convert ISO string back to datetime"""
    if doc.get('created_at') and isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

def calculate_hours(check_in: str, check_out: str) -> float:
    """Calculate hours worked between check in and check out"""
    try:
        time_in = datetime.strptime(check_in, "%H:%M")
        time_out = datetime.strptime(check_out, "%H:%M")
        diff = time_out - time_in
        return round(diff.total_seconds() / 3600, 2)
    except:
        return 0

# ============ PUBLIC ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Castrez Autrans API"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Products (Public)
@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"reference": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return [deserialize_doc(p) for p in products]

@api_router.get("/products/featured", response_model=List[Product])
async def get_featured_products():
    products = await db.products.find({"is_featured": True}, {"_id": 0}).to_list(20)
    return [deserialize_doc(p) for p in products]

@api_router.get("/products/weekly-deals", response_model=List[Product])
async def get_weekly_deals():
    """Get products marked as weekly deals with discounts"""
    products = await db.products.find(
        {"$or": [{"is_weekly_deal": True}, {"discount_price": {"$ne": None, "$exists": True}}]},
        {"_id": 0}
    ).to_list(20)
    return [deserialize_doc(p) for p in products]

@api_router.get("/products/discounted", response_model=List[Product])
async def get_discounted_products():
    products = await db.products.find(
        {"discount_price": {"$ne": None, "$exists": True}},
        {"_id": 0}
    ).to_list(20)
    return [deserialize_doc(p) for p in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return deserialize_doc(product)

# Appointments (Public create)
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(input: AppointmentCreate):
    appointment = Appointment(**input.model_dump())
    doc = serialize_doc(appointment.model_dump())
    await db.appointments.insert_one(doc)
    return appointment

# Banner (Public)
@api_router.get("/banners/active")
async def get_active_banner():
    banner = await db.banners.find_one({"is_active": True}, {"_id": 0})
    if banner:
        return deserialize_doc(banner)
    return None

# ============ EMPLOYEE PUBLIC ROUTES (for tablet) ============

@api_router.get("/employees/search")
async def search_employees(q: str):
    """Search employees by name for autocomplete"""
    if len(q) < 2:
        return []
    
    employees = await db.employees.find(
        {
            "full_name": {"$regex": q, "$options": "i"},
            "is_active": True
        },
        {"_id": 0}
    ).to_list(10)
    
    return [deserialize_doc(e) for e in employees]

@api_router.get("/workplaces/active")
async def get_active_workplaces():
    """Get active workplaces for attendance form"""
    workplaces = await db.workplaces.find({"is_active": True}, {"_id": 0}).to_list(50)
    return [deserialize_doc(w) for w in workplaces]

@api_router.post("/attendance/check-in")
async def check_in(input: AttendanceCheckIn):
    """Employee check in"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if already checked in today
    existing = await db.attendance.find_one({
        "employee_id": input.employee_id,
        "date": today
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Ya has registrado entrada hoy")
    
    # Get employee and workplace info
    employee = await db.employees.find_one({"id": input.employee_id}, {"_id": 0})
    if not employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    workplace = await db.workplaces.find_one({"id": input.workplace_id}, {"_id": 0})
    workplace_name = workplace["name"] if workplace else "Desconocido"
    
    current_time = datetime.now(timezone.utc).strftime("%H:%M")
    
    # Check if late (after 8:15)
    status = "present"
    try:
        check_time = datetime.strptime(current_time, "%H:%M")
        late_threshold = datetime.strptime("08:15", "%H:%M")
        if check_time > late_threshold:
            status = "late"
    except:
        pass
    
    attendance = Attendance(
        employee_id=input.employee_id,
        employee_name=employee["full_name"],
        date=today,
        check_in=current_time,
        check_in_lat=input.latitude,
        check_in_lng=input.longitude,
        workplace_id=input.workplace_id,
        workplace_name=workplace_name,
        status=status
    )
    
    doc = serialize_doc(attendance.model_dump())
    await db.attendance.insert_one(doc)
    
    return {"message": "Entrada registrada", "attendance": attendance}

@api_router.post("/attendance/check-out")
async def check_out(input: AttendanceCheckOut):
    """Employee check out"""
    attendance = await db.attendance.find_one({"id": input.attendance_id}, {"_id": 0})
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Registro de asistencia no encontrado")
    
    if attendance.get("check_out"):
        raise HTTPException(status_code=400, detail="Ya has registrado salida")
    
    current_time = datetime.now(timezone.utc).strftime("%H:%M")
    hours_worked = calculate_hours(attendance["check_in"], current_time)
    
    await db.attendance.update_one(
        {"id": input.attendance_id},
        {"$set": {
            "check_out": current_time,
            "check_out_lat": input.latitude,
            "check_out_lng": input.longitude,
            "hours_worked": hours_worked
        }}
    )
    
    return {"message": "Salida registrada", "hours_worked": hours_worked}

@api_router.get("/attendance/today/{employee_id}")
async def get_today_attendance(employee_id: str):
    """Get today's attendance for an employee"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    attendance = await db.attendance.find_one({
        "employee_id": employee_id,
        "date": today
    }, {"_id": 0})
    
    if attendance:
        return deserialize_doc(attendance)
    return None

# ============ ADMIN AUTH (Simple JWT) ============

def create_jwt_token(email: str) -> str:
    """Create a JWT token for admin user"""
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": email,
        "exp": expiration,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

@api_router.post("/auth/login")
async def admin_login(credentials: AdminLoginRequest):
    """Admin login with email and password"""
    # Validate credentials
    if credentials.email != ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Create JWT token
    token = create_jwt_token(credentials.email)
    
    return {
        "token": token,
        "user": {
            "email": ADMIN_EMAIL,
            "name": "Administrador",
            "role": "admin"
        }
    }

@api_router.post("/auth/verify")
async def verify_token(request: Request):
    """Verify if token is valid"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    token = auth_header.split(" ")[1]
    payload = verify_jwt_token(token)
    
    return {
        "valid": True,
        "user": {
            "email": payload["sub"],
            "name": "Administrador",
            "role": "admin"
        }
    }

# ============ GOOGLE AUTH (Optional) ============
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

@api_router.post("/auth/google")
async def google_auth(request: Request, auth_data: GoogleAuthRequest):
    """Verify Google JWT token and create/login user"""
    try:
        # Verify the Google token
        async with httpx.AsyncClient() as client_http:
            response = await client_http.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={auth_data.credential}"
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            
            user_info = response.json()
            
            # Check if the token is valid for our client
            if user_info.get('aud') != GOOGLE_CLIENT_ID:
                raise HTTPException(status_code=401, detail="Token not valid for this application")
            
            email = user_info.get('email')
            google_id = user_info.get('sub')
            name = user_info.get('name', email)
            picture = user_info.get('picture')
            
            # Check if user exists
            existing_user = await db.admin_users.find_one({"google_id": google_id}, {"_id": 0})
            
            if existing_user:
                return {
                    "user": deserialize_doc(existing_user),
                    "is_new": False
                }
            
            # Create new admin user
            new_user = AdminUser(
                email=email,
                name=name,
                picture=picture,
                google_id=google_id
            )
            doc = serialize_doc(new_user.model_dump())
            await db.admin_users.insert_one(doc)
            
            return {
                "user": new_user.model_dump(),
                "is_new": True
            }
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error verifying token: {str(e)}")

@api_router.get("/auth/me")
async def get_current_user(request: Request):
    """Get current user from session"""
    user_id = request.session.get('user_id')
    if not user_id:
        return None
    
    user = await db.admin_users.find_one({"id": user_id}, {"_id": 0})
    if user:
        return deserialize_doc(user)
    return None

# ============ ADMIN ROUTES ============

# Products Admin
@api_router.post("/admin/products", response_model=Product)
async def create_product(input: ProductCreate):
    product = Product(**input.model_dump())
    doc = serialize_doc(product.model_dump())
    await db.products.insert_one(doc)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, input: ProductUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return deserialize_doc(product)

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# Appointments Admin
@api_router.get("/admin/appointments", response_model=List[Appointment])
async def get_all_appointments(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [deserialize_doc(a) for a in appointments]

@api_router.put("/admin/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: str, input: AppointmentUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    return deserialize_doc(appointment)

@api_router.delete("/admin/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted"}

# Banners Admin
@api_router.get("/admin/banners", response_model=List[Banner])
async def get_all_banners():
    banners = await db.banners.find({}, {"_id": 0}).to_list(50)
    return [deserialize_doc(b) for b in banners]

@api_router.post("/admin/banners", response_model=Banner)
async def create_banner(input: BannerCreate):
    banner = Banner(**input.model_dump())
    doc = serialize_doc(banner.model_dump())
    await db.banners.insert_one(doc)
    return banner

@api_router.put("/admin/banners/{banner_id}", response_model=Banner)
async def update_banner(banner_id: str, input: BannerCreate):
    update_data = input.model_dump()
    
    result = await db.banners.update_one(
        {"id": banner_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    banner = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    return deserialize_doc(banner)

@api_router.delete("/admin/banners/{banner_id}")
async def delete_banner(banner_id: str):
    result = await db.banners.delete_one({"id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted"}

# ============ WORKPLACE ADMIN ROUTES ============

@api_router.get("/admin/workplaces")
async def get_all_workplaces():
    workplaces = await db.workplaces.find({}, {"_id": 0}).to_list(100)
    return [deserialize_doc(w) for w in workplaces]

@api_router.post("/admin/workplaces")
async def create_workplace(input: WorkplaceCreate):
    workplace = Workplace(**input.model_dump())
    doc = serialize_doc(workplace.model_dump())
    await db.workplaces.insert_one(doc)
    return workplace

@api_router.put("/admin/workplaces/{workplace_id}")
async def update_workplace(workplace_id: str, input: WorkplaceCreate):
    update_data = input.model_dump()
    
    result = await db.workplaces.update_one(
        {"id": workplace_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workplace not found")
    
    workplace = await db.workplaces.find_one({"id": workplace_id}, {"_id": 0})
    return deserialize_doc(workplace)

@api_router.delete("/admin/workplaces/{workplace_id}")
async def delete_workplace(workplace_id: str):
    result = await db.workplaces.delete_one({"id": workplace_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workplace not found")
    return {"message": "Workplace deleted"}

# ============ EMPLOYEE ADMIN ROUTES ============

@api_router.get("/admin/employees")
async def get_all_employees():
    employees = await db.employees.find({}, {"_id": 0}).to_list(500)
    
    # Enrich with workplace names
    for emp in employees:
        if emp.get("workplace_id"):
            workplace = await db.workplaces.find_one({"id": emp["workplace_id"]}, {"_id": 0})
            emp["workplace_name"] = workplace["name"] if workplace else "Sin asignar"
    
    return [deserialize_doc(e) for e in employees]

@api_router.post("/admin/employees")
async def create_employee(input: EmployeeCreate):
    # Get workplace name
    workplace = await db.workplaces.find_one({"id": input.workplace_id}, {"_id": 0})
    workplace_name = workplace["name"] if workplace else None
    
    employee = Employee(**input.model_dump(), workplace_name=workplace_name)
    doc = serialize_doc(employee.model_dump())
    await db.employees.insert_one(doc)
    return employee

@api_router.put("/admin/employees/{employee_id}")
async def update_employee(employee_id: str, input: EmployeeUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update workplace name if workplace_id changed
    if "workplace_id" in update_data:
        workplace = await db.workplaces.find_one({"id": update_data["workplace_id"]}, {"_id": 0})
        update_data["workplace_name"] = workplace["name"] if workplace else None
    
    result = await db.employees.update_one(
        {"id": employee_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    employee = await db.employees.find_one({"id": employee_id}, {"_id": 0})
    return deserialize_doc(employee)

@api_router.delete("/admin/employees/{employee_id}")
async def delete_employee(employee_id: str):
    result = await db.employees.delete_one({"id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

# ============ ATTENDANCE ADMIN ROUTES ============

@api_router.get("/admin/attendance")
async def get_all_attendance(
    employee_id: Optional[str] = None,
    date: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    workplace_id: Optional[str] = None
):
    query = {}
    
    if employee_id:
        query["employee_id"] = employee_id
    if date:
        query["date"] = date
    if workplace_id:
        query["workplace_id"] = workplace_id
    if date_from and date_to:
        query["date"] = {"$gte": date_from, "$lte": date_to}
    elif date_from:
        query["date"] = {"$gte": date_from}
    elif date_to:
        query["date"] = {"$lte": date_to}
    
    attendance = await db.attendance.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return [deserialize_doc(a) for a in attendance]

@api_router.put("/admin/attendance/{attendance_id}")
async def update_attendance(attendance_id: str, input: AttendanceUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Recalculate hours if times changed
    if "check_in" in update_data or "check_out" in update_data:
        attendance = await db.attendance.find_one({"id": attendance_id}, {"_id": 0})
        check_in = update_data.get("check_in", attendance.get("check_in"))
        check_out = update_data.get("check_out", attendance.get("check_out"))
        if check_in and check_out:
            update_data["hours_worked"] = calculate_hours(check_in, check_out)
    
    result = await db.attendance.update_one(
        {"id": attendance_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    attendance = await db.attendance.find_one({"id": attendance_id}, {"_id": 0})
    return deserialize_doc(attendance)

@api_router.delete("/admin/attendance/{attendance_id}")
async def delete_attendance(attendance_id: str):
    result = await db.attendance.delete_one({"id": attendance_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return {"message": "Attendance deleted"}

# ============ STATISTICS & REPORTS ============

@api_router.get("/admin/stats/attendance")
async def get_attendance_stats(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """Get attendance statistics"""
    if not date_from:
        date_from = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
    if not date_to:
        date_to = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    query = {"date": {"$gte": date_from, "$lte": date_to}}
    attendance_list = await db.attendance.find(query, {"_id": 0}).to_list(10000)
    
    # Calculate stats
    total_records = len(attendance_list)
    total_hours = sum(a.get("hours_worked", 0) or 0 for a in attendance_list)
    late_count = sum(1 for a in attendance_list if a.get("status") == "late")
    present_count = sum(1 for a in attendance_list if a.get("status") == "present")
    
    # Get unique employees
    employee_ids = list(set(a["employee_id"] for a in attendance_list))
    total_employees = len(employee_ids)
    
    # Calculate by employee
    employee_stats = {}
    for a in attendance_list:
        emp_id = a["employee_id"]
        if emp_id not in employee_stats:
            employee_stats[emp_id] = {
                "employee_id": emp_id,
                "employee_name": a["employee_name"],
                "total_days": 0,
                "total_hours": 0,
                "late_days": 0
            }
        employee_stats[emp_id]["total_days"] += 1
        employee_stats[emp_id]["total_hours"] += a.get("hours_worked", 0) or 0
        if a.get("status") == "late":
            employee_stats[emp_id]["late_days"] += 1
    
    return {
        "date_from": date_from,
        "date_to": date_to,
        "summary": {
            "total_records": total_records,
            "total_hours": round(total_hours, 2),
            "total_employees": total_employees,
            "on_time": present_count,
            "late": late_count
        },
        "by_employee": list(employee_stats.values())
    }

@api_router.get("/admin/reports/attendance/excel")
async def export_attendance_excel(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """Export attendance report to Excel"""
    if not date_from:
        date_from = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
    if not date_to:
        date_to = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    query = {"date": {"$gte": date_from, "$lte": date_to}}
    attendance_list = await db.attendance.find(query, {"_id": 0}).sort("date", -1).to_list(10000)
    
    # Create Excel file in memory
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet("Asistencia")
    
    # Formats
    header_format = workbook.add_format({'bold': True, 'bg_color': '#D4AF37', 'border': 1})
    cell_format = workbook.add_format({'border': 1})
    
    # Headers
    headers = ["Fecha", "Empleado", "Entrada", "Salida", "Horas", "Estado", "Lugar", "Lat Entrada", "Lng Entrada"]
    for col, header in enumerate(headers):
        worksheet.write(0, col, header, header_format)
    
    # Data
    for row, att in enumerate(attendance_list, start=1):
        worksheet.write(row, 0, att.get("date", ""), cell_format)
        worksheet.write(row, 1, att.get("employee_name", ""), cell_format)
        worksheet.write(row, 2, att.get("check_in", ""), cell_format)
        worksheet.write(row, 3, att.get("check_out", ""), cell_format)
        worksheet.write(row, 4, att.get("hours_worked", 0) or 0, cell_format)
        worksheet.write(row, 5, att.get("status", ""), cell_format)
        worksheet.write(row, 6, att.get("workplace_name", ""), cell_format)
        worksheet.write(row, 7, att.get("check_in_lat", ""), cell_format)
        worksheet.write(row, 8, att.get("check_in_lng", ""), cell_format)
    
    # Adjust column widths
    worksheet.set_column(0, 0, 12)
    worksheet.set_column(1, 1, 25)
    worksheet.set_column(2, 3, 10)
    worksheet.set_column(4, 4, 8)
    worksheet.set_column(5, 5, 12)
    worksheet.set_column(6, 6, 20)
    worksheet.set_column(7, 8, 15)
    
    workbook.close()
    output.seek(0)
    
    filename = f"asistencia_{date_from}_a_{date_to}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
