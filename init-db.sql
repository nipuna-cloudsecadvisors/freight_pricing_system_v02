-- Initialize database with required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if it doesn't exist (for development)
-- Note: This won't work in Docker init scripts, but useful for local setup
-- CREATE DATABASE freight_pricing;