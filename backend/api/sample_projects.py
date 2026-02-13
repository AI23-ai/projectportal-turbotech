"""
Sample Projects API endpoints
Retrieve training dataset projects and statistics
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict
from db.adapters.sample_projects import SampleProjectAdapter
from services.auth import verify_token

router = APIRouter()


@router.get("/")
async def get_all_projects(
    delivery_method: Optional[str] = None,
    token: Dict = Depends(verify_token)
):
    """
    Get all sample projects (requires authentication)
    Optionally filter by delivery_method: DATA, DESIGN_BUILD, PLAN_SPEC_BID
    """
    adapter = SampleProjectAdapter()
    projects = await adapter.get_all(delivery_method=delivery_method)

    return {
        "projects": projects,
        "total": len(projects)
    }


@router.get("/stats")
async def get_statistics(token: Dict = Depends(verify_token)):
    """Get aggregate statistics across all sample projects (requires authentication)"""
    adapter = SampleProjectAdapter()
    stats = await adapter.get_stats()

    return stats


@router.get("/{project_id}")
async def get_project(project_id: int, token: Dict = Depends(verify_token)):
    """Get a specific sample project by ID (requires authentication)"""
    adapter = SampleProjectAdapter()
    project = await adapter.get_by_id(project_id)

    if not project:
        raise HTTPException(status_code=404, detail=f"Project ID {project_id} not found")

    return project
