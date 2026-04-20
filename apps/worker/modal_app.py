import os

import modal
from fastapi import Header
from fastapi.responses import JSONResponse

app = modal.App("ai-rakuraku-worker")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi[standard]",
        "torch>=2.6.0",
        "trl>=0.18.2",
        "transformers>=5.5.0",
        "peft>=0.17.0",
        "accelerate>=1.0.0",
        "bitsandbytes>=0.45.5",
        "datasets>=3.4.1,<4.0.0",
        "sentencepiece>=0.2.0",
        "protobuf>=4.25.0",
        "supabase>=2.10.0,<3.0.0",
        "trafilatura>=1.6.0",
        "pymupdf>=1.23.0",
    )
    .add_local_dir("worker", remote_path="/app/worker")
)

vol = modal.Volume.from_name("ai-rakuraku-cache", create_if_missing=True)


@app.function(
    image=image,
    gpu="a100-40gb",
    timeout=3600,
    volumes={"/cache": vol},
    secrets=[modal.Secret.from_name("ai-rakuraku")],
)
def train(job_id: str, project_id: str) -> dict:
    import sys
    sys.path.insert(0, "/app")

    from worker.main import process_job

    result = process_job({"id": job_id, "project_id": project_id})
    vol.commit()
    return result


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("ai-rakuraku")],
)
@modal.fastapi_endpoint(method="POST")
def submit(payload: dict, x_webhook_secret: str = Header(default="")):
    expected = os.environ.get("WEBHOOK_SECRET", "")
    if not expected or x_webhook_secret != expected:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    job_id = payload["job_id"]
    project_id = payload["project_id"]
    call = train.spawn(job_id=job_id, project_id=project_id)
    return {"status": "queued", "call_id": call.object_id}
