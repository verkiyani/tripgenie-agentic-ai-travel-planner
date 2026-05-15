from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TripGenie API",
    description="Backend API for Agentic AI Travel Planning System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "TripGenie API is running successfully",
        "status": "active"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TripGenie Backend"
    }