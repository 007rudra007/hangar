from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, items, outfits, tryon, base_photos
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OpenWardrobeTryOn")

# CORS
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create media directories
os.makedirs("media/items", exist_ok=True)
os.makedirs("media/base_photos", exist_ok=True)
os.makedirs("media/tryon", exist_ok=True)

# Mount media
app.mount("/media", StaticFiles(directory="media"), name="media")

# Include Routers
app.include_router(auth.router)
app.include_router(items.router) 
app.include_router(outfits.router)
app.include_router(tryon.router)
app.include_router(base_photos.router)

# Mount Frontend Static Files (built via 'npm run build')
# We assume the user has built the frontend into ../frontend/dist
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    # You might also need to mount other static assets if they exist at root of dist, e.g. pwa icons
    # A cleaner way for SPA is to just generic static files mount on root, but with order.
    # However, let's keep it simple: Mount specific folders or use a fallback.
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static_frontend")
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to OpenWardrobeTryOn API. To see the App, build the frontend and restart."}
