from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/base-photos",
    tags=["base-photos"]
)

MEDIA_ROOT = "media/base_photos"

@router.get("/", response_model=List[schemas.BasePhotoResponse])
def get_base_photos(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user.base_photos

@router.post("/", response_model=schemas.BasePhotoResponse)
async def upload_base_photo(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Create user directory
    user_dir = os.path.join(MEDIA_ROOT, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(user_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create DB record
    # Store relative path for URL access
    relative_path = f"/media/base_photos/{current_user.id}/{filename}"
    
    db_photo = models.BasePhoto(
        user_id=current_user.id,
        image_path=relative_path
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

@router.delete("/{photo_id}")
def delete_base_photo(
    photo_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    photo = db.query(models.BasePhoto).filter(models.BasePhoto.id == photo_id, models.BasePhoto.user_id == current_user.id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Remove file
    # Convert URL path back to system path
    # relative_path is like /media/base_photos/1/abc.jpg
    # we need media/base_photos/1/abc.jpg (without leading slash if present, but usually os.path.join handles it)
    
    system_path = photo.image_path.lstrip("/")
    if os.path.exists(system_path):
        os.remove(system_path)
        
    db.delete(photo)
    db.commit()
    return {"message": "Photo deleted"}
