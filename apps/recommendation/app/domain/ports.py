from typing import Protocol


class RuleEngine(Protocol):
    """Future deterministic rule boundary; no recommendation logic belongs here yet."""

    async def evaluate(self, request: object) -> object: ...


class EmbeddingProvider(Protocol):
    async def embed(self, items: object, model_version: str) -> object: ...


class LLMProvider(Protocol):
    async def explain(self, grounded_facts: object, policy_version: str) -> object: ...
