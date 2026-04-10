-- Migrate from Gemma 3n to Gemma 4 model types
-- Update any existing rows first (if any)
UPDATE projects SET model_type = 'gemma-4-e2b' WHERE model_type = 'gemma-3n-e2b';
UPDATE projects SET model_type = 'gemma-4-e4b' WHERE model_type = 'gemma-3n-e4b';

-- Replace CHECK constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_model_type_check;
ALTER TABLE projects ADD CONSTRAINT projects_model_type_check
  CHECK (model_type IN ('qwen2.5-1.5b', 'qwen2.5-3b', 'gemma-4-e2b', 'gemma-4-e4b'));
