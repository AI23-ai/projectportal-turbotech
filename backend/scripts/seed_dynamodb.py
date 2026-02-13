"""
Seed DynamoDB tables with sample project data.
Run this after deploying the SAM stack to populate initial deliverables and metrics.

Usage:
    python scripts/seed_dynamodb.py --env dev
    python scripts/seed_dynamodb.py --env dev --deliverables-only
"""
import boto3
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal


def seed_deliverables(table_name, region='us-east-2'):
    """Seed deliverables table with sample project deliverables."""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)

    now = datetime.now(timezone.utc)
    deliverables = [
        {
            "id": 1,
            "phase_id": 1,
            "month": 1,
            "name": "Project Setup & Configuration",
            "description": "Initialize project infrastructure, CI/CD pipelines, and development environments",
            "owner": "Engineering",
            "status": "COMPLETED",
            "completion_percentage": 100,
            "due_date": (now - timedelta(days=30)).isoformat(),
            "evidence": ["Repository created", "CI/CD pipeline configured", "Dev environment running"],
            "comments": "All infrastructure provisioned and tested.",
        },
        {
            "id": 2,
            "phase_id": 1,
            "month": 1,
            "name": "Requirements Documentation",
            "description": "Gather and document functional and non-functional requirements",
            "owner": "Product",
            "status": "COMPLETED",
            "completion_percentage": 100,
            "due_date": (now - timedelta(days=21)).isoformat(),
            "evidence": ["PRD finalized", "User stories written", "Acceptance criteria defined"],
            "comments": "Requirements signed off by all stakeholders.",
        },
        {
            "id": 3,
            "phase_id": 2,
            "month": 2,
            "name": "MVP Development",
            "description": "Build core features for the minimum viable product release",
            "owner": "Engineering",
            "status": "IN_PROGRESS",
            "completion_percentage": 65,
            "due_date": (now + timedelta(days=14)).isoformat(),
            "evidence": ["Authentication working", "Dashboard implemented", "API endpoints live"],
            "comments": "On track for MVP deadline. Core features functional.",
        },
        {
            "id": 4,
            "phase_id": 2,
            "month": 2,
            "name": "Testing & QA",
            "description": "Comprehensive testing including unit, integration, and end-to-end tests",
            "owner": "QA",
            "status": "IN_PROGRESS",
            "completion_percentage": 40,
            "due_date": (now + timedelta(days=21)).isoformat(),
            "evidence": ["Unit tests at 80% coverage", "Integration test suite started"],
            "comments": "Running in parallel with MVP development.",
        },
        {
            "id": 5,
            "phase_id": 3,
            "month": 3,
            "name": "Deployment & Launch",
            "description": "Production deployment, monitoring setup, and go-live activities",
            "owner": "Engineering",
            "status": "NOT_STARTED",
            "completion_percentage": 0,
            "due_date": (now + timedelta(days=45)).isoformat(),
            "evidence": [],
            "comments": "Scheduled after QA sign-off.",
        },
    ]

    print(f"Seeding {len(deliverables)} deliverables to {table_name}...")
    for deliverable in deliverables:
        deliverable['created_at'] = now.isoformat()
        deliverable['updated_at'] = now.isoformat()
        table.put_item(Item=deliverable)
        print(f"  - Added: {deliverable['name']}")
    print(f"Done: {len(deliverables)} deliverables seeded.\n")


def seed_metrics(table_name, region='us-east-2'):
    """Seed metrics table with sample success metrics."""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)

    now = datetime.now(timezone.utc)
    metrics = [
        {
            "id": 0,
            "name": "Overall Completion",
            "description": "Percentage of total project deliverables completed",
            "current": Decimal('45'),
            "target": Decimal('100'),
            "unit": "%",
            "trend": "up",
            "last_updated": now.strftime("%B %d, %Y"),
            "notes": "2 of 5 deliverables completed, 2 in progress.",
        },
        {
            "id": 1,
            "name": "Tasks Completed",
            "description": "Number of tasks completed across all workstreams",
            "current": Decimal('34'),
            "target": Decimal('80'),
            "unit": "tasks",
            "trend": "up",
            "last_updated": now.strftime("%B %d, %Y"),
            "notes": "Tracking all JIRA tickets across sprints.",
        },
        {
            "id": 2,
            "name": "Active Users",
            "description": "Number of active users on the portal",
            "current": Decimal('8'),
            "target": Decimal('25'),
            "unit": "users",
            "trend": "up",
            "last_updated": now.strftime("%B %d, %Y"),
            "notes": "Internal team onboarded. Client users pending.",
        },
    ]

    print(f"Seeding {len(metrics)} metrics to {table_name}...")
    for metric in metrics:
        metric['created_at'] = now.isoformat()
        metric['updated_at'] = now.isoformat()
        table.put_item(Item=metric)
        print(f"  - Added: {metric['name']}")
    print(f"Done: {len(metrics)} metrics seeded.\n")


def seed_updates(table_name, region='us-east-2'):
    """Seed updates table with sample project milestones."""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)

    now = datetime.now(timezone.utc)
    updates = [
        {
            "id": 1,
            "type": "MILESTONE",
            "title": "Project Kickoff",
            "created_at": (now - timedelta(days=30)).isoformat(),
            "content": "Project officially kicked off. Team onboarded, infrastructure provisioned, and development sprints planned.",
            "author_email": "admin@example.com",
            "author": "admin",
            "priority": "HIGH",
            "acknowledgements": [],
        },
        {
            "id": 2,
            "type": "SUCCESS",
            "title": "MVP Released",
            "created_at": (now - timedelta(days=7)).isoformat(),
            "content": "MVP release deployed to staging. Core dashboard, authentication, and API endpoints are functional.",
            "author_email": "engineering@example.com",
            "author": "engineering",
            "priority": "HIGH",
            "acknowledgements": [],
        },
        {
            "id": 3,
            "type": "RESEARCH",
            "title": "First Customer Feedback",
            "created_at": now.isoformat(),
            "content": "Initial feedback collected from beta users. Key themes: positive on dashboard UX, requests for export functionality and notification preferences.",
            "author_email": "product@example.com",
            "author": "product",
            "priority": "MEDIUM",
            "acknowledgements": [],
        },
    ]

    print(f"Seeding {len(updates)} updates to {table_name}...")
    for update in updates:
        update['updated_at'] = now.isoformat()
        table.put_item(Item=update)
        print(f"  - Added: {update['title']}")
    print(f"Done: {len(updates)} updates seeded.\n")


def seed_meetings(table_name, region='us-east-2'):
    """Seed meetings table with sample meeting data."""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)

    now = datetime.now(timezone.utc)
    meetings = [
        {
            "id": 1,
            "title": "Weekly Status Meeting",
            "meeting_date": (now - timedelta(days=3)).strftime("%Y-%m-%d"),
            "attendees": ["Project Manager", "Tech Lead", "Designer", "QA Lead"],
            "summary": "Reviewed sprint progress. MVP on track. Discussed upcoming QA milestones.",
            "topics": ["Sprint review", "Blockers", "Upcoming milestones"],
            "action_item_ids": [1],
            "notes": "Next meeting scheduled for same time next week.",
        },
        {
            "id": 2,
            "title": "Sprint Planning",
            "meeting_date": now.strftime("%Y-%m-%d"),
            "attendees": ["Tech Lead", "Backend Engineer", "Frontend Engineer", "Designer"],
            "summary": "Planned sprint 4 work items. Prioritized deployment automation and notification system.",
            "topics": ["Sprint backlog", "Capacity planning", "Technical debt"],
            "action_item_ids": [2],
            "notes": "Team at full capacity for this sprint.",
        },
    ]

    print(f"Seeding {len(meetings)} meetings to {table_name}...")
    for meeting in meetings:
        meeting['created_at'] = now.isoformat()
        meeting['updated_at'] = now.isoformat()
        table.put_item(Item=meeting)
        print(f"  - Added: {meeting['title']}")
    print(f"Done: {len(meetings)} meetings seeded.\n")


def seed_action_items(table_name, region='us-east-2'):
    """Seed action items table with sample tasks."""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)

    now = datetime.now(timezone.utc)
    action_items = [
        {
            "id": 1,
            "title": "Set up development environment",
            "description": "Ensure all team members have local dev environments configured and running",
            "responsible_party": "Tech Lead",
            "target_date": (now - timedelta(days=14)).strftime("%Y-%m-%d"),
            "status": "completed",
            "priority": "high",
            "meeting_id": 1,
        },
        {
            "id": 2,
            "title": "Create initial project plan",
            "description": "Draft project timeline with milestones, resource allocation, and risk assessment",
            "responsible_party": "Project Manager",
            "target_date": (now + timedelta(days=7)).strftime("%Y-%m-%d"),
            "status": "in_progress",
            "priority": "high",
            "meeting_id": 2,
        },
    ]

    print(f"Seeding {len(action_items)} action items to {table_name}...")
    for item in action_items:
        item['created_at'] = now.isoformat()
        item['updated_at'] = now.isoformat()
        table.put_item(Item=item)
        print(f"  - Added: {item['title']}")
    print(f"Done: {len(action_items)} action items seeded.\n")


def main():
    """Main seed function."""
    import argparse

    parser = argparse.ArgumentParser(description='Seed DynamoDB tables with sample data')
    parser.add_argument('--env', default='dev', choices=['dev', 'staging', 'prod'],
                        help='Environment (dev, staging, prod)')
    parser.add_argument('--deliverables-only', action='store_true',
                        help='Only seed deliverables')
    parser.add_argument('--metrics-only', action='store_true',
                        help='Only seed metrics')
    parser.add_argument('--updates-only', action='store_true',
                        help='Only seed updates')
    parser.add_argument('--meetings-only', action='store_true',
                        help='Only seed meetings')
    parser.add_argument('--action-items-only', action='store_true',
                        help='Only seed action items')

    args = parser.parse_args()

    deliverables_table = f"turbotech-{args.env}-deliverables"
    metrics_table = f"turbotech-{args.env}-metrics"
    updates_table = f"turbotech-{args.env}-updates"
    meetings_table = f"turbotech-{args.env}-meetings"
    action_items_table = f"turbotech-{args.env}-action-items"

    print(f"\nSeeding DynamoDB tables for environment: {args.env}\n")

    only_flags = [
        args.deliverables_only, args.metrics_only, args.updates_only,
        args.meetings_only, args.action_items_only,
    ]
    seed_all = not any(only_flags)

    try:
        if seed_all or args.deliverables_only:
            seed_deliverables(deliverables_table)
        if seed_all or args.metrics_only:
            seed_metrics(metrics_table)
        if seed_all or args.updates_only:
            seed_updates(updates_table)
        if seed_all or args.meetings_only:
            seed_meetings(meetings_table)
        if seed_all or args.action_items_only:
            seed_action_items(action_items_table)

        print("Seeding complete!")
        print("\nData Summary:")
        print("  - 5 deliverables (setup, docs, MVP, QA, launch)")
        print("  - 3 metrics (completion, tasks, users)")
        print("  - 3 updates (kickoff, MVP, feedback)")
        print("  - 2 meetings (status, planning)")
        print("  - 2 action items")

    except Exception as e:
        print(f"Error seeding database: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
