"""
DynamoDB Adapter for Action Items
Provides SQLAlchemy-like interface for action_items table
"""
import boto3
import os
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from boto3.dynamodb.conditions import Key, Attr


class ActionItemAdapter:
    """Adapter for Action Items DynamoDB table"""

    def __init__(self):
        """Initialize DynamoDB connection"""
        self.dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('ACTION_ITEMS_TABLE', 'turbotech-dev-action-items')
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

    def _python_to_dynamodb(self, obj):
        """Convert Python types to DynamoDB types (float -> Decimal)"""
        if isinstance(obj, float):
            return Decimal(str(obj))
        elif isinstance(obj, int):
            return Decimal(str(obj))
        elif isinstance(obj, dict):
            return {k: self._python_to_dynamodb(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._python_to_dynamodb(i) for i in obj]
        return obj

    async def get_all(self) -> List[Dict[str, Any]]:
        """Get all action items"""
        response = self.table.scan()
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))

        # Sort by id
        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get action items by status"""
        response = self.table.query(
            IndexName='StatusIndex',
            KeyConditionExpression=Key('status').eq(status)
        )
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.query(
                IndexName='StatusIndex',
                KeyConditionExpression=Key('status').eq(status),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))

        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_responsible_party(self, responsible_party: str) -> List[Dict[str, Any]]:
        """Get action items by responsible party"""
        response = self.table.query(
            IndexName='ResponsiblePartyIndex',
            KeyConditionExpression=Key('responsible_party').eq(responsible_party)
        )
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.query(
                IndexName='ResponsiblePartyIndex',
                KeyConditionExpression=Key('responsible_party').eq(responsible_party),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))

        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_meeting_id(self, meeting_id: int) -> List[Dict[str, Any]]:
        """Get action items by meeting ID"""
        response = self.table.query(
            IndexName='MeetingIdIndex',
            KeyConditionExpression=Key('meeting_id').eq(meeting_id)
        )
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.query(
                IndexName='MeetingIdIndex',
                KeyConditionExpression=Key('meeting_id').eq(meeting_id),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))

        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_id(self, action_item_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific action item by ID"""
        response = self.table.get_item(Key={'id': action_item_id})
        item = response.get('Item')
        return self._decimal_to_python(item) if item else None

    async def create(self, action_item: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new action item"""
        # Convert Python types to DynamoDB types
        action_item = self._python_to_dynamodb(action_item)

        # Add timestamps
        now = datetime.utcnow().isoformat()
        action_item['created_at'] = now
        action_item['updated_at'] = now

        # Put item
        self.table.put_item(Item=action_item)
        return self._decimal_to_python(action_item)

    async def update(self, action_item_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update an action item"""
        # Convert float/int values to Decimal for DynamoDB
        updates = self._python_to_dynamodb(updates)

        # Build update expression
        update_expression = "SET "
        expression_attribute_values = {}
        expression_attribute_names = {}

        for i, (key, value) in enumerate(updates.items()):
            attr_name = f"#attr{i}"
            attr_value = f":val{i}"

            if i > 0:
                update_expression += ", "
            update_expression += f"{attr_name} = {attr_value}"

            expression_attribute_names[attr_name] = key
            expression_attribute_values[attr_value] = value

        # Always update updated_at
        update_expression += ", #updated_at = :updated_at"
        expression_attribute_names['#updated_at'] = 'updated_at'
        expression_attribute_values[':updated_at'] = datetime.utcnow().isoformat()

        response = self.table.update_item(
            Key={'id': action_item_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return self._decimal_to_python(response.get('Attributes', {}))

    async def delete(self, action_item_id: int) -> bool:
        """Delete an action item"""
        try:
            self.table.delete_item(Key={'id': action_item_id})
            return True
        except Exception:
            return False
