"""
DynamoDB Adapter for Meetings
Provides SQLAlchemy-like interface for meetings table
"""
import boto3
import os
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from boto3.dynamodb.conditions import Key, Attr


class MeetingAdapter:
    """Adapter for Meetings DynamoDB table"""

    def __init__(self):
        """Initialize DynamoDB connection"""
        self.dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('MEETINGS_TABLE', 'portal-dev-meetings')
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
        """Get all meetings"""
        response = self.table.scan()
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))

        # Sort by meeting_date descending (most recent first)
        items.sort(key=lambda x: x.get('meeting_date', ''), reverse=True)
        return [self._decimal_to_python(item) for item in items]

    async def get_by_date(self, meeting_date: str) -> List[Dict[str, Any]]:
        """Get meetings by date"""
        response = self.table.query(
            IndexName='MeetingDateIndex',
            KeyConditionExpression=Key('meeting_date').eq(meeting_date)
        )
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.query(
                IndexName='MeetingDateIndex',
                KeyConditionExpression=Key('meeting_date').eq(meeting_date),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))

        return [self._decimal_to_python(item) for item in items]

    async def get_by_id(self, meeting_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific meeting by ID"""
        response = self.table.get_item(Key={'id': meeting_id})
        item = response.get('Item')
        return self._decimal_to_python(item) if item else None

    async def create(self, meeting: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new meeting"""
        # Convert Python types to DynamoDB types
        meeting = self._python_to_dynamodb(meeting)

        # Add timestamps
        now = datetime.utcnow().isoformat()
        meeting['created_at'] = now
        meeting['updated_at'] = now

        # Put item
        self.table.put_item(Item=meeting)
        return self._decimal_to_python(meeting)

    async def update(self, meeting_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a meeting"""
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
            Key={'id': meeting_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return self._decimal_to_python(response.get('Attributes', {}))

    async def delete(self, meeting_id: int) -> bool:
        """Delete a meeting"""
        try:
            self.table.delete_item(Key={'id': meeting_id})
            return True
        except Exception:
            return False
