"""
DynamoDB Adapter for Deliverables
Provides SQLAlchemy-like interface for deliverables table
"""
import boto3
import os
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from boto3.dynamodb.conditions import Key, Attr


class DeliverableAdapter:
    """Adapter for Deliverables DynamoDB table"""

    def __init__(self):
        """Initialize DynamoDB connection"""
        self.dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('DELIVERABLES_TABLE', 'portal-dev-deliverables')
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

    async def get_all(self) -> List[Dict[str, Any]]:
        """Get all deliverables"""
        response = self.table.scan()
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))

        # Sort by id
        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_month(self, month: int) -> List[Dict[str, Any]]:
        """Get deliverables for a specific month (phase_id)"""
        response = self.table.scan(
            FilterExpression=Attr('phase_id').eq(month)
        )
        items = response.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = self.table.scan(
                FilterExpression=Attr('phase_id').eq(month),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))

        # Sort by id or due_date if available
        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_id(self, deliverable_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific deliverable by ID"""
        response = self.table.get_item(Key={'id': deliverable_id})
        item = response.get('Item')
        return self._decimal_to_python(item) if item else None

    def _python_to_dynamodb(self, obj):
        """Convert Python types to DynamoDB types (float -> Decimal)"""
        if isinstance(obj, float):
            return Decimal(str(obj))
        elif isinstance(obj, dict):
            return {k: self._python_to_dynamodb(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._python_to_dynamodb(i) for i in obj]
        return obj

    async def update(self, deliverable_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a deliverable"""
        # Convert float values to Decimal for DynamoDB
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
            Key={'id': deliverable_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return self._decimal_to_python(response.get('Attributes', {}))

    async def create(self, deliverable: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new deliverable"""
        # Add timestamps
        now = datetime.utcnow().isoformat()
        deliverable['created_at'] = now
        deliverable['updated_at'] = now

        # Put item
        self.table.put_item(Item=deliverable)
        return self._decimal_to_python(deliverable)

    async def delete(self, deliverable_id: int) -> bool:
        """Delete a deliverable"""
        try:
            self.table.delete_item(Key={'id': deliverable_id})
            return True
        except Exception:
            return False
