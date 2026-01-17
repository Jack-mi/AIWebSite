-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = auth0_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = auth0_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = auth0_id);

-- Websites table policies
-- For now, allow all authenticated users to access all websites
-- In production, you might want to add user_id to websites table for ownership
CREATE POLICY "Authenticated users can view websites" ON websites
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert websites" ON websites
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update websites" ON websites
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete websites" ON websites
    FOR DELETE USING (auth.role() = 'authenticated');

-- Analyses table policies
-- Users can access analyses for websites they have access to
CREATE POLICY "Authenticated users can view analyses" ON analyses
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = analyses.website_id
        )
    );

CREATE POLICY "Authenticated users can insert analyses" ON analyses
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = analyses.website_id
        )
    );

CREATE POLICY "Authenticated users can update analyses" ON analyses
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = analyses.website_id
        )
    );

-- Technology stacks table policies
CREATE POLICY "Authenticated users can view technology stacks" ON technology_stacks
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = technology_stacks.website_id
        )
    );

CREATE POLICY "Authenticated users can insert technology stacks" ON technology_stacks
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = technology_stacks.website_id
        )
    );

CREATE POLICY "Authenticated users can update technology stacks" ON technology_stacks
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = technology_stacks.website_id
        )
    );

-- Traffic data table policies
CREATE POLICY "Authenticated users can view traffic data" ON traffic_data
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = traffic_data.website_id
        )
    );

CREATE POLICY "Authenticated users can insert traffic data" ON traffic_data
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = traffic_data.website_id
        )
    );

CREATE POLICY "Authenticated users can update traffic data" ON traffic_data
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = traffic_data.website_id
        )
    );

-- Competitors table policies
CREATE POLICY "Authenticated users can view competitors" ON competitors
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = competitors.primary_website_id
        ) OR EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = competitors.competitor_website_id
        ))
    );

CREATE POLICY "Authenticated users can insert competitors" ON competitors
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = competitors.primary_website_id
        ) AND EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = competitors.competitor_website_id
        )
    );

CREATE POLICY "Authenticated users can update competitors" ON competitors
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = competitors.primary_website_id
        )
    );

-- Reports table policies
CREATE POLICY "Authenticated users can view reports" ON reports
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = reports.website_id
        )
    );

CREATE POLICY "Authenticated users can insert reports" ON reports
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = reports.website_id
        )
    );

CREATE POLICY "Authenticated users can update reports" ON reports
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = reports.website_id
        )
    );

CREATE POLICY "Authenticated users can delete reports" ON reports
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM websites w
            WHERE w.id = reports.website_id
        )
    );

-- Service role policies for backend operations
-- These allow the backend service to perform operations on behalf of users

-- Create a function to check if the current role is the service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.role() = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add service role policies for all tables
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (is_service_role());

CREATE POLICY "Service role can manage websites" ON websites
    FOR ALL USING (is_service_role());

CREATE POLICY "Service role can manage analyses" ON analyses
    FOR ALL USING (is_service_role());

CREATE POLICY "Service role can manage technology stacks" ON technology_stacks
    FOR ALL USING (is_service_role());

CREATE POLICY "Service role can manage traffic data" ON traffic_data
    FOR ALL USING (is_service_role());

CREATE POLICY "Service role can manage competitors" ON competitors
    FOR ALL USING (is_service_role());

CREATE POLICY "Service role can manage reports" ON reports
    FOR ALL USING (is_service_role());