from typing import Protocol


class TryOnProvider(Protocol):
    """Provider-neutral boundary for submission, polling, and deletion."""

    async def submit(self, request: object) -> object: ...
    async def get_status(self, provider_job: object) -> object: ...
    async def delete(self, media_reference: str) -> object: ...


class JobQueue(Protocol):
    """Queue boundary; durable dispatch is owned by the backend outbox workflow."""

    async def enqueue(self, message: object) -> None: ...
