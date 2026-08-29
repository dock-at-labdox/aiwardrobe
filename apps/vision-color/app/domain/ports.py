from typing import Protocol


class VisionProvider(Protocol):
    """Provider-neutral future boundary; SDK types must never escape this protocol."""

    async def analyze(self, image_reference: str, taxonomy_version: str) -> object: ...


class BackgroundRemovalProvider(Protocol):
    """Removes the background from a garment image.

    Provider-neutral boundary: concrete SDK types (for example rembg) must never
    escape this protocol, so the API layer depends on this contract, not on any
    specific vendor.
    """

    async def remove_background(self, image_bytes: bytes) -> bytes: ...
