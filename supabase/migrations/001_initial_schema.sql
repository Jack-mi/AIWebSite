-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create ENUM types
CREATE TYPE analysis_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');
CREATE TYPE relationship_type AS ENUM ('COMPETITOR', 'SIMILAR', 'RELATED');
CREATE TYPE report_type AS ENUM ('FULL_ANALYSIS', 'TECH_STACK', 'TRAFFIC_SUMMARY', 'COMPETITIVE_ANALYSIS');
CREATE TYPE export_format AS ENUM ('PDF', 'JSON', 'CSV');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    picture TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for users
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_email ON users(email);

-- Websites table
CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    last_analyzed TIMESTAMP WITH TIME ZONE,
    analysis_status analysis_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for websites
CREATE INDEX idx_websites_domain ON websites(domain);
CREATE INDEX idx_websites_analysis_status ON websites(analysis_status);
CREATE INDEX idx_websites_created_at ON websites(created_at);

-- Analyses table
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    status analysis_status DEFAULT 'PENDING',
    result JSONB,
    confidence_score DECIMAL(5,2),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analyses
CREATE INDEX idx_analyses_website_id ON analyses(website_id);
CREATE INDEX idx_analyses_analysis_type ON analyses(analysis_type);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);

-- Technology stack table
CREATE TABLE technology_stacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    technology VARCHAR(200) NOT NULL,
    version VARCHAR(50),
    confidence DECIMAL(5,2),
    detection_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for technology_stacks
CREATE INDEX idx_tech_stack_website_id ON technology_stacks(website_id);
CREATE INDEX idx_tech_stack_category ON technology_stacks(category);
CREATE INDEX idx_tech_stack_technology ON technology_stacks(technology);

-- Traffic data table
CREATE TABLE traffic_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    data_source VARCHAR(100) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    time_period VARCHAR(50),
    recorded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for traffic_data
CREATE INDEX idx_traffic_data_website_id ON traffic_data(website_id);
CREATE INDEX idx_traffic_data_source ON traffic_data(data_source);
CREATE INDEX idx_traffic_data_metric_type ON traffic_data(metric_type);
CREATE INDEX idx_traffic_data_recorded_at ON traffic_data(recorded_at);

-- Competitors table
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    competitor_website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,2),
    relationship_type relationship_type DEFAULT 'COMPETITOR',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for competitors
CREATE INDEX idx_competitors_primary_website_id ON competitors(primary_website_id);
CREATE INDEX idx_competitors_competitor_website_id ON competitors(competitor_website_id);
CREATE INDEX idx_competitors_similarity_score ON competitors(similarity_score);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    title VARCHAR(500),
    content JSONB,
    export_format export_format,
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for reports
CREATE INDEX idx_reports_website_id ON reports(website_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some useful functions for GIN indexes on JSONB columns
CREATE INDEX idx_analyses_result_gin ON analyses USING GIN (result);
CREATE INDEX idx_reports_content_gin ON reports USING GIN (content);

-- Add constraints for data integrity
ALTER TABLE competitors ADD CONSTRAINT chk_competitors_different_websites
    CHECK (primary_website_id != competitor_website_id);

-- Add some useful views for common queries
CREATE VIEW website_analysis_summary AS
SELECT
    w.id,
    w.url,
    w.domain,
    w.title,
    w.description,
    w.analysis_status,
    w.last_analyzed,
    COUNT(a.id) as total_analyses,
    COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) as completed_analyses,
    COUNT(CASE WHEN a.status = 'FAILED' THEN 1 END) as failed_analyses,
    w.created_at,
    w.updated_at
FROM websites w
LEFT JOIN analyses a ON w.id = a.website_id
GROUP BY w.id, w.url, w.domain, w.title, w.description, w.analysis_status, w.last_analyzed, w.created_at, w.updated_at;

-- Create view for technology stack summary
CREATE VIEW technology_stack_summary AS
SELECT
    ts.website_id,
    ts.category,
    COUNT(*) as tech_count,
    ARRAY_AGG(ts.technology ORDER BY ts.confidence DESC) as technologies,
    AVG(ts.confidence) as avg_confidence
FROM technology_stacks ts
GROUP BY ts.website_id, ts.category;