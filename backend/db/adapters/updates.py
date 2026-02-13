"""
DynamoDB Adapter for Updates (Communication Hub)
"""
import boto3
import os
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from boto3.dynamodb.conditions import Key, Attr


class UpdateAdapter:
    """Adapter for Updates DynamoDB table"""

    def __init__(self):
        """Initialize DynamoDB connection"""
        self.dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('UPDATES_TABLE', 'turbotech-dev-updates')
        self.table = self.dynamodb.Table(table_name)

    def _decimal_to_python(self, obj):
        """Convert DynamoDB Decimal types to Python types"""
        if isinstance(obj, list):
            return [self._decimal_to_python(i) for i in obj]
        elif isinstance(obj, dict):
            return {k: self._decimal_to_python(v) for k, v in obj.items()}
        elif isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return obj

    async def get_all(self, update_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all updates, optionally filtered by type"""
        if update_type:
            # Query by type using GSI
            response = self.table.query(
                IndexName='TypeIndex',
                KeyConditionExpression=Key('update_type').eq(update_type),
                ScanIndexForward=False  # Descending order (newest first)
            )
        else:
            # Scan all updates
            response = self.table.scan()

        items = response.get('Items', [])

        # Sort by created_at descending (newest first)
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return [self._decimal_to_python(item) for item in items]

    async def get_by_id(self, update_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific update by ID"""
        response = self.table.get_item(Key={'id': update_id})
        item = response.get('Item')
        return self._decimal_to_python(item) if item else None

    async def create(self, update: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new update"""
        now = datetime.utcnow().isoformat()
        update['created_at'] = now
        update['updated_at'] = now

        # Initialize read_by as empty list if not provided
        if 'read_by' not in update:
            update['read_by'] = []

        self.table.put_item(Item=update)
        return self._decimal_to_python(update)

    async def acknowledge(self, update_id: int, user_id: int) -> Dict[str, Any]:
        """Add user to read_by list"""
        response = self.table.update_item(
            Key={'id': update_id},
            UpdateExpression="ADD read_by :user_id",
            ExpressionAttributeValues={
                ':user_id': {user_id}
            },
            ReturnValues="ALL_NEW"
        )

        return self._decimal_to_python(response.get('Attributes', {}))

    async def delete(self, update_id: int) -> bool:
        """Delete an update"""
        try:
            self.table.delete_item(Key={'id': update_id})
            return True
        except Exception:
            return False
