import os
from pathlib import Path


class Config:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    MODEL_CACHE_DIR = Path(os.getenv("MODEL_CACHE_DIR", ".cache/huggingface"))

    REDIS_QUEUE_NAME = "gpu_jobs"
    JOB_TIMEOUT = 3600
    BATCH_SIZE = 4
    MAX_SEQ_LENGTH = 2048


config = Config()
