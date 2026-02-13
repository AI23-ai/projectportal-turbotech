"""
Communication/Updates API endpoints
Post and retrieve project updates
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict
from pydantic import BaseModel
from db.adapters.updates import UpdateAdapter
from services.auth import verify_token

router = APIRouter()


class UpdateCreate(BaseModel):
    """Model for creating a new update"""
    type: str  # MILESTONE, BLOCKER, SUCCESS, GENERAL
    title: str
    content: str
    priority: str = "NORMAL"  # HIGH, NORMAL, FYI
    author_email: str  # Email of the user creating the update


@router.get("/")
async def get_updates(type_filter: Optional[str] = None, token: Dict = Depends(verify_token)):
    """Get all project updates (most recent first)"""
    adapter = UpdateAdapter()
    updates = await adapter.get_all(update_type=type_filter)

    return {
        "updates": updates,
        "total": len(updates)
    }


@router.post("/")
async def create_update(update: UpdateCreate, token: Dict = Depends(verify_token)):
    """Post a new project update"""
    adapter = UpdateAdapter()

    # Get next ID
    all_updates = await adapter.get_all()
    next_id = max([u.get('id', 0) for u in all_updates], default=0) + 1

    # Create new update
    new_update = {
        "id": next_id,
        "type": update.type,
        "title": update.title,
        "content": update.content,
        "author_email": update.author_email,
        "author": update.author_email.split('@')[0],  # Simple author from email
        "priority": update.priority,
        "acknowledgements": []
    }

    result = await adapter.create(new_update)

    return {
        "id": result['id'],
        "created": True,
        "timestamp": result.get('created_at')
    }


@router.post("/{update_id}/acknowledge")
async def acknowledge_update(update_id: int, user_email: str, token: Dict = Depends(verify_token)):
    """Acknowledge an update (mark as read)"""
    adapter = UpdateAdapter()

    # Get the update
    update = await adapter.get_by_id(update_id)
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")

    # Get user name from email
    user_name = user_email.split('@')[0]

    # Check if already acknowledged
    acknowledgements = update.get('acknowledgements', [])
    if user_name in acknowledgements:
        return {
            "update_id": update_id,
            "acknowledged": True,
            "message": "Already acknowledged"
        }

    # Add acknowledgement
    acknowledgements.append(user_name)

    # Update the update with new acknowledgements
    from boto3.dynamodb.conditions import Attr
    import boto3
    import os

    dynamodb = boto3.resource('dynamodb')
    table_name = os.environ.get('UPDATES_TABLE', 'turbotech-dev-updates')
    table = dynamodb.Table(table_name)

    table.update_item(
        Key={'id': update_id},
        UpdateExpression="SET acknowledgements = :acks",
        ExpressionAttributeValues={
            ':acks': acknowledgements
        }
    )

    return {
        "update_id": update_id,
        "acknowledged": True,
        "user": user_name
    }
