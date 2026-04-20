import os
from pathlib import Path
from typing import Optional

import pymupdf
import torch
from datasets import Dataset
from peft import (
    LoraConfig,
    PeftModel,
    get_peft_model,
    prepare_model_for_kbit_training,
)
from trafilatura import extract, fetch_url
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
)
from trl import SFTConfig, SFTTrainer


def _setup_tokenizer_special_tokens(tokenizer, model_id: str, is_gemma: bool) -> None:
    """
    Configure special tokens for different model families with proper error handling.

    Args:
        tokenizer: The tokenizer instance to configure
        model_id: The model identifier string
        is_gemma: Whether this is a Gemma model
    """
    model_id_lower = model_id.lower()

    # Determine model family for special token configuration
    is_qwen = any(qwen_variant in model_id_lower for qwen_variant in ["qwen", "qwen2", "qwen2.5"])
    is_llama = "llama" in model_id_lower
    is_mistral = "mistral" in model_id_lower

    try:
        # Configure EOS token based on model family
        eos_configured = False

        if is_qwen:
            # Qwen models commonly use <|im_end|> or <|endoftext|> depending on version
            if hasattr(tokenizer, 'im_end_id') and tokenizer.im_end_id is not None:
                # Qwen2.5 instruct models use <|im_end|> for conversations
                if not tokenizer.eos_token or tokenizer.eos_token_id != tokenizer.im_end_id:
                    tokenizer.eos_token = "<|im_end|>"
                    eos_configured = True
            elif "<|endoftext|>" in tokenizer.get_vocab():
                # Base Qwen models often use <|endoftext|>
                tokenizer.eos_token = "<|endoftext|>"
                eos_configured = True
            elif "</s>" in tokenizer.get_vocab():
                # Fallback for some Qwen variants
                tokenizer.eos_token = "</s>"
                eos_configured = True

        elif is_gemma:
            # Gemma models use <end_of_turn> or <eos>
            if "<end_of_turn>" in tokenizer.get_vocab():
                tokenizer.eos_token = "<end_of_turn>"
                eos_configured = True
            elif "<eos>" in tokenizer.get_vocab():
                tokenizer.eos_token = "<eos>"
                eos_configured = True

        elif is_llama or is_mistral:
            # Llama and Mistral typically use </s>
            if "</s>" in tokenizer.get_vocab():
                tokenizer.eos_token = "</s>"
                eos_configured = True

        # Generic fallback if model-specific config failed
        if not eos_configured:
            vocab = tokenizer.get_vocab()
            # Try common EOS tokens in order of preference
            common_eos_tokens = ["</s>", "<|endoftext|>", "<eos>", "<end>"]
            for candidate in common_eos_tokens:
                if candidate in vocab:
                    tokenizer.eos_token = candidate
                    eos_configured = True
                    break

        # Final validation - ensure we have a valid EOS token
        if not tokenizer.eos_token or tokenizer.eos_token == "<EOS_TOKEN>":
            # Last resort: add a custom EOS token if none exists
            if hasattr(tokenizer, 'add_special_tokens'):
                special_tokens = {"eos_token": "</s>"}
                tokenizer.add_special_tokens(special_tokens)
                print(f"[WARNING] Added custom EOS token '</s>' for {model_id}", flush=True)
            else:
                # Force set a default
                tokenizer.eos_token = "</s>"
                print(f"[WARNING] Force-set EOS token '</s>' for {model_id}", flush=True)

        # Configure padding token
        if tokenizer.pad_token is None:
            # Try using EOS token as pad token (common practice)
            tokenizer.pad_token = tokenizer.eos_token

            # For some models, we might need to add a dedicated pad token
            if is_qwen and hasattr(tokenizer, 'add_special_tokens'):
                pass

        # Verify configuration
        if not tokenizer.eos_token:
            raise ValueError(f"Failed to configure EOS token for {model_id}")
        if not tokenizer.pad_token:
            raise ValueError(f"Failed to configure PAD token for {model_id}")

        print(
            f"[TOKENIZER] {model_id} - EOS: '{tokenizer.eos_token}' "
            f"(ID: {getattr(tokenizer, 'eos_token_id', 'N/A')}), "
            f"PAD: '{tokenizer.pad_token}' "
            f"(ID: {getattr(tokenizer, 'pad_token_id', 'N/A')})",
            flush=True
        )

    except Exception as e:
        print(f"[ERROR] Tokenizer setup failed for {model_id}: {e}", flush=True)
        # Emergency fallback
        tokenizer.eos_token = "</s>" if not tokenizer.eos_token else tokenizer.eos_token
        tokenizer.pad_token = tokenizer.eos_token if not tokenizer.pad_token else tokenizer.pad_token
        print(f"[FALLBACK] Using EOS='{tokenizer.eos_token}', PAD='{tokenizer.pad_token}'", flush=True)


def _validate_tokenizer_config(tokenizer, model_id: str) -> None:
    """
    Validate tokenizer configuration before training starts.
    Helps catch issues early rather than during training.

    Args:
        tokenizer: Configured tokenizer instance
        model_id: Model identifier for error reporting
    """
    issues = []

    # Check EOS token
    if not tokenizer.eos_token:
        issues.append("Missing EOS token")
    elif tokenizer.eos_token == "<EOS_TOKEN>":
        issues.append("EOS token not properly resolved (still <EOS_TOKEN>)")
    else:
        try:
            # Test that EOS token can be encoded
            eos_encoded = tokenizer.encode(tokenizer.eos_token, add_special_tokens=False)
            if not eos_encoded:
                issues.append(f"EOS token '{tokenizer.eos_token}' cannot be encoded")
        except Exception as e:
            issues.append(f"EOS token encoding failed: {e}")

    # Check PAD token
    if not tokenizer.pad_token:
        issues.append("Missing PAD token")
    else:
        try:
            # Test that PAD token can be encoded
            pad_encoded = tokenizer.encode(tokenizer.pad_token, add_special_tokens=False)
            if not pad_encoded:
                issues.append(f"PAD token '{tokenizer.pad_token}' cannot be encoded")
        except Exception as e:
            issues.append(f"PAD token encoding failed: {e}")

    # Check token IDs
    if hasattr(tokenizer, 'eos_token_id') and tokenizer.eos_token_id is None:
        issues.append("EOS token ID is None")
    if hasattr(tokenizer, 'pad_token_id') and tokenizer.pad_token_id is None:
        issues.append("PAD token ID is None")

    # Test basic tokenization
    try:
        test_text = "Hello world"
        encoded = tokenizer.encode(test_text)
        decoded = tokenizer.decode(encoded, skip_special_tokens=True)
        if not decoded.strip():
            issues.append("Basic tokenization test failed - empty decode result")
    except Exception as e:
        issues.append(f"Basic tokenization test failed: {e}")

    if issues:
        error_msg = f"Tokenizer validation failed for {model_id}:\n" + "\n".join(f"- {issue}" for issue in issues)
        print(f"[VALIDATION_ERROR] {error_msg}", flush=True)
        raise ValueError(error_msg)

    print(f"[VALIDATION_OK] Tokenizer configuration validated for {model_id}", flush=True)


def extract_text(source_type: str, source: str) -> str:
    """
    Extract text from URL or file.

    Args:
        source_type: "url" or "file"
        source: URL or file path

    Returns:
        Extracted text content
    """
    if source_type == "url":
        downloaded = fetch_url(source)
        text = extract(downloaded)
        return text or ""

    # source_type == "file"
    path = Path(source)

    if path.suffix.lower() == ".pdf":
        doc = pymupdf.open(source)
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    # .txt, .csv, .json or other text formats
    with open(source, "r", encoding="utf-8") as f:
        return f.read()


def chunk_text(text: str, chunk_size: int = 1024, overlap: int = 128) -> list[str]:
    """
    Split text into overlapping chunks.

    Args:
        text: Input text to chunk
        chunk_size: Target size of each chunk
        overlap: Overlap between chunks

    Returns:
        List of text chunks
    """
    chunks = []

    # Split by paragraphs first
    paragraphs = text.split("\n\n")

    current_chunk = ""

    for para in paragraphs:
        # If adding this paragraph exceeds chunk_size, finalize current chunk
        if current_chunk and len(current_chunk) + len(para) + 2 > chunk_size:
            # If current chunk is large, split it further
            if len(current_chunk) > chunk_size:
                # Token-based splitting for large paragraphs
                words = current_chunk.split()
                temp_chunk = ""
                for word in words:
                    if len(temp_chunk) + len(word) + 1 > chunk_size:
                        if temp_chunk:
                            chunks.append(temp_chunk)
                        temp_chunk = word
                    else:
                        temp_chunk += " " + word if temp_chunk else word
                if temp_chunk:
                    chunks.append(temp_chunk)
            else:
                chunks.append(current_chunk)

            # Start new chunk with overlap
            if chunks and overlap > 0:
                current_chunk = chunks[-1][-overlap:] + "\n\n" + para
            else:
                current_chunk = para
        else:
            current_chunk += ("\n\n" if current_chunk else "") + para

    if current_chunk:
        chunks.append(current_chunk)

    # Remove empty chunks
    chunks = [c for c in chunks if c.strip()]

    return chunks


def filter_chunks(chunks: list[str], min_length: int = 50) -> list[str]:
    """
    Filter out short, empty or duplicate chunks.

    Args:
        chunks: List of text chunks
        min_length: Minimum chunk length

    Returns:
        Filtered list of chunks
    """
    seen = set()
    filtered = []

    for chunk in chunks:
        # Skip empty or whitespace-only chunks
        if not chunk.strip():
            continue

        # Skip short chunks
        if len(chunk) < min_length:
            continue

        # Skip duplicates
        if chunk in seen:
            continue

        seen.add(chunk)
        filtered.append(chunk)

    return filtered


def train_lora(
    model_id: str,
    train_texts: list[str],
    output_dir: str,
    existing_lora_path: Optional[str] = None,
    max_steps: int = 60,
) -> str:
    """
    Train LoRA adapter using vanilla transformers + peft + trl (no unsloth).
    Avoids unsloth's monkey-patching incompatibility with trl >= 0.18.

    Args:
        model_id: Base model identifier (HuggingFace hub id)
        train_texts: List of training texts
        output_dir: Output directory for adapter
        existing_lora_path: Optional path to existing LoRA for continued training
        max_steps: Maximum training steps

    Returns:
        Path to trained adapter
    """
    is_gemma = "gemma" in model_id.lower()

    # Model-family-specific compute dtype: Gemma prefers bf16, fallback to fp16
    gpu_supports_bf16 = torch.cuda.is_available() and torch.cuda.is_bf16_supported()
    compute_dtype = torch.bfloat16 if (is_gemma and gpu_supports_bf16) else torch.float16
    quant_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=compute_dtype,
        bnb_4bit_use_double_quant=True,
    )

    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        trust_remote_code=True,
    )

    # Enhanced EOS token configuration for model families
    _setup_tokenizer_special_tokens(tokenizer, model_id, is_gemma)

    import sys
    import transformers, trl, peft
    print(
        f"[VERSIONS] python={sys.version.split()[0]} "
        f"transformers={transformers.__version__} trl={trl.__version__} "
        f"peft={peft.__version__} model={model_id} eos='{tokenizer.eos_token}'",
        flush=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=quant_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=compute_dtype,
    )
    model = prepare_model_for_kbit_training(model)

    if existing_lora_path:
        print(f"[RESUME] loading existing LoRA adapter from {existing_lora_path}", flush=True)
        model = PeftModel.from_pretrained(
            model, existing_lora_path, is_trainable=True
        )
    else:
        # Model-family-specific LoRA config
        if is_gemma:
            # Gemma 4 uses Gemma4ClippableLinear; only "all-linear" works with PEFT.
            # r=4 keeps adapter under 50MB (Supabase free tier limit). r=16 → 101MB.
            lora_config = LoraConfig(
                r=4,
                lora_alpha=8,
                lora_dropout=0.05,
                target_modules="all-linear",
                bias="none",
                task_type="CAUSAL_LM",
            )
        else:
            # Qwen: r=8, attention-only, keeps adapter ~14MB
            lora_config = LoraConfig(
                r=8,
                lora_alpha=16,
                lora_dropout=0.0,
                target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
                bias="none",
                task_type="CAUSAL_LM",
            )
        model = get_peft_model(model, lora_config)

    dataset = Dataset.from_dict({"text": train_texts})

    # Model-family-specific training hyperparameters
    if is_gemma:
        batch_size, lr, use_bf16 = 1, 5e-5, gpu_supports_bf16
    else:
        batch_size, lr, use_bf16 = 2, 2e-4, False

    sft_config = SFTConfig(
        output_dir=output_dir,
        max_steps=max_steps,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        learning_rate=lr,
        fp16=not use_bf16,
        bf16=use_bf16,
        logging_steps=5,
        optim="paged_adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="constant" if is_gemma else "linear",
        seed=3407,
        save_steps=max_steps,
        max_length=2048,
        packing=False,
        dataset_text_field="text",
        report_to=[],
        remove_unused_columns=True,
    )
    # Validate tokenizer configuration before training
    _validate_tokenizer_config(tokenizer, model_id)

    trainer = SFTTrainer(
        model=model,
        processing_class=tokenizer,
        train_dataset=dataset,
        args=sft_config,
    )

    trainer.train()
    # Save only LoRA adapter weights (small ~5-10MB).
    # Use peft save_pretrained which writes adapter_config.json + adapter_model.safetensors
    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir, safe_serialization=True)

    for f in Path(output_dir).rglob("*"):
        if f.is_file():
            print(f"[SAVED] {f.name}: {f.stat().st_size} bytes", flush=True)

    tokenizer.save_pretrained(output_dir)
    return output_dir


def quantize_model(
    base_model_id: str,
    adapter_path: str,
    output_path: str,
    quant_type: str = "q4_k_m",
) -> str:
    """
    Merge base model + LoRA adapter, export as GGUF quantized file.

    Steps:
        1. Load base model in fp16 (no 4bit quant; GGUF requires full weights)
        2. PeftModel.from_pretrained + merge_and_unload
        3. save_pretrained to tmpdir
        4. llama.cpp convert_hf_to_gguf.py → fp16 GGUF
        5. llama.cpp llama-quantize → {quant_type} GGUF
        6. Cleanup intermediate files

    Args:
        base_model_id: HF base model id (e.g., "Qwen/Qwen2.5-1.5B")
        adapter_path: Local path to LoRA adapter directory
        output_path: Destination directory for final .gguf file
        quant_type: llama.cpp quant preset (q4_k_m, q5_k_m, q8_0, etc.)

    Returns:
        Path to the final quantized .gguf file
    """
    import subprocess
    import tempfile

    llama_dir = os.getenv("LLAMA_CPP_DIR", "/opt/llama.cpp")
    convert_script = Path(llama_dir) / "convert_hf_to_gguf.py"
    quantize_bin = Path(llama_dir) / "build" / "bin" / "llama-quantize"

    if not convert_script.exists() or not quantize_bin.exists():
        raise RuntimeError(
            f"llama.cpp not available at {llama_dir}. "
            "Ensure Dockerfile cloned and built llama.cpp."
        )

    Path(output_path).mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="gguf_merge_") as tmpdir:
        merged_dir = Path(tmpdir) / "merged"
        fp16_gguf = Path(tmpdir) / "model_f16.gguf"

        # 1+2+3: Load base in fp16, merge adapter, save as HF format
        print(f"[GGUF] loading base {base_model_id}", flush=True)
        base = AutoModelForCausalLM.from_pretrained(
            base_model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
        )
        tokenizer = AutoTokenizer.from_pretrained(base_model_id, trust_remote_code=True)

        # Ensure proper special tokens for quantization
        is_gemma = "gemma" in base_model_id.lower()
        _setup_tokenizer_special_tokens(tokenizer, base_model_id, is_gemma)

        print(f"[GGUF] applying LoRA from {adapter_path}", flush=True)
        merged = PeftModel.from_pretrained(base, adapter_path).merge_and_unload()
        merged.save_pretrained(str(merged_dir), safe_serialization=True)
        tokenizer.save_pretrained(str(merged_dir))
        del base, merged
        torch.cuda.empty_cache() if torch.cuda.is_available() else None

        # 4: HF -> GGUF f16
        print(f"[GGUF] converting HF -> GGUF f16", flush=True)
        subprocess.run(
            [
                "python",
                str(convert_script),
                str(merged_dir),
                "--outfile",
                str(fp16_gguf),
                "--outtype",
                "f16",
            ],
            check=True,
        )

        # 5: GGUF f16 -> quantized
        final_path = Path(output_path) / f"model_{quant_type}.gguf"
        print(f"[GGUF] quantizing to {quant_type}", flush=True)
        subprocess.run(
            [str(quantize_bin), str(fp16_gguf), str(final_path), quant_type],
            check=True,
        )


    size = final_path.stat().st_size
    print(f"[GGUF] done: {final_path} ({size} bytes)", flush=True)
    return str(final_path)
