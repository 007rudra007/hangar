# OpenWardrobeTryOn

A fully working "smart wardrobe + virtual try-on" app.
Local-first, privacy-focused, and open source.

## Features

- **Digital Wardrobe**: Archive your clothes with metadata (Category, Season, Color).
- **Outfit Planner**: Create outfits or get AI-rule-based recommendations.
- **Virtual Try-On**: Visualize how clothes look on your own base photos.

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLite.
- **Frontend**: React, TypeScript, Tailwind CSS, Vite.
- **Architecture**: Monorepo.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. Activate venv:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `cp .env.example .env` (Edit `.env` if needed)
6. `python -m app.main` or `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env`
4. `npm run dev`

## Media
Images are stored in `backend/media`.

## License
MIT
