import os
from pathlib import Path


class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    MODEL_CACHE_DIR = Path(os.getenv("MODEL_CACHE_DIR", "/cache/huggingface"))


config = Config()
