"""Adapter for garment background removal using the rembg model.

External ML tools live in the infrastructure layer, not the domain, so the rest
of the service never depends directly on rembg. This adapter implements the
BackgroundRemovalProvider protocol from the domain layer, and runs the CPU-heavy
model in a worker thread so the async event loop stays responsive.
"""

from __future__ import annotations

import asyncio
from functools import lru_cache
from typing import Any, cast

from rembg import new_session, remove  # type: ignore[import-untyped]

from app.domain.ports import BackgroundRemovalProvider


class RembgBackgroundRemovalProvider:
    """Background removal backed by the rembg u2net model.

    Implements the BackgroundRemovalProvider protocol. The model is loaded lazily
    on first use and reused for every subsequent request.
    """

    def __init__(self) -> None:
        self._session: Any = None

    def _process(self, image_bytes: bytes) -> bytes:
        """Run the blocking rembg model. Executed inside a worker thread."""
        if self._session is None:
            self._session = new_session("u2net")
        result = remove(image_bytes, session=self._session)
        return cast(bytes, result)

    async def remove_background(self, image_bytes: bytes) -> bytes:
        """Return the garment image with its background removed, as PNG bytes.

        rembg is CPU-heavy and blocking, so it runs in a worker thread to keep the
        event loop free to serve other requests.
        """
        return await asyncio.to_thread(self._process, image_bytes)


@lru_cache(maxsize=1)
def get_background_removal_provider() -> BackgroundRemovalProvider:
    """Return the shared background removal provider (created once, reused)."""
    return RembgBackgroundRemovalProvider()
