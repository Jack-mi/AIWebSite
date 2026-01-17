#!/bin/bash

# Simple startup script for InsightEye
# Uses simplified backend without complex dependencies

PROJECT_DIR="/Users/miller/Projects/icai"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting InsightEye (Simplified Mode)${NC}"
echo "=========================================="

# Stop any existing services
echo "Stopping existing services..."
pkill -f "uvicorn"
pkill -f "next dev"

# Start backend
echo -e "${BLUE}🚀 Starting simplified backend server...${NC}"
cd "$PROJECT_DIR/backend"

if [ -d "venv" ]; then
    source venv/bin/activate
fi

python -m uvicorn app.main_simple:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi

# Start frontend
echo -e "${BLUE}🌐 Starting frontend server...${NC}"
cd "$PROJECT_DIR/frontend"

npm run dev &
FRONTEND_PID=$!

sleep 5
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo ""
echo "Services:"
echo "  - Backend:  http://localhost:8000"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Store PIDs for cleanup
echo $BACKEND_PID > /tmp/insighteye_backend.pid
echo $FRONTEND_PID > /tmp/insighteye_frontend.pid

# Wait for interrupt
trap 'echo -e "\n${BLUE}Stopping services...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Keep script running
wait