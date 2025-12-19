from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/items",
    tags=["items"]
)

MEDIA_ROOT = "media/items"

@router.get("/", response_model=List[schemas.ItemResponse])
def get_items(
    category: Optional[str] = None,
    color: Optional[str] = None,
    season: Optional[str] = None,
    occasion: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Item).filter(models.Item.user_id == current_user.id)
    
    if category:
        query = query.filter(models.Item.category == category)
    if color:
        query = query.filter(models.Item.color == color)
    if season:
        query = query.filter(models.Item.season == season)
    if occasion:
        query = query.filter(models.Item.occasion == occasion)
    if search:
        # Simple search in category or notes
        query = query.filter(
            (models.Item.category.contains(search)) | 
            (models.Item.notes.contains(search))
        )
        
    return query.all()

@router.get("/{item_id}", response_model=schemas.ItemResponse)
def get_item(
    item_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item = db.query(models.Item).filter(models.Item.id == item_id, models.Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/", response_model=schemas.ItemResponse)
async def create_item(
    category: str = Form(...),
    color: str = Form(...),
    season: str = Form(...),
    occasion: str = Form(...),
    notes: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Save Image
    user_dir = os.path.join(MEDIA_ROOT, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    
    file_extension = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(user_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    relative_path = f"/media/items/{current_user.id}/{filename}"
    
    db_item = models.Item(
        user_id=current_user.id,
        category=category,
        color=color,
        season=season,
        occasion=occasion,
        notes=notes,
        image_path=relative_path
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item = db.query(models.Item).filter(models.Item.id == item_id, models.Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    system_path = item.image_path.lstrip("/")
    if os.path.exists(system_path):
        os.remove(system_path)
        
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

@router.put("/{item_id}", response_model=schemas.ItemResponse)
def update_item(
    item_id: int,
    category: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    occasion: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Note: This simple update doesn't handle image re-upload for now to keep it simple,
    # or we can add it as optional File
    item = db.query(models.Item).filter(models.Item.id == item_id, models.Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if category: item.category = category
    if color: item.color = color
    if season: item.season = season
    if occasion: item.occasion = occasion
    if notes is not None: item.notes = notes
    
    db.commit()
    db.refresh(item)
    return item
