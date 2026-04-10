"""
Quality check CLI: compare base model vs base+LoRA adapter on the same prompts.

Usage:
    python scripts/quality_check.py \\
        --model-id Qwen/Qwen2.5-1.5B \\
        --adapter ./adapters/v1 \\
        --prompts test-data/quality_prompts.jsonl \\
        --output qa_report.md \\
        --device auto

Output is a Markdown report with side-by-side base/tuned generations and
unified diff for each prompt. Pure local — no RunPod, no Supabase required.
"""
from __future__ import annotations

import argparse
import difflib
import json
import sys
import time
from pathlib import Path
from typing import Iterable

try:
    import torch
    from peft import PeftModel
    from transformers import AutoModelForCausalLM, AutoTokenizer
except ImportError as e:
    print(
        f"[ERROR] missing dependency: {e}\n"
        "Install: pip install torch transformers peft",
        file=sys.stderr,
    )
    sys.exit(1)


def load_prompts(path: Path) -> list[str]:
    """Load prompts from a JSONL or plain text file."""
    if not path.exists():
        raise FileNotFoundError(f"Prompts file not found: {path}")
    prompts: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("{"):
            obj = json.loads(line)
            prompts.append(obj.get("prompt") or obj.get("text") or "")
        else:
            prompts.append(line)
    return [p for p in prompts if p]


def generate(
    model,
    tokenizer,
    prompt: str,
    max_new_tokens: int = 256,
) -> str:
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            temperature=1.0,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.pad_token_id or tokenizer.eos_token_id,
        )
    text = tokenizer.decode(out[0][inputs["input_ids"].shape[1] :], skip_special_tokens=True)
    return text.strip()


def inline_diff(base: str, tuned: str) -> str:
    """Return a unified diff block suitable for Markdown code fence."""
    base_lines = base.splitlines() or [""]
    tuned_lines = tuned.splitlines() or [""]
    diff = difflib.unified_diff(
        base_lines,
        tuned_lines,
        fromfile="base",
        tofile="tuned",
        lineterm="",
    )
    return "\n".join(diff) or "(no textual difference)"


def render_report(results: list[dict], model_id: str, adapter: str) -> str:
    lines = [
        f"# Quality Check Report",
        "",
        f"- Base model: `{model_id}`",
        f"- Adapter: `{adapter}`",
        f"- Prompts: {len(results)}",
        f"- Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "---",
        "",
    ]
    for i, r in enumerate(results, start=1):
        lines += [
            f"## Prompt {i}",
            "",
            "```",
            r["prompt"],
            "```",
            "",
            "### Base",
            "",
            "```",
            r["base"],
            "```",
            "",
            "### Tuned",
            "",
            "```",
            r["tuned"],
            "```",
            "",
            "### Diff",
            "",
            "```diff",
            r["diff"],
            "```",
            "",
            "---",
            "",
        ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-id", default="Qwen/Qwen2.5-1.5B")
    parser.add_argument("--adapter", required=True, help="Path to LoRA adapter dir")
    parser.add_argument("--prompts", required=True, help="Path to prompts JSONL/txt")
    parser.add_argument("--output", required=True, help="Output Markdown path")
    parser.add_argument("--device", default="auto", choices=["auto", "cuda", "cpu"])
    parser.add_argument("--max-new-tokens", type=int, default=256)
    parser.add_argument("--limit", type=int, default=0, help="Limit prompts (0=all)")
    args = parser.parse_args()

    prompts_path = Path(args.prompts)
    output_path = Path(args.output)
    adapter_path = Path(args.adapter)
    if not adapter_path.exists():
        print(f"[ERROR] adapter not found: {adapter_path}", file=sys.stderr)
        return 1

    prompts = load_prompts(prompts_path)
    if args.limit > 0:
        prompts = prompts[: args.limit]
    if not prompts:
        print("[ERROR] no prompts loaded", file=sys.stderr)
        return 1

    device_map = "auto"
    if args.device == "cpu":
        device_map = {"": "cpu"}
    elif args.device == "cuda":
        device_map = {"": 0}

    print(f"[INFO] loading tokenizer {args.model_id}")
    tokenizer = AutoTokenizer.from_pretrained(args.model_id, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Load base only, run all prompts, unload, then load tuned.
    # Avoids holding two full base models in VRAM simultaneously.
    dtype = torch.float16 if args.device != "cpu" else torch.float32

    print(f"[INFO] loading base model {args.model_id}")
    base_model = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        torch_dtype=dtype,
        device_map=device_map,
        trust_remote_code=True,
    )
    base_model.eval()

    base_outputs: list[str] = []
    for i, prompt in enumerate(prompts, start=1):
        print(f"[INFO] [base {i}/{len(prompts)}] generating...")
        base_outputs.append(generate(base_model, tokenizer, prompt, args.max_new_tokens))

    # Free base model VRAM before loading tuned
    del base_model
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    print(f"[INFO] loading base again + adapter {adapter_path}")
    tuned_base = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        torch_dtype=dtype,
        device_map=device_map,
        trust_remote_code=True,
    )
    tuned_model = PeftModel.from_pretrained(tuned_base, str(adapter_path))
    tuned_model.eval()

    results = []
    for i, prompt in enumerate(prompts, start=1):
        print(f"[INFO] [tuned {i}/{len(prompts)}] generating...")
        tuned_out = generate(tuned_model, tokenizer, prompt, args.max_new_tokens)
        results.append(
            {
                "prompt": prompt,
                "base": base_outputs[i - 1],
                "tuned": tuned_out,
                "diff": inline_diff(base_outputs[i - 1], tuned_out),
            }
        )

    del tuned_model, tuned_base
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        render_report(results, args.model_id, str(adapter_path)),
        encoding="utf-8",
    )
    print(f"[DONE] report written to {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
