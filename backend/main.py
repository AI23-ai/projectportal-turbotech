"""
Project Portal - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from api import health, deliverables, metrics, updates, sample_projects, action_items, meetings, jerry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Project Portal API",
    description="Real-time project tracking and transparency portal",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Local dev on port 3001 (avoid VSCode forwarding conflicts)
    "http://127.0.0.1:3001",
]

# Add additional CORS origin from environment (e.g., staging App Runner URL)
extra_cors_origin = os.environ.get("CORS_ORIGIN")
if extra_cors_origin and extra_cors_origin != "*":
    cors_origins.append(extra_cors_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if extra_cors_origin == "*" else cors_origins,
    allow_credentials=extra_cors_origin != "*",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(deliverables.router, prefix="/api/deliverables", tags=["Deliverables"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(updates.router, prefix="/api/updates", tags=["Updates"])
app.include_router(sample_projects.router, prefix="/api/sample-projects", tags=["Sample Projects"])
app.include_router(action_items.router, prefix="/api/action-items", tags=["Action Items"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
app.include_router(jerry.router, prefix="/api/jerry", tags=["Jerry AI"])


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Portal API starting up...")
    logger.info("API Documentation: /docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Portal API shutting down...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Project Portal API",
        "version": "1.0.0",
        "docs": "/docs"
    }
