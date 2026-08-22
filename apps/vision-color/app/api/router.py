"""API routes for the vision-color service."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.infrastructure.background_removal import remove_background

router = APIRouter()


@router.post("/v1/garments/remove-background", tags=["vision"])
async def remove_background_endpoint(
    image: Annotated[UploadFile, File(description="Garment photo to process.")],
) -> Response:
    """Remove the background from an uploaded garment photo and return a PNG cutout."""
    if image.content_type is None or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    cutout = remove_background(image_bytes)
    return Response(content=cutout, media_type="image/png")
