-- Migration: 002_add_source_type_to_scans.sql
-- Add source_type column to scans table to distinguish between text and image/file uploads

ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'text'
CHECK (source_type IN ('text', 'image'));
