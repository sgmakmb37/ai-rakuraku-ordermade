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
    quant_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        trust_remote_code=True,
    )
    # Ensure tokenizer has a proper eos_token (Qwen base/Gemma fallbacks)
    if not tokenizer.eos_token or tokenizer.eos_token == "<EOS_TOKEN>":
        if "qwen" in model_id.lower():
            tokenizer.eos_token = "<|endoftext|>"
        elif "gemma" in model_id.lower():
            tokenizer.eos_token = "<end_of_turn>"
        else:
            tokenizer.eos_token = "</s>"
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    import sys
    import transformers as _tf
    import trl as _trl
    import peft as _peft
    print(
        f"[VERSIONS] python={sys.version.split()[0]} "
        f"transformers={_tf.__version__} trl={_trl.__version__} "
        f"peft={_peft.__version__} eos='{tokenizer.eos_token}'",
        flush=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=quant_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.float16,
    )
    model = prepare_model_for_kbit_training(model)

    # Smaller LoRA: r=8, attention-only target modules.
    # Keeps adapter size <10MB so Supabase Storage 50MB limit is never hit.
    lora_config = LoraConfig(
        r=8,
        lora_alpha=16,
        lora_dropout=0.0,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        bias="none",
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(model, lora_config)

    if existing_lora_path:
        model = PeftModel.from_pretrained(model, existing_lora_path)

    dataset = Dataset.from_dict({"text": train_texts})

    # Do NOT pass eos_token to SFTConfig — let SFTTrainer auto-resolve from
    # processing_class.eos_token (tokenizer.eos_token we set above).
    sft_config = SFTConfig(
        output_dir=output_dir,
        max_steps=max_steps,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=5,
        optim="paged_adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        save_steps=max_steps,
        max_length=2048,
        packing=False,
        dataset_text_field="text",
        report_to=[],
    )
    trainer = SFTTrainer(
        model=model,
        processing_class=tokenizer,
        train_dataset=dataset,
        args=sft_config,
    )

    trainer.train()
    # Save with bf16/fp16 to halve the adapter size and shard to <10MB
    model.save_pretrained(
        output_dir,
        safe_serialization=True,
        max_shard_size="10MB",
    )
    tokenizer.save_pretrained(output_dir)
    return output_dir


def quantize_model(model_path: str, output_path: str) -> str:
    """
    Quantize model using Unsloth.

    Args:
        model_path: Path to model
        output_path: Output path for quantized model

    Returns:
        Path to quantized model

    Note: GGUF quantization requires llama.cpp tooling not present in base
    image. This function is kept for API compatibility but currently
    returns the input path unchanged. Worker uploads LoRA adapter directly.
    """
    return model_path
