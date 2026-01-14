-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable vector extension if available (for pgvector)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for performance
-- These will be created after tables are created by SQLAlchemy