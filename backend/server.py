from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse
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
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Google OAuth config
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

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

# ============ GOOGLE AUTH ============
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
