-- Phase 2: add GGUF manifest reference to lora_artifacts
-- Nullable, non-breaking change.

alter table lora_artifacts
  add column if not exists gguf_manifest_path text;

comment on column lora_artifacts.gguf_manifest_path is
  'Storage path of the GGUF shard manifest (projects/{pid}/{jid}/gguf/manifest.json). NULL means GGUF export was not run for this artifact.';
