"""Tests for the garment classification feature."""

from __future__ import annotations

import io
import sys

import httpx
import pytest
from PIL import Image

from app.infrastructure.classification import classify_garment

# Placeholder image URLs for category testing.
# NOTE: Real external URLs are intentionally omitted here to prevent external network calls,
# security vulnerabilities, and pipeline flakiness during CI/CD test runs.
# Developers can temporarily insert direct image URLs locally for manual end-to-end evaluation.
garment_test_data: dict[str, str] = {
    "TOP": "https://unsplash.com",
    "BOTTOM": "https://unsplash.com",
    "LAYER": "https://unsplash.com",
    "DRESS": "https://unsplash.com",
    "FOOTWEAR": "https://unsplash.com",
    "BELT": "https://unsplash.com",
    "BAG": "https://unsplash.com",
    "TIE_SCARF": "https://unsplash.com",
    "JEWELRY": "https://unsplash.com",
    "OTHER": "https://unsplash.com",
}

VALID_CATEGORIES = {
    "TOP",
    "BOTTOM",
    "LAYER",
    "DRESS",
    "FOOTWEAR",
    "BELT",
    "BAG",
    "TIE_SCARF",
    "JEWELRY",
    "OTHER",
}


def _sample_image_bytes() -> bytes:
    """Generate a simple synthetic image in memory."""
    image = Image.new("RGB", (100, 100), color=(180, 50, 50))
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    return buf.getvalue()


def test_classify_garment_returns_valid_taxonomy() -> None:
    """Ensure classify_garment produces an allowed category code."""
    result = classify_garment(_sample_image_bytes())
    assert result in VALID_CATEGORIES


@pytest.mark.parametrize("expected_category,image_url", list(garment_test_data.items()))
def test_classify_garment_from_urls(expected_category: str, image_url: str) -> None:
    """Test classification against garment_test_data URLs with real images when provided."""
    if image_url == "https://unsplash.com" or not image_url.startswith("http"):
        pytest.skip(f"Skipping placeholder URL for category: {expected_category}")

    try:
        response = httpx.get(image_url, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        pytest.skip(f"Network fetch failed for {image_url}: {exc}")

    predicted_category = classify_garment(response.content)
    assert predicted_category == expected_category


if __name__ == "__main__":
    sys.exit(pytest.main(["-v", "-s", __file__]))