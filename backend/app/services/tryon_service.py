from sqlalchemy.orm import Session
from .. import models
from ..providers.tryon.mock_provider import MockTryOnProvider
from ..providers.tryon.api_provider import ApiTryOnProvider
import os
import uuid

# Simple factory/selector
def get_provider():
    # If API config exists, use API, else Mock
    if os.getenv("VTON_API_URL"):
        return ApiTryOnProvider()
    return MockTryOnProvider()

class TryOnService:
    def __init__(self):
        self.provider = get_provider()
        self.output_dir = "media/tryon"
    
    def generate(self, db: Session, user: models.User, base_photo: models.BasePhoto, item: models.Item, options: dict = None) -> models.TryOnImage:
        # Prepare paths
        # Ensure we use system paths (strip leading /media if we stored it that way, or just look at how we stored it)
        # In our implementation we stored /media/... in image_path
        
        user_img_path = base_photo.image_path.lstrip("/")
        item_img_path = item.image_path.lstrip("/")
        
        # Verify existence
        if not os.path.exists(user_img_path):
             raise FileNotFoundError(f"Base photo not found at {user_img_path}")
        if not os.path.exists(item_img_path):
             raise FileNotFoundError(f"Item image not found at {item_img_path}")
             
        # Generate output path
        user_tryon_dir = os.path.join(self.output_dir, str(user.id))
        os.makedirs(user_tryon_dir, exist_ok=True)
        
        filename = f"generated_{uuid.uuid4()}.png"
        output_path = os.path.join(user_tryon_dir, filename)
        
        # Call provider
        self.provider.generate_tryon(user_img_path, item_img_path, output_path, options)
        
        # Save to DB
        relative_path = f"/media/tryon/{user.id}/{filename}"
        
        tryon_record = models.TryOnImage(
            user_id=user.id,
            item_id=item.id,
            base_photo_id=base_photo.id,
            image_path=relative_path
        )
        db.add(tryon_record)
        db.commit()
        db.refresh(tryon_record)
        
        return tryon_record

service = TryOnService()
