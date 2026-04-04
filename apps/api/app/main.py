from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import projects, training, payments, sources

app = FastAPI(title="AI Rakuraku Ordermade API", version="0.1.0")

allowed_origins = [settings.frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(training.router)
app.include_router(payments.router)
app.include_router(sources.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
