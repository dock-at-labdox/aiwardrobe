"""Detect the main (dominant) color of a garment image.

This is the first step of the color pipeline (M2). It takes a garment image,
ignores any transparent background, and returns the garment's dominant color as
RGB values. Later steps will convert this to device-independent LAB values and a
human-readable color name.
"""

from __future__ import annotations

import io
from dataclasses import dataclass
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


def rgb_to_lab(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
    """Convert an sRGB color to device-independent CIE LAB values."""

    def linearize(value: int) -> float:
        channel = value / 255
        if channel <= 0.04045:
            return channel / 12.92
        return float(((channel + 0.055) / 1.055) ** 2.4)

    r = linearize(rgb[0])
    g = linearize(rgb[1])
    b = linearize(rgb[2])

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
    y = r * 0.2126 + g * 0.7152 + b * 0.0722
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

    def pivot(t: float) -> float:
        return float(t ** (1 / 3)) if t > 0.008856 else 7.787 * t + 16 / 116

    fx, fy, fz = pivot(x), pivot(y), pivot(z)
    lightness = 116 * fy - 16
    a_axis = 500 * (fx - fy)
    b_axis = 200 * (fy - fz)
    return (round(lightness, 2), round(a_axis, 2), round(b_axis, 2))


_REFERENCE_COLORS: dict[str, tuple[int, int, int]] = {
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "gray": (128, 128, 128),
    "red": (200, 30, 30),
    "green": (30, 140, 60),
    "blue": (40, 70, 160),
    "navy": (20, 30, 80),
    "yellow": (220, 200, 40),
    "orange": (230, 130, 40),
    "brown": (110, 70, 40),
    "pink": (230, 130, 160),
    "purple": (120, 50, 150),
    "beige": (220, 200, 170),
}


def name_color(rgb: tuple[int, int, int]) -> str:
    """Return the closest human-readable color name for an RGB value."""

    def distance(name: str) -> int:
        ref = _REFERENCE_COLORS[name]
        return sum((a - b) ** 2 for a, b in zip(rgb, ref))

    return min(_REFERENCE_COLORS, key=distance)


@dataclass
class ColorResult:
    """The full color description of a garment."""

    rgb: tuple[int, int, int]
    lab: tuple[float, float, float]
    name: str


def analyze_color(image_bytes: bytes) -> ColorResult:
    """Detect the garment color and return its RGB, LAB, and name together."""
    rgb = detect_dominant_color(image_bytes)
    return ColorResult(rgb=rgb, lab=rgb_to_lab(rgb), name=name_color(rgb))
