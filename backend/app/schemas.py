from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User ---
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# --- Base Photo ---
class BasePhotoResponse(BaseModel):
    id: int
    image_path: str
    created_at: datetime
    
    class Config:
        orm_mode = True

# --- Item ---
class ItemBase(BaseModel):
    category: str
    color: str
    season: str
    occasion: str
    notes: Optional[str] = None

class ItemCreate(ItemBase):
    # Image is handled via UploadFile
    pass

class ItemResponse(ItemBase):
    id: int
    image_path: str
    created_at: datetime
    
    class Config:
        orm_mode = True

# --- Outfit ---
class OutfitItemResponse(BaseModel):
    item: ItemResponse
    
    class Config:
        orm_mode = True

class OutfitBase(BaseModel):
    name: str
    season: Optional[str] = None
    occasion: Optional[str] = None

class OutfitCreate(OutfitBase):
    item_ids: List[int]

class OutfitResponse(OutfitBase):
    id: int
    main_image_path: Optional[str] = None
    items: List[OutfitItemResponse]
    created_at: datetime
    
    # Custom validator or method can be used to flatten the item list if needed,
    # but for now we'll match the detailed structure or flatten in router
    
    class Config:
        orm_mode = True

# --- TryOn ---
class TryOnRequest(BaseModel):
    base_photo_id: int
    item_id: int
    options: Optional[dict] = {}

class TryOnResponse(BaseModel):
    id: int
    image_path: str
    item_id: int
    base_photo_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
