from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth
from ..services.tryon_service import service as tryon_service

router = APIRouter(
    prefix="/tryon",
    tags=["tryon"]
)

@router.post("/", response_model=schemas.TryOnResponse)
def create_tryon(
    request: schemas.TryOnRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Validate Base Photo
    base_photo = db.query(models.BasePhoto).filter(models.BasePhoto.id == request.base_photo_id, models.BasePhoto.user_id == current_user.id).first()
    if not base_photo:
        raise HTTPException(status_code=404, detail="Base photo not found")
        
    # Validate Item
    item = db.query(models.Item).filter(models.Item.id == request.item_id, models.Item.user_id == current_user.id).first()
    if not item:
         raise HTTPException(status_code=404, detail="Item not found")
    
    try:
        result = tryon_service.generate(db, current_user, base_photo, item, request.options)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.TryOnResponse])
def get_tryons(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user.tryon_images
