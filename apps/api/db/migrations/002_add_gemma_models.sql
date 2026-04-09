-- Migration: Add Gemma 3n E2B/E4B model support
-- 2026-04-09

alter table projects drop constraint if exists projects_model_type_check;
alter table projects add constraint projects_model_type_check
  check (model_type in ('qwen2.5-1.5b', 'qwen2.5-3b', 'gemma-3n-e2b', 'gemma-3n-e4b'));
