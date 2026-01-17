#!/bin/bash

# InsightEye Application Startup Script
# This script starts the backend and frontend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Function to check if Supabase is configured
check_supabase_config() {
    if [ -f "$PROJECT_DIR/.env" ]; then
        if grep -q "USE_SUPABASE=true" "$PROJECT_DIR/.env"; then
            echo -e "${GREEN}✅ Supabase mode enabled${NC}"
            return 0
        fi
    fi
    echo -e "${YELLOW}⚠️  Local PostgreSQL mode (USE_SUPABASE not set to true)${NC}"
    return 1
}

# Function to check dependencies
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"

    # Check Python
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Python not found. Please install Python 3.8+${NC}"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js${NC}"
        exit 1
    fi

    # Check if backend dependencies are installed
    if [ ! -d "$PROJECT_DIR/backend/venv" ] && [ ! -f "$PROJECT_DIR/backend/.venv" ]; then
        echo -e "${YELLOW}⚠️  No virtual environment found. Installing dependencies...${NC}"
        cd "$PROJECT_DIR/backend"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    fi

    # Check if frontend dependencies are installed
    if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
        echo -e "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
        cd "$PROJECT_DIR/frontend"
        npm install
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    fi

    echo -e "${GREEN}✅ Dependencies check completed${NC}"
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🚀 Starting backend server...${NC}"

    cd "$PROJECT_DIR/backend"

    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi

    # Start backend in background
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!

    # Wait a moment for server to start
    sleep 3

    # Check if backend is running
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
        echo $BACKEND_PID > "$PROJECT_DIR/.backend_pid"
    else
        echo -e "${RED}❌ Failed to start backend${NC}"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🌐 Starting frontend server...${NC}"

    cd "$PROJECT_DIR/frontend"

    # Start frontend in background
    npm run dev &
    FRONTEND_PID=$!

    # Wait a moment for server to start
    sleep 3

    # Check if frontend is running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
        echo $FRONTEND_PID > "$PROJECT_DIR/.frontend_pid"
    else
        echo -e "${RED}❌ Failed to start frontend${NC}"
        exit 1
    fi
}

# Function to start Celery worker
start_celery() {
    echo -e "${BLUE}⚙️  Starting Celery worker...${NC}"

    cd "$PROJECT_DIR/backend"

    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi

    # Start Celery in background
    celery -A app.core.celery worker --loglevel=info &
    CELERY_PID=$!

    # Wait a moment for worker to start
    sleep 3

    # Check if Celery is running
    if kill -0 $CELERY_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Celery worker started successfully (PID: $CELERY_PID)${NC}"
        echo $CELERY_PID > "$PROJECT_DIR/.celery_pid"
    else
        echo -e "${RED}❌ Failed to start Celery worker${NC}"
        exit 1
    fi
}

# Function to stop all services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"

    # Stop backend
    if [ -f "$PROJECT_DIR/.backend_pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_DIR/.backend_pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            echo -e "${GREEN}✅ Backend stopped${NC}"
        fi
        rm -f "$PROJECT_DIR/.backend_pid"
    fi

    # Stop frontend
    if [ -f "$PROJECT_DIR/.frontend_pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_DIR/.frontend_pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo -e "${GREEN}✅ Frontend stopped${NC}"
        fi
        rm -f "$PROJECT_DIR/.frontend_pid"
    fi

    # Stop Celery
    if [ -f "$PROJECT_DIR/.celery_pid" ]; then
        CELERY_PID=$(cat "$PROJECT_DIR/.celery_pid")
        if kill -0 $CELERY_PID 2>/dev/null; then
            kill $CELERY_PID
            echo -e "${GREEN}✅ Celery worker stopped${NC}"
        fi
        rm -f "$PROJECT_DIR/.celery_pid"
    fi

    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Service Status${NC}"
    echo "=================="

    # Check backend
    if [ -f "$PROJECT_DIR/.backend_pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_DIR/.backend_pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Backend: Running (PID: $BACKEND_PID)${NC}"
            echo "   URL: http://localhost:8000"
        else
            echo -e "${RED}❌ Backend: Not running${NC}"
        fi
    else
        echo -e "${RED}❌ Backend: Not running${NC}"
    fi

    # Check frontend
    if [ -f "$PROJECT_DIR/.frontend_pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_DIR/.frontend_pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Frontend: Running (PID: $FRONTEND_PID)${NC}"
            echo "   URL: http://localhost:3000"
        else
            echo -e "${RED}❌ Frontend: Not running${NC}"
        fi
    else
        echo -e "${RED}❌ Frontend: Not running${NC}"
    fi

    # Check Celery
    if [ -f "$PROJECT_DIR/.celery_pid" ]; then
        CELERY_PID=$(cat "$PROJECT_DIR/.celery_pid")
        if kill -0 $CELERY_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Celery: Running (PID: $CELERY_PID)${NC}"
        else
            echo -e "${RED}❌ Celery: Not running${NC}"
        fi
    else
        echo -e "${RED}❌ Celery: Not running${NC}"
    fi

    echo ""
    check_supabase_config
}

# Function to show help
show_help() {
    echo "InsightEye Application Manager"
    echo "============================="
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  start       Start all services (backend + frontend)"
    echo "  start-full  Start all services including Celery"
    echo "  stop        Stop all services"
    echo "  status      Show service status"
    echo "  restart     Restart all services"
    echo "  backend     Start only backend"
    echo "  frontend    Start only frontend"
    echo "  celery      Start only Celery worker"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start backend and frontend"
    echo "  $0 start-full            # Start all services including Celery"
    echo "  $0 status                # Check service status"
    echo ""
}

# Main script logic
case "${1:-}" in
    "start")
        echo -e "${BLUE}🚀 Starting InsightEye Application${NC}"
        echo "=================================="
        check_dependencies
        check_supabase_config
        start_backend
        start_frontend
        echo ""
        echo -e "${GREEN}🎉 Application started successfully!${NC}"
        echo ""
        echo "Services:"
        echo "  - Backend:  http://localhost:8000"
        echo "  - Frontend: http://localhost:3000"
        echo ""
        echo "To stop services, run: $0 stop"
        ;;
    "start-full")
        echo -e "${BLUE}🚀 Starting InsightEye Application (Full)${NC}"
        echo "========================================"
        check_dependencies
        check_supabase_config
        start_backend
        start_frontend
        start_celery
        echo ""
        echo -e "${GREEN}🎉 All services started successfully!${NC}"
        echo ""
        echo "Services:"
        echo "  - Backend:  http://localhost:8000"
        echo "  - Frontend: http://localhost:3000"
        echo "  - Celery:   Background worker running"
        echo ""
        echo "To stop services, run: $0 stop"
        ;;
    "stop")
        stop_services
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_services
        sleep 2
        check_dependencies
        start_backend
        start_frontend
        echo -e "${GREEN}✅ Services restarted${NC}"
        ;;
    "backend")
        check_dependencies
        start_backend
        ;;
    "frontend")
        check_dependencies
        start_frontend
        ;;
    "celery")
        check_dependencies
        start_celery
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: ${1:-}${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac