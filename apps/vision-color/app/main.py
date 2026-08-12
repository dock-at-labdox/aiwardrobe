from fastapi import FastAPI

from app.api.router import router
from app.infrastructure.settings import settings

app = FastAPI(title="AI Wardrobe Vision & Color", version="0.1.0")
app.include_router(router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Return a dependency-free liveness response."""
    return {"status": "ok", "service": settings.service_name}
