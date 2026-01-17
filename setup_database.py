#!/usr/bin/env python3
"""
Setup database tables in Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def setup_database():
    """Create database tables in Supabase"""

    # Get environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_service_key:
        print("❌ Missing Supabase credentials")
        return False

    try:
        # Create Supabase client with service role key for admin operations
        supabase: Client = create_client(supabase_url, supabase_service_key)

        print("🚀 Setting up InsightEye database tables...")
        print(f"📍 Project URL: {supabase_url}")

        # Read the SQL migration files
        with open('supabase/migrations/001_initial_schema.sql', 'r') as f:
            initial_schema = f.read()

        # Execute the initial schema
        print("📊 Creating initial schema...")
        result = supabase.rpc('exec_sql', {'sql': initial_schema}).execute()

        if result.data:
            print("✅ Initial schema created successfully!")

        # Check if we have RLS policies file
        rls_file = 'supabase/migrations/002_rls_policies.sql'
        if os.path.exists(rls_file):
            with open(rls_file, 'r') as f:
                rls_policies = f.read()

            print("🔒 Setting up Row Level Security policies...")
            rls_result = supabase.rpc('exec_sql', {'sql': rls_policies}).execute()

            if rls_result.data:
                print("✅ RLS policies created successfully!")

        print("\n🎉 Database setup complete!")
        print("\nTables created:")
        print("  • users - User profiles and authentication")
        print("  • websites - Website analysis targets")
        print("  • analyses - Analysis results and metadata")
        print("  • technology_stacks - Detected technologies")
        print("  • traffic_data - Website traffic metrics")
        print("  • competitors - Competitor relationships")
        print("  • reports - Generated reports")

        return True

    except Exception as e:
        print(f"❌ Database setup failed: {str(e)}")
        print("\nPlease run the SQL files manually in your Supabase dashboard:")
        print("1. Go to: https://supabase.com/dashboard/project/tdyqfigikgbaksuyxetu/sql")
        print("2. Copy and run: supabase/migrations/001_initial_schema.sql")
        print("3. Copy and run: supabase/migrations/002_rls_policies.sql")
        return False

if __name__ == "__main__":
    setup_database()