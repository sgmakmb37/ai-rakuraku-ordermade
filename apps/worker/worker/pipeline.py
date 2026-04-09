from pathlib import Path
from typing import Optional

import pymupdf
from datasets import Dataset
from trafilatura import extract, fetch_url
from trl import SFTConfig, SFTTrainer
from unsloth import FastLanguageModel


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
    max_steps: int = 500,
) -> str:
    """
    Train LoRA adapter using Unsloth.

    Args:
        model_id: Base model identifier
        train_texts: List of training texts
        output_dir: Output directory for adapter
        existing_lora_path: Optional path to existing LoRA for continued training
        max_steps: Maximum training steps

    Returns:
        Path to trained adapter
    """
    # Load model and tokenizer
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=model_id,
        max_seq_length=2048,
        load_in_4bit=True,
    )

    # Setup LoRA
    if existing_lora_path:
        # Load existing LoRA weights
        model = FastLanguageModel.get_peft_model(
            model,
            r=16,
            lora_alpha=16,
            lora_dropout=0,
            target_modules=[
                "q_proj",
                "k_proj",
                "v_proj",
                "o_proj",
                "gate_proj",
                "up_proj",
                "down_proj",
            ],
        )
        # Load checkpoint
        from peft import PeftModel

        model = PeftModel.from_pretrained(model, existing_lora_path)
    else:
        model = FastLanguageModel.get_peft_model(
            model,
            r=16,
            lora_alpha=16,
            lora_dropout=0,
            target_modules=[
                "q_proj",
                "k_proj",
                "v_proj",
                "o_proj",
                "gate_proj",
                "up_proj",
                "down_proj",
            ],
        )

    # Prepare dataset
    dataset = Dataset.from_dict({"text": train_texts})

    # Setup trainer — handle both old/new trl APIs
    base_args = dict(
        output_dir=output_dir,
        max_steps=max_steps,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=10,
        save_steps=max_steps,
    )
    try:
        # trl >= 0.12: SFTConfig with dataset_text_field + max_seq_length inside
        sft_config = SFTConfig(
            **base_args,
            dataset_text_field="text",
            max_seq_length=2048,
        )
        trainer = SFTTrainer(
            model=model,
            train_dataset=dataset,
            args=sft_config,
        )
    except TypeError:
        # trl older: pass kwargs directly
        sft_config = SFTConfig(**base_args)
        trainer = SFTTrainer(
            model=model,
            train_dataset=dataset,
            args=sft_config,
            dataset_text_field="text",
            max_seq_length=2048,
        )

    # Train
    trainer.train()

    # Save model
    model.save_pretrained(output_dir)

    return output_dir


def quantize_model(model_path: str, output_path: str) -> str:
    """
    Quantize model using Unsloth.

    Args:
        model_path: Path to model
        output_path: Output path for quantized model

    Returns:
        Path to quantized model
    """
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=model_path,
        max_seq_length=2048,
        load_in_4bit=True,
    )

    model.save_pretrained_gguf(output_path, tokenizer, quantization_method="q4_k_m")

    return output_path
