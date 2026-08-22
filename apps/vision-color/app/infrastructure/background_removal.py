"""Adapter for garment background removal using the rembg model.

External ML tools live in the infrastructure layer, not the domain, so the rest
of the service never depends directly on rembg. This is the first step of the
vision pipeline: turn a raw garment photo into a clean cutout (a PNG with a
transparent background) so later steps see the garment alone, not the background.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any, cast

from rembg import new_session, remove  # type: ignore[import-untyped]


@lru_cache(maxsize=1)
def _session() -> Any:
    """Load the background-removal model once and reuse it for every request."""
    return new_session("u2net")


def remove_background(image_bytes: bytes) -> bytes:
    """Return the garment image with its background removed, as PNG bytes."""
    result = remove(image_bytes, session=_session())
    return cast(bytes, result)
