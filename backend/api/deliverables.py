"""
Deliverables API endpoints
Track project deliverables by month
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from db.adapters.deliverables import DeliverableAdapter
from services.auth import verify_token

router = APIRouter()


class DeliverableUpdate(BaseModel):
    """Model for updating deliverable status"""
    status: str
    completion_percentage: float
    blockers: List[str] = []
    comments: str = ""


@router.get("/")
async def get_all_deliverables(token: Dict = Depends(verify_token)):
    """Get all deliverables across all months (requires authentication)"""
    adapter = DeliverableAdapter()
    deliverables = await adapter.get_all()

    # Group by phase
    by_month = {
        "month1": [],
        "month2": [],
        "month3": [],
        "month4": []
    }

    for d in deliverables:
        month = d.get('month', 1)
        month_key = f"month{month}"
        if month_key in by_month:
            by_month[month_key].append(d)

    return by_month


@router.get("/month/{month}")
async def get_deliverables_by_month(month: int, token: Dict = Depends(verify_token)):
    """Get deliverables for a specific phase (1-4) - requires authentication"""
    if month not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="Phase must be 1, 2, 3, or 4")

    adapter = DeliverableAdapter()
    deliverables = await adapter.get_by_month(month)

    return {
        "month": month,
        "deliverables": deliverables
    }


@router.get("/{deliverable_id}")
async def get_deliverable(deliverable_id: int, token: Dict = Depends(verify_token)):
    """Get specific deliverable details (requires authentication)"""
    adapter = DeliverableAdapter()
    deliverable = await adapter.get_by_id(deliverable_id)

    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    return deliverable


@router.put("/{deliverable_id}")
async def update_deliverable(
    deliverable_id: int,
    update: DeliverableUpdate,
    token: Dict = Depends(verify_token)
):
    """Update deliverable status and details (requires authentication)"""
    adapter = DeliverableAdapter()

    # Check if deliverable exists
    existing = await adapter.get_by_id(deliverable_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    # Update fields
    updates = {
        'status': update.status,
        'completion_percentage': update.completion_percentage
    }

    updated = await adapter.update(deliverable_id, updates)

    return {
        "id": updated['id'],
        "updated": True,
        "updatedAt": updated.get('updated_at')
    }


@router.post("/{deliverable_id}/evidence")
async def upload_evidence(deliverable_id: int, token: Dict = Depends(verify_token)):
    """Upload evidence for a deliverable (requires authentication)"""
    # TODO: Implement file upload
    return {
        "message": "Evidence upload endpoint - to be implemented",
        "deliverable_id": deliverable_id
    }
