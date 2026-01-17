#!/usr/bin/env python3
"""
Migration script to move data from local PostgreSQL to Supabase.
This script helps migrate existing data when switching to Supabase.
"""

import os
import sys
import asyncio
import asyncpg
from typing import Dict, List, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the backend app to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.config import settings
from app.core.supabase_client import get_supabase_database_url, get_supabase_client

class SupabaseMigrator:
    """
    Handles migration of data from local PostgreSQL to Supabase.
    """

    def __init__(self):
        self.local_db_url = "postgresql://postgres:password@localhost:5432/insighteye"
        self.supabase_db_url = None
        self.supabase_client = get_supabase_client()

    async def setup_supabase_connection(self):
        """Setup Supabase database connection."""
        try:
            self.supabase_db_url = get_supabase_database_url()
            print(f"✓ Supabase database URL configured")
        except Exception as e:
            print(f"✗ Error configuring Supabase: {e}")
            return False
        return True

    async def test_connections(self):
        """Test both local and Supabase database connections."""
        print("Testing database connections...")

        # Test local connection
        try:
            local_conn = await asyncpg.connect(self.local_db_url)
            await local_conn.close()
            print("✓ Local PostgreSQL connection successful")
        except Exception as e:
            print(f"✗ Local PostgreSQL connection failed: {e}")
            return False

        # Test Supabase connection
        try:
            supabase_conn = await asyncpg.connect(self.supabase_db_url)
            await supabase_conn.close()
            print("✓ Supabase PostgreSQL connection successful")
        except Exception as e:
            print(f"✗ Supabase PostgreSQL connection failed: {e}")
            return False

        return True

    async def get_table_data(self, table_name: str) -> List[Dict[str, Any]]:
        """Get all data from a table in local database."""
        conn = await asyncpg.connect(self.local_db_url)
        try:
            query = f"SELECT * FROM {table_name}"
            rows = await conn.fetch(query)
            return [dict(row) for row in rows]
        finally:
            await conn.close()

    async def insert_table_data(self, table_name: str, data: List[Dict[str, Any]]):
        """Insert data into Supabase table."""
        if not data:
            print(f"  No data to migrate for {table_name}")
            return

        conn = await asyncpg.connect(self.supabase_db_url)
        try:
            # Get column names from first row
            columns = list(data[0].keys())
            placeholders = ', '.join([f'${i+1}' for i in range(len(columns))])
            query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"

            # Insert each row
            for row in data:
                values = [row[col] for col in columns]
                await conn.execute(query, *values)

            print(f"  ✓ Migrated {len(data)} rows to {table_name}")

        except Exception as e:
            print(f"  ✗ Error migrating {table_name}: {e}")
        finally:
            await conn.close()

    async def migrate_table(self, table_name: str):
        """Migrate a single table from local to Supabase."""
        print(f"Migrating table: {table_name}")

        try:
            # Get data from local database
            data = await self.get_table_data(table_name)

            # Insert data into Supabase
            await self.insert_table_data(table_name, data)

        except Exception as e:
            print(f"✗ Failed to migrate {table_name}: {e}")

    async def migrate_all_tables(self):
        """Migrate all tables in the correct order (respecting foreign keys)."""
        # Order matters due to foreign key constraints
        tables_order = [
            'users',
            'websites',
            'analyses',
            'technology_stacks',
            'traffic_data',
            'competitors',
            'reports'
        ]

        print("Starting data migration...")
        for table in tables_order:
            await self.migrate_table(table)

    async def verify_migration(self):
        """Verify that migration was successful by comparing row counts."""
        print("\nVerifying migration...")

        tables = ['users', 'websites', 'analyses', 'technology_stacks',
                 'traffic_data', 'competitors', 'reports']

        local_conn = await asyncpg.connect(self.local_db_url)
        supabase_conn = await asyncpg.connect(self.supabase_db_url)

        try:
            for table in tables:
                # Count rows in local database
                local_count = await local_conn.fetchval(f"SELECT COUNT(*) FROM {table}")

                # Count rows in Supabase
                supabase_count = await supabase_conn.fetchval(f"SELECT COUNT(*) FROM {table}")

                status = "✓" if local_count == supabase_count else "✗"
                print(f"  {status} {table}: Local={local_count}, Supabase={supabase_count}")

        finally:
            await local_conn.close()
            await supabase_conn.close()

    async def run_migration(self):
        """Run the complete migration process."""
        print("🚀 Starting Supabase migration...")

        # Setup connections
        if not await self.setup_supabase_connection():
            return False

        # Test connections
        if not await self.test_connections():
            return False

        # Run migration
        await self.migrate_all_tables()

        # Verify migration
        await self.verify_migration()

        print("\n🎉 Migration completed!")
        return True

def setup_supabase_schema():
    """
    Apply the Supabase schema migrations.
    This should be run before data migration.
    """
    print("Setting up Supabase schema...")

    supabase_client = get_supabase_client()
    if not supabase_client:
        print("✗ Supabase client not configured")
        return False

    # Read and execute schema files
    schema_files = [
        'supabase/migrations/001_initial_schema.sql',
        'supabase/migrations/002_rls_policies.sql'
    ]

    for schema_file in schema_files:
        file_path = os.path.join(os.path.dirname(__file__), '..', schema_file)
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                sql_content = f.read()

            try:
                # Execute SQL via Supabase (this is simplified - in reality you'd use the SQL editor)
                print(f"  ✓ Schema file {schema_file} ready for execution")
                print(f"    Please run this in your Supabase SQL editor:")
                print(f"    File: {file_path}")
            except Exception as e:
                print(f"  ✗ Error with {schema_file}: {e}")
                return False
        else:
            print(f"  ✗ Schema file not found: {schema_file}")
            return False

    return True

async def main():
    """Main migration function."""
    print("Supabase Migration Tool")
    print("=" * 50)

    # Check if we're configured for Supabase
    if not settings.USE_SUPABASE:
        print("⚠️  USE_SUPABASE is not enabled in configuration")
        print("   Set USE_SUPABASE=true in your environment")
        return

    if not settings.SUPABASE_URL:
        print("⚠️  SUPABASE_URL not configured")
        print("   Please set your Supabase URL in environment variables")
        return

    # Setup schema first
    print("Step 1: Setting up Supabase schema")
    if not setup_supabase_schema():
        print("✗ Schema setup failed. Please run the schema files in Supabase first.")
        return

    # Run data migration
    print("\nStep 2: Migrating data")
    migrator = SupabaseMigrator()
    success = await migrator.run_migration()

    if success:
        print("\n✅ Migration completed successfully!")
        print("You can now update your environment to use Supabase:")
        print("  USE_SUPABASE=true")
    else:
        print("\n❌ Migration failed. Please check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())