from typing import Protocol


class VisionProvider(Protocol):
    """Provider-neutral future boundary; SDK types must never escape this protocol."""

    async def analyze(self, image_reference: str, taxonomy_version: str) -> object: ...
