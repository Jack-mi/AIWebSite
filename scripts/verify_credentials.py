#!/usr/bin/env python3
"""
Quick credential verification script for Supabase setup.
Run this after updating your .env file with real Supabase credentials.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_credentials():
    """Check if Supabase credentials are properly configured."""

    print("🔍 Checking Supabase Credentials...")
    print("=" * 40)

    # Check required environment variables
    required_vars = {
        'SUPABASE_URL': os.getenv('SUPABASE_URL', ''),
        'SUPABASE_ANON_KEY': os.getenv('SUPABASE_ANON_KEY', ''),
        'SUPABASE_SERVICE_ROLE_KEY': os.getenv('SUPABASE_SERVICE_ROLE_KEY', ''),
        'SUPABASE_DB_PASSWORD': os.getenv('SUPABASE_DB_PASSWORD', ''),
        'USE_SUPABASE': os.getenv('USE_SUPABASE', 'false')
    }

    # Check each variable
    issues = []

    # Check USE_SUPABASE
    if required_vars['USE_SUPABASE'].lower() != 'true':
        issues.append("❌ USE_SUPABASE is not set to 'true'")
    else:
        print("✅ USE_SUPABASE: Enabled")

    # Check SUPABASE_URL
    url = required_vars['SUPABASE_URL']
    if not url or url == 'https://your-project-ref.supabase.co':
        issues.append("❌ SUPABASE_URL: Not configured (still has placeholder)")
    elif not url.startswith('https://') or not '.supabase.co' in url:
        issues.append("❌ SUPABASE_URL: Invalid format (should be https://[project].supabase.co)")
    else:
        print(f"✅ SUPABASE_URL: {url}")

    # Check ANON_KEY
    anon_key = required_vars['SUPABASE_ANON_KEY']
    if not anon_key or anon_key == 'eyJ...your-anon-key...':
        issues.append("❌ SUPABASE_ANON_KEY: Not configured (still has placeholder)")
    elif not anon_key.startswith('eyJ'):
        issues.append("❌ SUPABASE_ANON_KEY: Invalid format (should start with 'eyJ')")
    else:
        print(f"✅ SUPABASE_ANON_KEY: {anon_key[:20]}...")

    # Check SERVICE_ROLE_KEY
    service_key = required_vars['SUPABASE_SERVICE_ROLE_KEY']
    if not service_key or service_key == 'eyJ...your-service-role-key...':
        issues.append("❌ SUPABASE_SERVICE_ROLE_KEY: Not configured (still has placeholder)")
    elif not service_key.startswith('eyJ'):
        issues.append("❌ SUPABASE_SERVICE_ROLE_KEY: Invalid format (should start with 'eyJ')")
    else:
        print(f"✅ SUPABASE_SERVICE_ROLE_KEY: {service_key[:20]}...")

    # Check DB_PASSWORD
    db_password = required_vars['SUPABASE_DB_PASSWORD']
    if not db_password or db_password == 'your-database-password':
        issues.append("❌ SUPABASE_DB_PASSWORD: Not configured (still has placeholder)")
    else:
        print(f"✅ SUPABASE_DB_PASSWORD: {'*' * len(db_password)}")

    print("\n" + "=" * 40)

    if issues:
        print("❌ Configuration Issues Found:")
        for issue in issues:
            print(f"   {issue}")
        print("\n📋 To Fix These Issues:")
        print("1. Go to your Supabase dashboard: https://app.supabase.com")
        print("2. Select your project")
        print("3. Navigate to Settings > API")
        print("4. Copy the Project URL and API keys")
        print("5. Navigate to Settings > Database for the password")
        print("6. Update your .env file with the real values")
        return False
    else:
        print("🎉 All credentials are properly configured!")
        print("\n📋 Next Steps:")
        print("1. Run: ./scripts/setup_supabase.sh")
        print("2. Or manually run the database schema setup")
        print("3. Start your app: ./scripts/start_app.sh start")
        return True

def test_connection():
    """Test the actual connection to Supabase."""
    try:
        # Add the backend to Python path
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

        from app.core.supabase_client import get_supabase_client

        print("\n🔌 Testing Supabase Connection...")

        client = get_supabase_client()
        if not client:
            print("❌ Failed to create Supabase client")
            return False

        # Test a simple query
        result = client.table('users').select('count', count='exact').limit(0).execute()
        print("✅ Connection successful!")
        return True

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Supabase Credential Verification")
    print("=" * 50)

    # Check credentials
    credentials_ok = check_credentials()

    if credentials_ok:
        # Test connection
        connection_ok = test_connection()

        if connection_ok:
            print("\n🎉 Everything looks good! You're ready to proceed.")
        else:
            print("\n⚠️  Credentials look correct but connection failed.")
            print("   This might be normal if you haven't set up the database schema yet.")

    print("\n" + "=" * 50)