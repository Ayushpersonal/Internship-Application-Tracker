import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.interview import router as interview_router

app = FastAPI(
    title="AI Mock Interview Simulator API",
    description="Backend API for CareerFly's AI Interview Simulator powered by Gemini",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include interview endpoints
app.include_router(interview_router)

# Health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "interview-simulator"}

# Mount React frontend files dynamically from the dist folder
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))

# Guard: Create dist directory if it doesn't exist yet
os.makedirs(frontend_dir, exist_ok=True)

# Mount the static files at the root
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
