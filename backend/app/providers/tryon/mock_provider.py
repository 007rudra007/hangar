from .base import TryOnProvider
from PIL import Image, ImageDraw, ImageFont
import os

class MockTryOnProvider(TryOnProvider):
    def generate_tryon(self, user_image_path: str, garment_image_path: str, output_path: str, options: dict = None) -> str:
        # Open images
        base_img = Image.open(user_image_path).convert("RGBA")
        garment_img = Image.open(garment_image_path).convert("RGBA")
        
        # Resize garment to be smaller, e.g., 1/3 of base width
        # And place it centrally
        
        base_w, base_h = base_img.size
        
        target_w = int(base_w * 0.4)
        aspect_ratio = garment_img.height / garment_img.width
        target_h = int(target_w * aspect_ratio)
        
        garment_resized = garment_img.resize((target_w, target_h))
        
        # Create composite
        # Paste garment roughly where chest might be (1/4 down)
        paste_x = (base_w - target_w) // 2
        paste_y = int(base_h * 0.25)
        
        combined = base_img.copy()
        combined.paste(garment_resized, (paste_x, paste_y), garment_resized)
        
        # Add watermark
        draw = ImageDraw.Draw(combined)
        text = "VIRTUAL TRY-ON (PREVIEW)"
        # minimal font handling
        try:
            # simple default
            draw.text((10, 10), text, fill=(255, 0, 0, 255))
        except:
            pass
            
        combined.save(output_path)
        return output_path
