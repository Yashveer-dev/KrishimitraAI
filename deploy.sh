#!/bin/bash

# KrishimitraAI Production Deployment Script
# This script deploys the complete application stack

set -e  # Exit on any error

echo "🚀 Starting KrishimitraAI Production Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found. Please create it first."
    echo "   Copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p data/models
mkdir -p data/raw
mkdir -p nginx/ssl

# Build and train ML models
echo "🤖 Training ML models..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ml
python yield_prediction.py
cd ../..
echo "✅ ML models trained and saved"

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build
echo "✅ Docker images built"

# Start the services
echo "🌐 Starting services..."
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Services started"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health checks
echo "🔍 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Show running containers
echo "📋 Running containers:"
docker-compose -f docker-compose.prod.yml ps

echo "🎉 Deployment completed successfully!"
echo "🌐 Application is available at: http://localhost"
echo "📊 API documentation: http://localhost:8000/docs"
echo "🔍 Health check: http://localhost:8000/health"

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20
