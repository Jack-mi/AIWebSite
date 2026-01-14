.PHONY: start stop restart test logs clean install

# One-click start
start:
	@echo "🚀 Starting InsightEye..."
	@chmod +x scripts/start.sh
	@./scripts/start.sh

# Stop all services
stop:
	@echo "🛑 Stopping InsightEye..."
	@docker-compose down

# Restart services
restart:
	@echo "🔄 Restarting InsightEye..."
	@docker-compose restart

# Run tests
test:
	@echo "🧪 Running tests..."
	@chmod +x scripts/test.sh
	@./scripts/test.sh

# View logs
logs:
	@docker-compose logs -f

# Clean up everything
clean:
	@echo "🧹 Cleaning up..."
	@docker-compose down -v
	@docker system prune -f

# Install dependencies (for local development)
install:
	@echo "📦 Installing dependencies..."
	@cd frontend && npm install
	@cd backend && pip install -r requirements.txt