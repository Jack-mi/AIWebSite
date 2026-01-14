#!/bin/bash

# InsightEye One-Click Run Script
# This script handles everything: dependencies, setup, and launch

set -e

echo "🚀 InsightEye - One-Click Setup & Run"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "📥 Please install Docker first:"
    echo "   macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "   Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "   Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
    echo "❌ Docker Compose is not available."
    echo "📥 Please install Docker Compose or update Docker Desktop"
    exit 1
fi

# Use docker compose or docker-compose based on availability
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running."
    echo "🔧 Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is ready"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Setting up environment configuration..."
    cp .env.example .env
    echo "✅ Environment file created"
fi

# Make scripts executable
chmod +x scripts/*.sh

echo "🔨 Building and starting InsightEye..."

# Stop any existing containers
$DOCKER_COMPOSE down > /dev/null 2>&1 || true

# Pull base images to speed up build
echo "📦 Pulling base images..."
$DOCKER_COMPOSE pull postgres redis

# Build all services
echo "🏗️  Building application..."
$DOCKER_COMPOSE build --parallel

# Start all services
echo "🚀 Starting services..."
$DOCKER_COMPOSE up -d

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."

# Function to wait for service
wait_for_service() {
    local service=$1
    local url=$2
    local max_attempts=60
    local attempt=1

    echo -n "   Waiting for $service"
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo " ✅"
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    echo " ❌"
    return 1
}

# Wait for database
echo -n "   Waiting for database"
attempt=1
while [ $attempt -le 30 ]; do
    if $DOCKER_COMPOSE exec -T postgres pg_isready -q > /dev/null 2>&1; then
        echo " ✅"
        break
    fi
    echo -n "."
    sleep 2
    ((attempt++))
done

# Wait for Redis
echo -n "   Waiting for Redis"
attempt=1
while [ $attempt -le 30 ]; do
    if $DOCKER_COMPOSE exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
        echo " ✅"
        break
    fi
    echo -n "."
    sleep 2
    ((attempt++))
done

# Wait for backend
wait_for_service "Backend API" "http://localhost:8000/health"

# Wait for frontend
wait_for_service "Frontend" "http://localhost:3000"

echo ""
echo "🎉 InsightEye is now running successfully!"
echo ""
echo "📱 Access the application:"
echo "   🌐 Main App:    http://localhost:3000"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📚 API Docs:    http://localhost:8000/docs"
echo ""
echo "🎯 Quick Start Guide:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Click 'Login' to start (demo mode)"
echo "   3. Enter any website URL (e.g., https://github.com)"
echo "   4. Click 'Start Analysis' and wait for AI insights"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:    $DOCKER_COMPOSE logs -f"
echo "   Stop all:     $DOCKER_COMPOSE down"
echo "   Restart:      $DOCKER_COMPOSE restart"
echo ""

# Try to open browser automatically
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening browser automatically..."
    sleep 2
    open http://localhost:3000
elif command -v xdg-open >/dev/null 2>&1; then
    echo "🌐 Opening browser automatically..."
    sleep 2
    xdg-open http://localhost:3000 2>/dev/null &
fi

echo "✨ Setup complete! InsightEye is ready to analyze websites."