# Use standard Python image (not Lambda base image) for Lambda Web Adapter
FROM python:3.10-slim

# Install AWS Lambda Web Adapter
# This allows FastAPI to run on Lambda by converting API Gateway events to HTTP requests
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

# Set working directory
WORKDIR /var/task

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py ./
COPY api/ ./api/
COPY db/ ./db/
COPY services/ ./services/

# Lambda Web Adapter configuration
ENV PORT=8000

# Health check endpoint for Lambda Web Adapter
ENV READINESS_CHECK_PATH=/api/health
ENV READINESS_CHECK_PORT=8000

# Start FastAPI with uvicorn
# Lambda Web Adapter intercepts API Gateway events and forwards as HTTP
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
