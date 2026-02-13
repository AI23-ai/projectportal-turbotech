"""
Action Items API endpoints
Track action items from client meetings
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from db.adapters.action_items import ActionItemAdapter
from services.auth import verify_token

router = APIRouter()


class ActionItemCreate(BaseModel):
    """Model for creating action items"""
    title: str
    description: str
    responsible_party: str
    target_date: str
    status: str = "pending"
    priority: str = "medium"
    meeting_id: Optional[int] = None


class ActionItemUpdate(BaseModel):
    """Model for updating action items"""
    title: Optional[str] = None
    description: Optional[str] = None
    responsible_party: Optional[str] = None
    target_date: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
async def get_all_action_items(
    status: Optional[str] = None,
    responsible_party: Optional[str] = None,
    meeting_id: Optional[int] = None,
    token: Dict = Depends(verify_token)
):
    """Get all action items with optional filtering (requires authentication)"""
    adapter = ActionItemAdapter()

    # Filter by specific criteria if provided
    if status:
        action_items = await adapter.get_by_status(status)
    elif responsible_party:
        action_items = await adapter.get_by_responsible_party(responsible_party)
    elif meeting_id:
        action_items = await adapter.get_by_meeting_id(meeting_id)
    else:
        action_items = await adapter.get_all()

    return {
        "action_items": action_items,
        "total": len(action_items)
    }


@router.get("/{action_item_id}")
async def get_action_item(action_item_id: int, token: Dict = Depends(verify_token)):
    """Get specific action item details (requires authentication)"""
    adapter = ActionItemAdapter()
    action_item = await adapter.get_by_id(action_item_id)

    if not action_item:
        raise HTTPException(status_code=404, detail="Action item not found")

    return action_item


@router.post("/")
async def create_action_item(
    action_item: ActionItemCreate,
    token: Dict = Depends(verify_token)
):
    """Create a new action item (requires authentication)"""
    adapter = ActionItemAdapter()

    # Get next ID
    all_items = await adapter.get_all()
    next_id = max([item['id'] for item in all_items], default=0) + 1

    # Create action item
    new_item = {
        'id': next_id,
        'title': action_item.title,
        'description': action_item.description,
        'responsible_party': action_item.responsible_party,
        'target_date': action_item.target_date,
        'status': action_item.status,
        'priority': action_item.priority
    }

    if action_item.meeting_id:
        new_item['meeting_id'] = action_item.meeting_id

    created = await adapter.create(new_item)

    return {
        "id": created['id'],
        "created": True,
        "action_item": created
    }


@router.put("/{action_item_id}")
async def update_action_item(
    action_item_id: int,
    update: ActionItemUpdate,
    token: Dict = Depends(verify_token)
):
    """Update action item (requires authentication)"""
    adapter = ActionItemAdapter()

    # Check if action item exists
    existing = await adapter.get_by_id(action_item_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Action item not found")

    # Build updates dict from non-None fields
    updates = {}
    if update.title is not None:
        updates['title'] = update.title
    if update.description is not None:
        updates['description'] = update.description
    if update.responsible_party is not None:
        updates['responsible_party'] = update.responsible_party
    if update.target_date is not None:
        updates['target_date'] = update.target_date
    if update.status is not None:
        updates['status'] = update.status
    if update.priority is not None:
        updates['priority'] = update.priority
    if update.notes is not None:
        updates['notes'] = update.notes

    updated = await adapter.update(action_item_id, updates)

    return {
        "id": updated['id'],
        "updated": True,
        "action_item": updated
    }


@router.delete("/{action_item_id}")
async def delete_action_item(action_item_id: int, token: Dict = Depends(verify_token)):
    """Delete an action item (requires authentication)"""
    adapter = ActionItemAdapter()

    # Check if action item exists
    existing = await adapter.get_by_id(action_item_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Action item not found")

    success = await adapter.delete(action_item_id)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete action item")

    return {
        "id": action_item_id,
        "deleted": True
    }
