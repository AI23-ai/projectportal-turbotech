"""
Meetings API endpoints
Track client meetings and summaries
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from db.adapters.meetings import MeetingAdapter
from services.auth import verify_token

router = APIRouter()


class MeetingCreate(BaseModel):
    """Model for creating meetings"""
    title: str
    meeting_date: str
    attendees: List[str]
    summary: str
    topics: List[str]
    action_item_ids: Optional[List[int]] = []


class MeetingUpdate(BaseModel):
    """Model for updating meetings"""
    title: Optional[str] = None
    meeting_date: Optional[str] = None
    attendees: Optional[List[str]] = None
    summary: Optional[str] = None
    topics: Optional[List[str]] = None
    action_item_ids: Optional[List[int]] = None
    notes: Optional[str] = None


@router.get("/")
async def get_all_meetings(
    meeting_date: Optional[str] = None,
    token: Dict = Depends(verify_token)
):
    """Get all meetings with optional date filtering (requires authentication)"""
    adapter = MeetingAdapter()

    if meeting_date:
        meetings = await adapter.get_by_date(meeting_date)
    else:
        meetings = await adapter.get_all()

    return {
        "meetings": meetings,
        "total": len(meetings)
    }


@router.get("/{meeting_id}")
async def get_meeting(meeting_id: int, token: Dict = Depends(verify_token)):
    """Get specific meeting details (requires authentication)"""
    adapter = MeetingAdapter()
    meeting = await adapter.get_by_id(meeting_id)

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return meeting


@router.post("/")
async def create_meeting(
    meeting: MeetingCreate,
    token: Dict = Depends(verify_token)
):
    """Create a new meeting (requires authentication)"""
    adapter = MeetingAdapter()

    # Get next ID
    all_meetings = await adapter.get_all()
    next_id = max([m['id'] for m in all_meetings], default=0) + 1

    # Create meeting
    new_meeting = {
        'id': next_id,
        'title': meeting.title,
        'meeting_date': meeting.meeting_date,
        'attendees': meeting.attendees,
        'summary': meeting.summary,
        'topics': meeting.topics,
        'action_item_ids': meeting.action_item_ids or []
    }

    created = await adapter.create(new_meeting)

    return {
        "id": created['id'],
        "created": True,
        "meeting": created
    }


@router.put("/{meeting_id}")
async def update_meeting(
    meeting_id: int,
    update: MeetingUpdate,
    token: Dict = Depends(verify_token)
):
    """Update meeting (requires authentication)"""
    adapter = MeetingAdapter()

    # Check if meeting exists
    existing = await adapter.get_by_id(meeting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Build updates dict from non-None fields
    updates = {}
    if update.title is not None:
        updates['title'] = update.title
    if update.meeting_date is not None:
        updates['meeting_date'] = update.meeting_date
    if update.attendees is not None:
        updates['attendees'] = update.attendees
    if update.summary is not None:
        updates['summary'] = update.summary
    if update.topics is not None:
        updates['topics'] = update.topics
    if update.action_item_ids is not None:
        updates['action_item_ids'] = update.action_item_ids
    if update.notes is not None:
        updates['notes'] = update.notes

    updated = await adapter.update(meeting_id, updates)

    return {
        "id": updated['id'],
        "updated": True,
        "meeting": updated
    }


@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: int, token: Dict = Depends(verify_token)):
    """Delete a meeting (requires authentication)"""
    adapter = MeetingAdapter()

    # Check if meeting exists
    existing = await adapter.get_by_id(meeting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Meeting not found")

    success = await adapter.delete(meeting_id)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete meeting")

    return {
        "id": meeting_id,
        "deleted": True
    }
