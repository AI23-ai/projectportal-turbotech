"""
Jerry AI Status and Capabilities API endpoints
Provides information about Jerry's current status, capabilities, and software foundation
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/")
async def get_jerry_status():
    """Get Jerry's current status, capabilities, and infrastructure"""

    # Jerry's capabilities
    capabilities = [
        {
            "name": "Eyes (Vision)",
            "status": "live",
            "description": "See and understand electrical drawings",
            "details": [
                "Symbol detection pipeline with 99.1% accuracy",
                "124 electrical symbol types recognized",
                "Vector PDF extraction with PyMuPDF",
                "Legend parsing (E-001 sheets)",
                "Pattern-based matching with confidence scores"
            ],
            "achievement": "Started at 75%, now at 99.1% accuracy"
        },
        {
            "name": "Voice (Communication)",
            "status": "live",
            "description": "Speak responses with natural voice",
            "details": [
                "ChatterBox TTS on dedicated GPU",
                "Jerry voice profile: professional, clear, helpful",
                "24kHz sample rate for quality audio",
                "15 cached acknowledgment phrases",
                "Sub-second response for common phrases"
            ],
            "achievement": "Natural-sounding voice responses"
        },
        {
            "name": "Ears (Listening)",
            "status": "live",
            "description": "Listen to voice commands",
            "details": [
                "Desktop push-to-talk with CapsLock",
                "Local Whisper transcription (~2.8s)",
                "Private - audio never leaves workstation",
                "Natural language understanding",
                "Context-aware command processing"
            ],
            "achievement": "Fast, private speech recognition"
        },
        {
            "name": "Memory (Knowledge)",
            "status": "live",
            "description": "Remember every estimate and project",
            "details": [
                "28 real estimates totaling $71.9M",
                "ChromaDB vector store for semantic search",
                "Project fuzzy matching",
                "Historical pricing patterns",
                "Estimator-specific insights"
            ],
            "achievement": "Instant recall of any past project"
        },
        {
            "name": "Hands (Actions)",
            "status": "live",
            "description": "Take actions on workstation",
            "details": [
                "Open folders in Windows Explorer",
                "Create new project directories",
                "Open files and URLs",
                "Windows notifications",
                "File organization"
            ],
            "achievement": "Direct workstation integration"
        },
        {
            "name": "Learning (Growth)",
            "status": "ready",
            "description": "Learn from every interaction",
            "details": [
                "Correction capture and feedback loop",
                "SFT training infrastructure ready",
                "DPO preference learning ready",
                "Tiered adapter system (Industry/Company/User)",
                "8x V100 GPU cluster for training"
            ],
            "achievement": "Entering training phase January 2026"
        }
    ]

    # Software repositories
    repositories = [
        {
            "name": "portal-platform-frontend",
            "description": "React web application (Next.js 15)",
            "status": "production",
            "lastUpdated": "2026-01-11"
        },
        {
            "name": "portal-platform-backend",
            "description": "FastAPI backend services",
            "status": "production",
            "lastUpdated": "2026-01-11"
        },
        {
            "name": "portal-jerry-assistant",
            "description": "Jerry's brain (RAG, Ollama)",
            "status": "production",
            "lastUpdated": "2026-01-11"
        },
        {
            "name": "portal-jerry-tools",
            "description": "Vision + TTS services",
            "status": "production",
            "lastUpdated": "2026-01-11"
        },
        {
            "name": "portal-jerry-training",
            "description": "ML training (SFT/DPO/LoRA)",
            "status": "ready",
            "lastUpdated": "2026-01-08"
        },
        {
            "name": "portal-jerry-estimator",
            "description": "Excel workbook parser",
            "status": "ready",
            "lastUpdated": "2026-01-08"
        },
        {
            "name": "portal-desktop-agent",
            "description": "Windows voice assistant",
            "status": "production",
            "lastUpdated": "2026-01-08"
        },
        {
            "name": "portal-docs",
            "description": "Documentation & PRDs",
            "status": "active",
            "lastUpdated": "2026-01-08"
        },
        {
            "name": "portal-platform",
            "description": "Platform architecture",
            "status": "foundation",
            "lastUpdated": "2025-12-15"
        },
        {
            "name": "portal-projectportal",
            "description": "Project management portal",
            "status": "production",
            "lastUpdated": "2025-12-02"
        }
    ]

    # Infrastructure status
    infrastructure = {
        "frontend": {
            "url": "https://your-frontend-domain.example.com",
            "status": "live"
        },
        "backend": {
            "url": "https://your-api-domain.example.com",
            "status": "live"
        },
        "jerryAssistant": {
            "port": 8001,
            "status": "live"
        },
        "ttsVoice": {
            "port": 8002,
            "status": "live"
        },
        "symbolDetection": {
            "accuracy": "99.1%",
            "status": "live"
        }
    }

    # Key metrics
    metrics = {
        "symbolAccuracy": 99.1,
        "estimatesLoaded": 28,
        "totalBidValue": 71900000,
        "symbolTypes": 124,
        "timeSavingsPerWeek": 24.5,
        "annualValue": 63000
    }

    # Current phase
    phase = {
        "current": "Training Phase",
        "status": "Starting",
        "startDate": "2026-01-13",
        "description": "Foundation complete. Now training Jerry on domain-specific estimation.",
        "nextMilestones": [
            "Conduit run calculations",
            "Email triage automation",
            "Domain pricing methods training"
        ]
    }

    return {
        "name": "Jerry",
        "tagline": "Your AI Apprentice",
        "lastUpdated": datetime.now().isoformat(),
        "capabilities": capabilities,
        "repositories": repositories,
        "infrastructure": infrastructure,
        "metrics": metrics,
        "phase": phase
    }


@router.get("/metrics")
async def get_jerry_metrics():
    """Get Jerry's key performance metrics"""
    return {
        "symbolDetection": {
            "accuracy": 99.1,
            "symbolTypes": 124,
            "startAccuracy": 75,
            "improvement": "24.1%"
        },
        "knowledge": {
            "estimatesLoaded": 28,
            "totalBidValue": 71900000,
            "projectsCovered": 28
        },
        "projectedImpact": {
            "timeSavingsPerWeek": 24.5,
            "annualValue": 63000,
            "breakdown": {
                "symbolCounting": 13,
                "emailTriage": 7,
                "informationRetrieval": 4.5
            }
        },
        "demo": {
            "date": "2026-01-13",
            "status": "Completed",
            "attendees": ["Project Sponsor", "Lead Estimator"]
        }
    }


@router.get("/roadmap")
async def get_jerry_roadmap():
    """Get Jerry's learning roadmap"""
    return {
        "now": {
            "status": "Complete",
            "capabilities": [
                "See drawings at 99.1% accuracy",
                "Remember 28 estimates ($71.9M)",
                "Talk to team via voice",
                "Take actions on workstation"
            ]
        },
        "next": {
            "status": "In Progress",
            "target": "Q1 2026",
            "capabilities": [
                "Calculate conduit runs",
                "Compare bid vs construction sets",
                "Learn domain pricing methods",
                "Email triage automation"
            ]
        },
        "future": {
            "status": "Planned",
            "target": "Q2-Q4 2026",
            "capabilities": [
                "Predict project profitability",
                "Flag risky bids",
                "Draft proposals",
                "Full estimation assistance"
            ]
        }
    }
