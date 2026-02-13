"""
DynamoDB Adapter for Sample Projects
"""
import boto3
import os
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional


class SampleProjectAdapter:
    """Adapter for Sample Projects DynamoDB table"""

    def __init__(self):
        """Initialize DynamoDB connection"""
        self.dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('SAMPLE_PROJECTS_TABLE', 'portal-dev-sample-projects')
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

    async def get_all(self, delivery_method: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all sample projects or filter by delivery method"""
        if delivery_method:
            # Use GSI to filter by delivery method
            response = self.table.query(
                IndexName='DeliveryMethodIndex',
                KeyConditionExpression='delivery_method = :dm',
                ExpressionAttributeValues={':dm': delivery_method}
            )
            items = response.get('Items', [])
        else:
            # Scan all projects
            response = self.table.scan()
            items = response.get('Items', [])

        items.sort(key=lambda x: x.get('id', 0))
        return [self._decimal_to_python(item) for item in items]

    async def get_by_id(self, project_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific project by ID"""
        response = self.table.get_item(Key={'id': project_id})
        item = response.get('Item')
        return self._decimal_to_python(item) if item else None

    async def create(self, project: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new sample project"""
        now = datetime.utcnow().isoformat()
        project['created_at'] = now
        project['updated_at'] = now

        # Convert Python types to DynamoDB types
        project = self._python_to_dynamodb(project)

        self.table.put_item(Item=project)
        return self._decimal_to_python(project)

    async def update(self, project_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a sample project"""
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
            Key={'id': project_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return self._decimal_to_python(response.get('Attributes', {}))

    async def get_stats(self) -> Dict[str, Any]:
        """Get aggregate statistics across all sample projects"""
        all_projects = await self.get_all()

        total_size_mb = sum(p.get('size_mb', 0) for p in all_projects)
        total_docs = sum(sum(p.get('document_counts', {}).values()) for p in all_projects)

        # Count by delivery method
        delivery_methods = {}
        for project in all_projects:
            dm = project.get('delivery_method', 'UNKNOWN')
            if dm not in delivery_methods:
                delivery_methods[dm] = 0
            delivery_methods[dm] += 1

        return {
            'total_projects': len(all_projects),
            'total_documents': total_docs,
            'total_size_mb': total_size_mb,
            'total_size_gb': round(total_size_mb / 1024, 2),
            'delivery_methods': delivery_methods
        }
