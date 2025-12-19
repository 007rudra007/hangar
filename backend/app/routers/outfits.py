from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth
from ..services import recommendation

router = APIRouter(
    tags=["outfits"]
)

@router.get("/outfits", response_model=List[schemas.OutfitResponse])
def get_outfits(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user.outfits

@router.get("/outfits/{outfit_id}", response_model=schemas.OutfitResponse)
def get_outfit(
    outfit_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    outfit = db.query(models.Outfit).filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return outfit

@router.post("/outfits", response_model=schemas.OutfitResponse)
def create_outfit(
    outfit: schemas.OutfitCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify items belong to user
    items = db.query(models.Item).filter(models.Item.id.in_(outfit.item_ids), models.Item.user_id == current_user.id).all()
    if len(items) != len(outfit.item_ids):
        raise HTTPException(status_code=400, detail="One or more items not found or do not belong to user")
    
    db_outfit = models.Outfit(
        user_id=current_user.id,
        name=outfit.name,
        season=outfit.season,
        occasion=outfit.occasion
    )
    db.add(db_outfit)
    db.commit()
    db.refresh(db_outfit)
    
    # Add items
    for item in items:
        outfit_item = models.OutfitItem(outfit_id=db_outfit.id, item_id=item.id)
        db.add(outfit_item)
    
    db.commit()
    db.refresh(db_outfit)
    
    # Auto-set main image if available (simple logic: first item's image)
    if not db_outfit.main_image_path and items:
        # We could generate a composite, but for now just use the first item
        db_outfit.main_image_path = items[0].image_path
        db.commit()
        
    return db_outfit

@router.put("/outfits/{outfit_id}", response_model=schemas.OutfitResponse)
def update_outfit(
    outfit_id: int,
    outfit_update: schemas.OutfitCreate, # Reusing Create schema for simplicity, normally would use distinct Update schema
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_outfit = db.query(models.Outfit).filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id).first()
    if not db_outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
        
    # Update fields
    db_outfit.name = outfit_update.name
    db_outfit.season = outfit_update.season
    db_outfit.occasion = outfit_update.occasion
    
    # Update items
    # First remove existing
    db.query(models.OutfitItem).filter(models.OutfitItem.outfit_id == db_outfit.id).delete()
    
    # Add new
    items = db.query(models.Item).filter(models.Item.id.in_(outfit_update.item_ids), models.Item.user_id == current_user.id).all()
    if len(items) != len(outfit_update.item_ids):
        raise HTTPException(status_code=400, detail="One or more items not found or do not belong to user")

    for item in items:
        outfit_item = models.OutfitItem(outfit_id=db_outfit.id, item_id=item.id)
        db.add(outfit_item)
        
    db.commit()
    db.refresh(db_outfit)
    return db_outfit

@router.delete("/outfits/{outfit_id}")
def delete_outfit(
    outfit_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    outfit = db.query(models.Outfit).filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    db.delete(outfit)
    db.commit()
    return {"message": "Outfit deleted"}

@router.get("/recommend-outfit")
def recommend_outfit(
    occasion: str,
    temperature: Optional[float] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return recommendation.recommend(db, current_user, occasion, temperature)
