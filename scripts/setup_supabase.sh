#!/bin/bash

# Supabase Setup Script for InsightEye
# This script helps set up Supabase for the InsightEye project

set -e

echo "🚀 InsightEye Supabase Setup"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
    echo -e "${YELLOW}Checking environment variables...${NC}"

    missing_vars=()

    if [ -z "$SUPABASE_URL" ]; then
        missing_vars+=("SUPABASE_URL")
    fi

    if [ -z "$SUPABASE_ANON_KEY" ]; then
        missing_vars+=("SUPABASE_ANON_KEY")
    fi

    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
    fi

    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        missing_vars+=("SUPABASE_DB_PASSWORD")
    fi

    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo "   - $var"
        done
        echo ""
        echo "Please set these variables in your .env file or export them:"
        echo "   export SUPABASE_URL=https://your-project.supabase.co"
        echo "   export SUPABASE_ANON_KEY=your-anon-key"
        echo "   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
        echo "   export SUPABASE_DB_PASSWORD=your-db-password"
        echo ""
        echo "You can find these values in your Supabase dashboard:"
        echo "   - Project URL: Settings > General"
        echo "   - API Keys: Settings > API"
        echo "   - Database Password: Settings > Database"
        exit 1
    fi

    echo -e "${GREEN}✅ All environment variables are set${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing Python dependencies...${NC}"

    cd "$(dirname "$0")/../backend"

    if command -v pip &> /dev/null; then
        pip install -r requirements.txt
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ pip not found. Please install Python and pip first.${NC}"
        exit 1
    fi
}

# Test Supabase connection
test_connection() {
    echo -e "${YELLOW}Testing Supabase connection...${NC}"

    cd "$(dirname "$0")/../backend"

    python3 -c "
import sys
import os
sys.path.append('.')
from app.core.supabase_client import get_supabase_client

client = get_supabase_client()
if client:
    print('✅ Supabase client initialized successfully')
    try:
        # Test a simple query
        result = client.table('users').select('count', count='exact').limit(0).execute()
        print('✅ Supabase database connection successful')
    except Exception as e:
        print(f'⚠️  Database connection test failed: {e}')
        print('   This might be normal if tables don\'t exist yet')
else:
    print('❌ Failed to initialize Supabase client')
    sys.exit(1)
"
}

# Run database migrations
run_migrations() {
    echo -e "${YELLOW}Setting up database schema...${NC}"

    echo "📋 Please run the following SQL scripts in your Supabase SQL Editor:"
    echo ""
    echo "1. Initial Schema:"
    echo "   File: $(pwd)/supabase/migrations/001_initial_schema.sql"
    echo ""
    echo "2. RLS Policies:"
    echo "   File: $(pwd)/supabase/migrations/002_rls_policies.sql"
    echo ""
    echo "To run these:"
    echo "   1. Go to your Supabase dashboard"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Copy and paste the contents of each file"
    echo "   4. Execute them in order"
    echo ""

    read -p "Press Enter after you've run the migrations in Supabase..."
    echo -e "${GREEN}✅ Database schema setup completed${NC}"
}

# Migrate existing data (optional)
migrate_data() {
    echo -e "${YELLOW}Would you like to migrate existing data from local PostgreSQL? (y/n)${NC}"
    read -p "Enter choice: " migrate_choice

    if [[ $migrate_choice == [Yy]* ]]; then
        echo -e "${YELLOW}Running data migration...${NC}"
        cd "$(dirname "$0")"
        python3 migrate_to_supabase.py
    else
        echo "Skipping data migration"
    fi
}

# Update environment configuration
update_config() {
    echo -e "${YELLOW}Updating configuration...${NC}"

    # Check if .env file exists
    env_file="$(dirname "$0")/../.env"

    if [ ! -f "$env_file" ]; then
        echo "Creating .env file from template..."
        cp "$(dirname "$0")/../.env.supabase.example" "$env_file"
        echo -e "${YELLOW}⚠️  Please edit .env file with your actual Supabase credentials${NC}"
    fi

    # Enable Supabase in environment
    if grep -q "USE_SUPABASE=" "$env_file"; then
        sed -i.bak 's/USE_SUPABASE=.*/USE_SUPABASE=true/' "$env_file"
    else
        echo "USE_SUPABASE=true" >> "$env_file"
    fi

    echo -e "${GREEN}✅ Configuration updated${NC}"
}

# Main setup process
main() {
    echo "This script will help you set up Supabase for InsightEye"
    echo ""

    # Step 1: Check environment variables
    check_env_vars

    # Step 2: Install dependencies
    install_dependencies

    # Step 3: Test connection
    test_connection

    # Step 4: Run migrations
    run_migrations

    # Step 5: Migrate data (optional)
    migrate_data

    # Step 6: Update configuration
    update_config

    echo ""
    echo -e "${GREEN}🎉 Supabase setup completed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify your .env file has all the correct Supabase credentials"
    echo "2. Test your application with: cd backend && python -m uvicorn app.main:app --reload"
    echo "3. Your app should now be using Supabase instead of local PostgreSQL"
    echo ""
    echo "Useful commands:"
    echo "   - Start backend: cd backend && python -m uvicorn app.main:app --reload"
    echo "   - Start frontend: cd frontend && npm run dev"
    echo "   - Reset to local DB: Set USE_SUPABASE=false in .env"
    echo "   - Supabase dashboard: ${SUPABASE_URL}"
}

# Run main function
main