#!/bin/bash

# InsightEye One-Click Start Script

set -e

echo "🚀 Starting InsightEye AI Website Analysis Tool..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    echo "   Download Docker: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if environment file exists
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
fi

# Pull required images first to avoid timeout
echo "📦 Pulling Docker images..."
docker-compose pull postgres redis

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build --parallel

echo "🎯 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Function to check service health with retries
check_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if eval "$check_command" > /dev/null 2>&1; then
            echo "✅ $service_name: Running"
            return 0
        fi
        sleep 2
        ((attempt++))
    done
    echo "❌ $service_name: Failed to start"
    return 1
}

echo "🔍 Checking service status..."

# Check PostgreSQL
check_service "PostgreSQL" "docker-compose exec -T postgres pg_isready -q"

# Check Redis
check_service "Redis" "docker-compose exec -T redis redis-cli ping | grep -q PONG"

# Check Backend API
check_service "Backend API" "curl -s http://localhost:8000/health | grep -q healthy"

# Check Frontend
check_service "Frontend" "curl -s http://localhost:3000"

# Initialize database
echo "🗄️  Initializing database..."
sleep 5

echo ""
echo "🎉 InsightEye is now running!"
echo ""
echo "📱 Access URLs:"
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔧 Backend:   http://localhost:8000"
echo "   📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "🎯 Quick Start:"
echo "   1. Open http://localhost:3000"
echo "   2. Click 'Login' (demo mode enabled)"
echo "   3. Enter any website URL to analyze"
echo ""
echo "📋 Management Commands:"
echo "   View logs:    make logs"
echo "   Stop:         make stop"
echo "   Restart:      make restart"
echo "   Test:         make test"
echo ""

# Auto-open browser (optional)
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening browser..."
    open http://localhost:3000
elif command -v xdg-open >/dev/null 2>&1; then
    echo "🌐 Opening browser..."
    xdg-open http://localhost:3000
fi