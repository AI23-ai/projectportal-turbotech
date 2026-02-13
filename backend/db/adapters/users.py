"""
DynamoDB Adapter for Users
"""
import boto3
import os
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from boto3.dynamodb.conditions import Key


class UserAdapter:
    """Adapter for Users DynamoDB table"""

    def __init__(self):
        """Initialize DynamoDB connection"""
        self.dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('USERS_TABLE', 'turbotech-dev-users')
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

    async def get_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a user by ID"""
        response = self.table.get_item(Key={'id': user_id})
        item = response.get('Item')
        return self._decimal_to_python(item) if item else None

    async def get_by_auth0_id(self, auth0_id: str) -> Optional[Dict[str, Any]]:
        """Get a user by Auth0 ID"""
        response = self.table.query(
            IndexName='Auth0IdIndex',
            KeyConditionExpression=Key('auth0_id').eq(auth0_id)
        )
        items = response.get('Items', [])
        return self._decimal_to_python(items[0]) if items else None

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email"""
        response = self.table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email)
        )
        items = response.get('Items', [])
        return self._decimal_to_python(items[0]) if items else None

    async def create(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user"""
        now = datetime.utcnow().isoformat()
        user['created_at'] = now
        user['updated_at'] = now

        self.table.put_item(Item=user)
        return self._decimal_to_python(user)

    async def update(self, user_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a user"""
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
            Key={'id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return self._decimal_to_python(response.get('Attributes', {}))
