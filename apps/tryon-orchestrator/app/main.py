from fastapi import FastAPI

from app.api.router import router
from app.infrastructure.settings import settings

app = FastAPI(title="AI Wardrobe Try-On Orchestrator", version="0.1.0")
app.include_router(router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}
