"""
Dashboard API endpoints
Provides project overview, health, and key metrics
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any
from datetime import datetime
from db.database import get_db
from db.models import ProjectPhase, Deliverable, Metric

router = APIRouter()


@router.get("/")
async def get_dashboard(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Get main dashboard data including:
    - Project health
    - Current phase
    - Completion percentage
    - Key metrics
    - Next milestone
    """
    # Get current phase
    result = await db.execute(
        select(ProjectPhase)
        .where(ProjectPhase.status == "IN_PROGRESS")
        .order_by(ProjectPhase.phase_number)
    )
    current_phase = result.scalars().first()

    if not current_phase:
        # Default to first phase if none in progress
        result = await db.execute(
            select(ProjectPhase).order_by(ProjectPhase.phase_number).limit(1)
        )
        current_phase = result.scalars().first()

    # Calculate days remaining
    days_remaining = (current_phase.end_date - datetime.now()).days if current_phase else 0

    # Get next milestone (earliest incomplete deliverable)
    result = await db.execute(
        select(Deliverable)
        .where(Deliverable.status.in_(["NOT_STARTED", "IN_PROGRESS"]))
        .order_by(Deliverable.due_date)
        .limit(1)
    )
    next_milestone = result.scalars().first()

    # Get key metrics
    result = await db.execute(select(Metric))
    all_metrics = result.scalars().all()

    metrics_dict = {}
    for metric in all_metrics:
        metrics_dict[metric.metric_name] = {
            "current": float(metric.value),
            "target": float(metric.target_value) if metric.target_value else 0,
            "unit": metric.unit
        }

    # Calculate overall project health
    completion_pct = float(current_phase.completion_percentage) if current_phase else 0

    if completion_pct < 20 and days_remaining < 10:
        project_health = "AT_RISK"
    elif completion_pct < 10 and days_remaining < 5:
        project_health = "DELAYED"
    else:
        project_health = "ON_TRACK"

    return {
        "projectHealth": project_health,
        "currentPhase": f"MONTH_{current_phase.phase_number}" if current_phase else "MONTH_1",
        "daysRemaining": max(0, days_remaining),
        "completionPercentage": completion_pct,
        "metrics": {
            "drawingParsingAccuracy": metrics_dict.get("Drawing Parsing Accuracy", {}).get("current", 0),
            "timeReductionAchieved": metrics_dict.get("Time Reduction", {}).get("current", 0),
            "estimatorSatisfaction": metrics_dict.get("Estimator Satisfaction", {}).get("current", 0),
            "estimatorEngagement": {
                "activeUsers": 0,
                "feedbackSubmitted": 0,
                "lastActivityTime": None
            }
        },
        "nextMilestone": {
            "name": next_milestone.name if next_milestone else "No upcoming milestones",
            "dueDate": next_milestone.due_date.isoformat() if next_milestone else None,
            "status": next_milestone.status if next_milestone else "NOT_STARTED",
            "blockers": next_milestone.blockers if next_milestone and next_milestone.blockers else []
        },
        "lastUpdated": datetime.utcnow().isoformat()
    }


@router.get("/overview")
async def get_project_overview(db: AsyncSession = Depends(get_db)):
    """Get high-level project overview from SOW"""
    # Get project phases to determine start/end dates
    result = await db.execute(
        select(ProjectPhase).order_by(ProjectPhase.phase_number)
    )
    phases = result.scalars().all()

    start_date = phases[0].start_date if phases else datetime(2025, 10, 14)
    end_date = phases[-1].end_date if phases else datetime(2026, 1, 14)

    return {
        "projectName": "AI-Native Estimation Assistant",
        "client": "Client Company",
        "partner": "Partner Organization",
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "duration": "3 Months",
        "investment": "Per SOW agreement",
        "status": "ACTIVE",
        "team": {
            "partner": ["Technical Lead", "AI Engineer", "Full-Stack Developer", "Project Manager"],
            "client": ["Project Sponsor", "Lead Estimator", "Domain Experts", "Data Support"]
        },
        "successCriteria": [
            "≥80% accuracy in parsing standard drawings",
            "≥25% reduction in time for preliminary estimates",
            "≥90% estimator engagement/satisfaction score",
            "Defined roadmap for full production deployment"
        ]
    }
