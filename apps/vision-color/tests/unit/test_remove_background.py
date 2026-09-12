"""Tests for the garment background removal feature."""

from __future__ import annotations

import asyncio
import io

from fastapi.testclient import TestClient
from PIL import Image

from app.infrastructure.background_removal import get_background_removal_provider
from app.main import app

client = TestClient(app)


def _sample_png() -> bytes:
    """Build a small test image: a colored square on a white background."""
    image = Image.new("RGB", (60, 60), "white")
    for x in range(15, 45):
        for y in range(15, 45):
            image.putpixel((x, y), (30, 60, 160))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_provider_removes_background_returns_transparent_png() -> None:
    """The provider removes the background and returns an image with transparency."""
    provider = get_background_removal_provider()
    result = asyncio.run(provider.remove_background(_sample_png()))
    output = Image.open(io.BytesIO(result))
    assert output.mode == "RGBA"


def test_endpoint_rejects_non_image_file() -> None:
    """A non-image upload is rejected with a clear 400 error."""
    response = client.post(
        "/v1/garments/remove-background",
        files={"image": ("notes.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400


def test_endpoint_rejects_empty_upload() -> None:
    """An empty upload is rejected with a clear 400 error."""
    response = client.post(
        "/v1/garments/remove-background",
        files={"image": ("empty.png", b"", "image/png")},
    )
    assert response.status_code == 400


def test_endpoint_rejects_corrupt_image() -> None:
    """A corrupt image (valid type, invalid content) is rejected with a 400 error."""
    response = client.post(
        "/v1/garments/remove-background",
        files={"image": ("broken.png", b"this is not a real image", "image/png")},
    )
    assert response.status_code == 400
