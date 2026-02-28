-- Creates the tracking table if it somehow doesn't exist yet
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version character varying(255) NOT NULL PRIMARY KEY,
    statements text[],
    name character varying(255)
);
-- Inserts a fake record so Vercel skips the 0001 file during the build
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('0001', 'initial_schema')
ON CONFLICT (version) DO NOTHING;