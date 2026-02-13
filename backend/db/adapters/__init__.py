"""
DynamoDB Adapters for Project Portal
Provides SQLAlchemy-like interface for DynamoDB operations
"""
from .deliverables import DeliverableAdapter
from .metrics import MetricAdapter
from .updates import UpdateAdapter
from .users import UserAdapter

__all__ = [
    'DeliverableAdapter',
    'MetricAdapter',
    'UpdateAdapter',
    'UserAdapter',
]
