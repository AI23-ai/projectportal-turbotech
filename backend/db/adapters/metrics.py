"""
DynamoDB Adapter for Metrics
"""
import boto3
import os
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional


class MetricAdapter:
    """Adapter for Metrics DynamoDB table"""

    def __init__(self):
        """Initialize DynamoDB connection"""
        self.dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('METRICS_TABLE', 'portal-dev-metrics')
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
        elif isinstance(obj, dict):
            return {k: self._python_to_dynamodb(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._python_to_dynamodb(i) for i in obj]
        return obj

    async def get_all(self) -> List[Dict[str, Any]]:
        """Get all metrics"""
        response = self.table.scan()
        items = response.get('Items', [])
        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_id(self, metric_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific metric by ID"""
        response = self.table.get_item(Key={'id': metric_id})
        item = response.get('Item')
        return self._decimal_to_python(item) if item else None

    async def update(self, metric_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a metric"""
        # Convert Python types to DynamoDB types
        updates = self._python_to_dynamodb(updates)

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
            Key={'id': metric_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return self._decimal_to_python(response.get('Attributes', {}))

    async def create(self, metric: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new metric"""
        now = datetime.utcnow().isoformat()
        metric['created_at'] = now
        metric['updated_at'] = now

        self.table.put_item(Item=metric)
        return self._decimal_to_python(metric)
