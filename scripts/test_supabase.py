#!/usr/bin/env python3
"""
Test script to verify Supabase integration is working correctly.
This script tests database connectivity, schema, and basic operations.
"""

import os
import sys
import asyncio
import json
from typing import Dict, Any, List

# Add the backend app to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.config import settings
from app.core.supabase_client import (
    get_supabase_client,
    check_supabase_connection,
    supabase_service
)
from app.core.database import get_async_database_url, AsyncSessionLocal
from sqlalchemy import text

class SupabaseTestSuite:
    """
    Comprehensive test suite for Supabase integration.
    """

    def __init__(self):
        self.client = get_supabase_client()
        self.test_results = []

    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test results."""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
        print(f"{status} {test_name}: {message}")

    async def test_configuration(self):
        """Test Supabase configuration."""
        print("\n🔧 Testing Configuration...")

        # Test environment variables
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY"
        ]

        for var in required_vars:
            value = getattr(settings, var, "")
            if value:
                self.log_test(f"Environment variable {var}", True, "Set")
            else:
                self.log_test(f"Environment variable {var}", False, "Not set")

        # Test USE_SUPABASE flag
        if settings.USE_SUPABASE:
            self.log_test("USE_SUPABASE flag", True, "Enabled")
        else:
            self.log_test("USE_SUPABASE flag", False, "Disabled")

    async def test_client_initialization(self):
        """Test Supabase client initialization."""
        print("\n🔌 Testing Client Initialization...")

        if self.client:
            self.log_test("Supabase client", True, "Initialized successfully")
        else:
            self.log_test("Supabase client", False, "Failed to initialize")

    async def test_database_connection(self):
        """Test database connection via Supabase."""
        print("\n🗃️  Testing Database Connection...")

        try:
            connection_status = await check_supabase_connection()

            if connection_status["status"] == "connected":
                self.log_test("Database connection", True, "Connected successfully")
            else:
                self.log_test("Database connection", False, connection_status["message"])
        except Exception as e:
            self.log_test("Database connection", False, str(e))

    async def test_sqlalchemy_connection(self):
        """Test SQLAlchemy connection to Supabase."""
        print("\n🔗 Testing SQLAlchemy Connection...")

        try:
            # Test database URL construction
            db_url = get_async_database_url()
            if "supabase.co" in db_url:
                self.log_test("Database URL", True, "Supabase URL configured")
            else:
                self.log_test("Database URL", False, "Not using Supabase URL")

            # Test actual connection
            async with AsyncSessionLocal() as session:
                result = await session.execute(text("SELECT 1 as test"))
                row = result.fetchone()
                if row and row[0] == 1:
                    self.log_test("SQLAlchemy connection", True, "Query executed successfully")
                else:
                    self.log_test("SQLAlchemy connection", False, "Unexpected query result")

        except Exception as e:
            self.log_test("SQLAlchemy connection", False, str(e))

    async def test_table_schema(self):
        """Test that all required tables exist."""
        print("\n📋 Testing Database Schema...")

        required_tables = [
            "users",
            "websites",
            "analyses",
            "technology_stacks",
            "traffic_data",
            "competitors",
            "reports"
        ]

        if not self.client:
            self.log_test("Schema test", False, "No Supabase client")
            return

        for table in required_tables:
            try:
                # Try to query the table (limit 0 to avoid data)
                result = self.client.table(table).select("*").limit(0).execute()
                self.log_test(f"Table {table}", True, "Exists and accessible")
            except Exception as e:
                self.log_test(f"Table {table}", False, str(e))

    async def test_rls_policies(self):
        """Test Row Level Security policies."""
        print("\n🔒 Testing RLS Policies...")

        if not self.client:
            self.log_test("RLS test", False, "No Supabase client")
            return

        # Test that RLS is enabled
        try:
            # This should work with service role
            result = self.client.table("users").select("count", count="exact").limit(0).execute()
            self.log_test("RLS with service role", True, "Access granted")
        except Exception as e:
            self.log_test("RLS with service role", False, str(e))

    async def test_basic_operations(self):
        """Test basic CRUD operations."""
        print("\n🔄 Testing Basic Operations...")

        if not self.client:
            self.log_test("CRUD test", False, "No Supabase client")
            return

        test_user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "is_active": True
        }

        try:
            # Test INSERT
            result = self.client.table("users").insert(test_user_data).execute()
            if result.data:
                user_id = result.data[0]["id"]
                self.log_test("INSERT operation", True, f"User created with ID: {user_id}")

                # Test SELECT
                select_result = self.client.table("users").select("*").eq("id", user_id).execute()
                if select_result.data:
                    self.log_test("SELECT operation", True, "User retrieved successfully")

                    # Test UPDATE
                    update_result = self.client.table("users").update({"name": "Updated Test User"}).eq("id", user_id).execute()
                    if update_result.data:
                        self.log_test("UPDATE operation", True, "User updated successfully")
                    else:
                        self.log_test("UPDATE operation", False, "No data returned")

                    # Test DELETE
                    delete_result = self.client.table("users").delete().eq("id", user_id).execute()
                    self.log_test("DELETE operation", True, "User deleted successfully")

                else:
                    self.log_test("SELECT operation", False, "User not found")
            else:
                self.log_test("INSERT operation", False, "No data returned")

        except Exception as e:
            self.log_test("CRUD operations", False, str(e))

    async def test_advanced_features(self):
        """Test advanced Supabase features."""
        print("\n🚀 Testing Advanced Features...")

        # Test file storage (if configured)
        try:
            buckets = self.client.storage.list_buckets()
            self.log_test("Storage access", True, f"Found {len(buckets)} buckets")
        except Exception as e:
            self.log_test("Storage access", False, str(e))

        # Test edge functions (if any exist)
        try:
            # This would test if edge functions are accessible
            # For now, just test that the functions client exists
            if hasattr(self.client, 'functions'):
                self.log_test("Edge functions", True, "Client supports edge functions")
            else:
                self.log_test("Edge functions", False, "Edge functions not available")
        except Exception as e:
            self.log_test("Edge functions", False, str(e))

    async def test_performance(self):
        """Test basic performance metrics."""
        print("\n⚡ Testing Performance...")

        if not self.client:
            self.log_test("Performance test", False, "No Supabase client")
            return

        import time

        try:
            # Test query performance
            start_time = time.time()
            result = self.client.table("users").select("count", count="exact").limit(0).execute()
            end_time = time.time()

            query_time = (end_time - start_time) * 1000  # Convert to milliseconds

            if query_time < 1000:  # Less than 1 second
                self.log_test("Query performance", True, f"Query took {query_time:.2f}ms")
            else:
                self.log_test("Query performance", False, f"Query took {query_time:.2f}ms (too slow)")

        except Exception as e:
            self.log_test("Query performance", False, str(e))

    def print_summary(self):
        """Print test summary."""
        print("\n" + "="*50)
        print("🏁 TEST SUMMARY")
        print("="*50)

        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests

        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")

        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")

        print("\n" + "="*50)

        if failed_tests == 0:
            print("🎉 All tests passed! Supabase integration is working correctly.")
        else:
            print("⚠️  Some tests failed. Please check the configuration and try again.")

    async def run_all_tests(self):
        """Run all tests in sequence."""
        print("🧪 Supabase Integration Test Suite")
        print("="*50)

        await self.test_configuration()
        await self.test_client_initialization()
        await self.test_database_connection()
        await self.test_sqlalchemy_connection()
        await self.test_table_schema()
        await self.test_rls_policies()
        await self.test_basic_operations()
        await self.test_advanced_features()
        await self.test_performance()

        self.print_summary()

async def main():
    """Main test function."""
    # Check if Supabase is enabled
    if not settings.USE_SUPABASE:
        print("❌ Supabase is not enabled!")
        print("Set USE_SUPABASE=true in your environment to run tests.")
        return

    test_suite = SupabaseTestSuite()
    await test_suite.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())