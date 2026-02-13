"""
Metrics API endpoints
Track and retrieve project metrics
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from db.adapters.metrics import MetricAdapter
from services.auth import verify_token

router = APIRouter()


class MetricRecord(BaseModel):
    """Model for recording a new metric"""
    metric_id: int
    value: float
    notes: str = ""


@router.get("/")
async def get_all_metrics(token: Dict = Depends(verify_token)):
    """Get all current metrics (requires authentication)"""
    adapter = MetricAdapter()
    metrics = await adapter.get_all()

    # Format metrics for frontend (convert to dict by camelCase name)
    metrics_dict = {}
    for metric in metrics:
        name = metric.get('name', '')
        key = name.replace(" ", "").replace("-", "")
        key = key[0].lower() + key[1:] if key else str(metric['id'])  # camelCase

        metrics_dict[key] = {
            "id": metric['id'],
            "name": metric.get('name'),
            "current": metric.get('current', 0),
            "target": metric.get('target', 0),
            "unit": metric.get('unit', ''),
            "description": metric.get('notes', ''),
            "updated_at": metric.get('updated_at')
        }

    return metrics_dict


@router.get("/history/{metric_name}")
async def get_metric_history(metric_name: str, token: Dict = Depends(verify_token)):
    """Get historical data for a specific metric (requires authentication)"""
    # TODO: Implement time-series tracking in DynamoDB
    return {
        "metric": metric_name,
        "data": [],
        "timeline": []
    }


@router.post("/{metric_id}")
async def update_metric(metric_id: int, metric: MetricRecord, token: Dict = Depends(verify_token)):
    """Update a metric value (requires authentication)"""
    adapter = MetricAdapter()

    # Check if metric exists
    existing = await adapter.get_by_id(metric_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Metric ID {metric_id} not found")

    # Update the metric value
    updates = {
        'current': metric.value
    }
    if metric.notes:
        updates['notes'] = metric.notes

    updated = await adapter.update(metric_id, updates)

    return {
        "recorded": True,
        "metric_id": updated['id'],
        "value": updated.get('current'),
        "timestamp": updated.get('updated_at')
    }


@router.get("/learning")
async def get_learning_metrics(token: Dict = Depends(verify_token)):
    """Get AI learning and performance metrics (requires authentication)"""
    # TODO: Fetch from database
    return {
        "dataProvided": {
            "projectsReceived": 0,
            "drawingsProcessed": 0,
            "estimatesAnalyzed": 0,
            "feedbackCaptured": 0
        },
        "modelPerformance": {
            "parsingAccuracy": [],
            "takeoffAccuracy": [],
            "processingSpeed": [],
            "confidenceScore": []
        },
        "estimatorActivity": {}
    }
