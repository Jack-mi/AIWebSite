#!/usr/bin/env python3
"""
Simple test script to verify Supabase connection
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_supabase_connection():
    """Test basic Supabase connection"""

    # Check if required environment variables are set
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    print("=== Supabase Connection Test ===")
    print(f"SUPABASE_URL: {supabase_url}")
    print(f"SUPABASE_ANON_KEY: {'✓ Set' if supabase_anon_key and not supabase_anon_key.startswith('eyJ...') else '✗ Not configured'}")

    if not supabase_url or not supabase_anon_key or supabase_anon_key.startswith('eyJ...'):
        print("\n❌ Supabase credentials not properly configured!")
        print("\nPlease update your .env file with:")
        print("1. Your actual SUPABASE_ANON_KEY (from Supabase Dashboard > Settings > API)")
        print("2. Your actual SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard > Settings > API)")
        print("3. Your actual SUPABASE_DB_PASSWORD (from Supabase Dashboard > Settings > Database)")
        return False

    try:
        from supabase import create_client, Client

        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_anon_key)

        # Test connection by trying to access auth
        auth_response = supabase.auth.get_session()
        print(f"\n✅ Successfully connected to Supabase!")
        print(f"Project URL: {supabase_url}")

        return True

    except Exception as e:
        print(f"\n❌ Failed to connect to Supabase: {str(e)}")
        return False

if __name__ == "__main__":
    test_supabase_connection()