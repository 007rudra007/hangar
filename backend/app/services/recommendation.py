from sqlalchemy.orm import Session
from .. import models
import random
from fastapi import HTTPException

def recommend(db: Session, user: models.User, occasion: str, temperature: float = None):
    # Fetch user items
    all_items = user.items
    
    # Filter by occasion (approximate)
    # Simple logic: if occasion matches or if item occasion is 'Any' (not implemented but implied flexibility)
    # Here we stick to stricter matching + fallback
    
    candidates = [i for i in all_items if i.occasion.lower() == occasion.lower()]
    
    # Fallback: if very few candidates, include 'Casual' ones for other occasions if appropriate
    if len(candidates) < 2 and occasion.lower() != 'formal':
         candidates.extend([i for i in all_items if i.occasion.lower() == 'casual'])
         
    # Temperature filtering
    # Hot > 28: Avoid finding 'Jacket', 'Hoodie', 'Coat'
    # Cold < 18: Prefer 'Jacket', 'Hoodie', 'Sweater'
    
    weather_advice = ""
    is_hot = temperature is not None and temperature > 28
    is_cold = temperature is not None and temperature < 18
    
    if is_hot:
        candidates = [i for i in candidates if i.category.lower() not in ['jacket', 'hoodie', 'coat', 'sweater', 'sweatshirt']]
        weather_advice = "It's hot! Avoiding heavy layers."
    
    start_candidates = list(candidates) # Snapshot for top/bottom separation
    
    # Select Top
    tops = [i for i in start_candidates if i.category.lower() in ['t-shirt', 'shirt', 'blouse', 'top', 'polo', 'sweater', 'hoodie', 'jacket']]
    # Select Bottom
    bottoms = [i for i in start_candidates if i.category.lower() in ['pants', 'jeans', 'trousers', 'shorts', 'skirt']]
    # Select Shoes
    shoes = [i for i in start_candidates if i.category.lower() in ['shoes', 'sneakers', 'boots', 'sandals', 'heels']]
    
    if not tops or not bottoms:
        raise HTTPException(status_code=400, detail=f"Not enough items to make an outfit for {occasion}. Need at least 1 top and 1 bottom found.")

    # Logic: Pick 1 random top, 1 random bottom
    # If cold, ensure top is warm or add layer
    
    selected_top = random.choice(tops)
    selected_bottom = random.choice(bottoms)
    selected_shoes = random.choice(shoes) if shoes else None
    
    # Layering for cold
    layer = None
    if is_cold:
        # If selected top is light, try to find a jacket/hoodie
        if selected_top.category.lower() in ['t-shirt', 'shirt', 'blouse', 'top']:
            layers = [i for i in all_items if i.category.lower() in ['jacket', 'hoodie', 'coat', 'cardigan']]
            if layers:
                layer = random.choice(layers)
                weather_advice += " Added a layer for warmth."
    
    items = [selected_top, selected_bottom]
    if selected_shoes:
        items.append(selected_shoes)
    if layer:
        items.append(layer)
        
    return {
        "items": items,
        "occasion": occasion,
        "notes": f"Generated for {occasion}. {weather_advice}".strip()
    }
