-- Preserve the visitor's original request independently of generated summaries
-- and editable action fields. Existing plans predate this captured provenance.
ALTER TABLE workflow_plans ADD COLUMN brief text NOT NULL DEFAULT '';
