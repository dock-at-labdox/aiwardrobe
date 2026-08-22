"""Detect the main (dominant) color of a garment image.

This is the first step of the color pipeline (M2). It takes a garment image,
ignores any transparent background, and returns the garment's dominant color as
RGB values. Later steps will convert this to device-independent LAB values and a
human-readable color name.
"""

from __future__ import annotations

import io
from typing import cast

from PIL import Image


def detect_dominant_color(image_bytes: bytes) -> tuple[int, int, int]:
    """Return the dominant (R, G, B) color of the garment in the image.

    Transparent pixels (the removed background) are ignored, so the color
    reflects the garment itself, not the background.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # Shrink the image so we scan far fewer pixels (much faster, same result).
    image.thumbnail((100, 100))

    # Ask pillow for every color and how many pixels use it.
    raw = image.getcolors(maxcolors=image.width * image.height)
    if raw is None:
        raise ValueError("Could not read colors from the image.")

    # We converted to RGBA, so every color is (R, G, B, A). Tell the checker that.
    colors = cast("list[tuple[int, tuple[int, int, int, int]]]", raw)

    # Keep only the garment colors: the ones that are not transparent.
    garment = [(count, (r, g, b)) for count, (r, g, b, a) in colors if a > 10]
    if not garment:
        raise ValueError("Image has no visible garment pixels to read a color from.")

    # The dominant color is the one with the most pixels.
    garment.sort(key=lambda item: item[0], reverse=True)
    return garment[0][1]