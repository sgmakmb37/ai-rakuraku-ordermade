# Phase 2 実装計画 — AIらくらくオーダーメイド

スコープ: GGUF quantization / Continue training (resume) / Frontend PDF 修復 / 品質テスト CLI。本番有効化は含まない。

## 実行順序

| 順 | タスク | 優先度 | 理由 |
|---|---|---|---|
| 1 | **Frontend PDF encoding 修復** | **High** | 現行バグで学習データが壊れている。FE + API の独立変更で Worker に波及しない |
| 2 | **Continue training (resume)** | **High** | 既存 DB schema と Storage パス構造で完結。Worker ローカル変更のみ |
| 3 | **品質テスト CLI** | **Medium** | base vs base+adapter を比較するローカル CLI。Worker/FE/API 変更ゼロ |
| 4 | **GGUF quantization** | **Medium** | Docker image 1GB増、Supabase 50MB 制限と衝突、sharding 設計が必要 |

---

## Task 1: Frontend PDF encoding 修復 (High)

**問題箇所**: `apps/web/src/app/dashboard/new/page.tsx:104` で全拡張子 `reader.readAsText(file)`。PDF binary を UTF-8 として文字列化し DB に garbage 保存。

**設計**: PDF は FE で触らず multipart で API へ。サーバーで pymupdf 抽出。他拡張子は現行維持。

**手順**:
1. `apps/api/app/routers/sources.py` に `POST /projects/{id}/sources/file` 追加。`UploadFile = File(...)`、拡張子ホワイトリスト、5MB guard、pymupdf で PDF 抽出。
2. 既存 `add_source` と共通ヘルパ `_insert_source()` を内部化。
3. `apps/web/src/lib/api.ts` に `addSourceFile(projectId, file)` 追加（FormData）。
4. `page.tsx` の `handleFileChange` で PDF は FileReader 通さず `File` object 保持。`handleStart` 内で PDF だけ `addSourceFile` を呼ぶ分岐。
5. 検証: 日本語 PDF → 学習 → `data_sources.content` が読める日本語になる。

**依存**: なし。破壊的変更なし。

---

## Task 2: Continue Training Resume (High)

**問題箇所**: `apps/worker/worker/main.py:174` で `existing_lora_path = None` 固定。取得した latest artifact を使っていない。`pipeline.train_lora` も `get_peft_model` の後に `PeftModel.from_pretrained` を上書きする順序が不正。

**手順**:
1. `train_lora` 分岐: `existing_lora_path` ありなら `get_peft_model` スキップ → `PeftModel.from_pretrained(model, existing_lora_path, is_trainable=True)`。
2. `main.process_job`: 既存コードの `lora_artifacts_result.data` があれば storage から prefix 全ファイルを list → 各 `.download()` → `Path(config.MODEL_CACHE_DIR)/f"resume_{job_id}"/` に書き出し → `existing_lora_path = str(resume_dir)` を渡す。失敗時は warning + None fallback。
3. version increment は既存動作維持。
4. テスト: 同じ project に 2回学習 → 2回目ログに `[RESUME]` → v2 artifact 生成。

**依存**: なし（Worker 内完結）。

---

## Task 3: 品質テスト CLI (Medium)

**要件**: base vs base+adapter inference 比較、diff 可視化、ローカル実行。

**手順**:
1. `apps/worker/scripts/quality_check.py` 新規作成。独立スクリプト、`worker.config` 不要。
2. argparse: `--model-id`, `--adapter`, `--prompts`, `--output`, `--device`.
3. base と `PeftModel.from_pretrained(base, adapter)` の両方で `generate(max_new_tokens=256, do_sample=False)` 実行。
4. `difflib.unified_diff` で比較、markdown 出力。
5. サンプル `test-data/quality_prompts.jsonl` 10問。

**依存**: なし。破壊的変更なし。

---

## Task 4: GGUF Quantization (Medium)

**制約**: Qwen2.5-1.5B q4_k_m ≈ 1GB、Supabase 50MB/file。**Shard 分割 + manifest 方式**採用。feature flag `ENABLE_GGUF_EXPORT=0` (default off)。

**手順**:
1. Dockerfile に `apt install cmake build-essential` + `git clone ggerganov/llama.cpp && cmake build` + `llama-quantize` + `convert_hf_to_gguf.py`。image +300MB。
2. `pipeline.quantize_model` 実装: base fp16 load → PeftModel merge_and_unload → save_pretrained → llama.cpp convert → quantize q4_k_m。
3. `main.process_job` feature flag 内で GGUF 生成 → 48MB chunk 分割 → `gguf/part_NNN.bin` + `manifest.json` upload。
4. Migration: `003_add_gguf_manifest.sql` - `alter table lora_artifacts add column gguf_manifest_path text;`
5. `/download?format=adapter|gguf` で分岐。

**リスク**: llama.cpp version drift、GPU メモリ (Qwen fp16 ~3GB)、build time +5min。

**依存**: Task 2 完了後推奨（最新 adapter を GGUF 化が自然）。

---

## 横断事項

- DB migration: 1カラム追加のみ（非破壊）
- Docker rebuild: Task 4 のみ必要
- Feature flag: `ENABLE_GGUF_EXPORT=0` で GGUF 機能 gate
- Rollback: 各タスク独立、1ファイル revert で戻せる

## 優先度まとめ

| Task | 優先度 | Image rebuild | DB migration |
|---|---|---|---|
| 1. PDF encoding | High | No | No |
| 2. Continue training | High | No | No |
| 3. 品質テスト CLI | Medium | No | No |
| 4. GGUF quantization | Medium | **Yes** | Yes (1col) |
