from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
    base_photos = relationship("BasePhoto", back_populates="user", cascade="all, delete-orphan")
    outfits = relationship("Outfit", back_populates="user", cascade="all, delete-orphan")
    tryon_images = relationship("TryOnImage", back_populates="user", cascade="all, delete-orphan")

class BasePhoto(Base):
    __tablename__ = "base_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="base_photos")
    tryon_images = relationship("TryOnImage", back_populates="base_photo")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String, nullable=False)
    category = Column(String, nullable=False)
    color = Column(String, nullable=False)
    season = Column(String, nullable=False)
    occasion = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="items")
    outfits = relationship("OutfitItem", back_populates="item", cascade="all, delete-orphan")
    tryon_images = relationship("TryOnImage", back_populates="item")

class Outfit(Base):
    __tablename__ = "outfits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    season = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    main_image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="outfits")
    items = relationship("OutfitItem", back_populates="outfit", cascade="all, delete-orphan")

class OutfitItem(Base):
    __tablename__ = "outfit_items"
    
    id = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    
    outfit = relationship("Outfit", back_populates="items")
    item = relationship("Item", back_populates="outfits")

class TryOnImage(Base):
    __tablename__ = "tryon_images"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    base_photo_id = Column(Integer, ForeignKey("base_photos.id"), nullable=False)
    image_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="tryon_images")
    item = relationship("Item", back_populates="tryon_images")
    base_photo = relationship("BasePhoto", back_populates="tryon_images")
