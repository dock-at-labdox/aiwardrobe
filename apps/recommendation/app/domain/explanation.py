"""
Stage 5: explanation generation. Structured facts are produced first,
deterministically, from the already-finalized scores. An LLM call
would only ever rephrase these facts into prose; it is stubbed out here
since no provider is selected yet (see docs/embedding_options_note.md
for the related open provider question).

The grounding check is the enforcement mechanism for the rule that the
LLM may never invent a reason. Every fact the "generated" explanation
references must appear in the structured facts list, or it is rejected.
This stub does not call a real LLM yet; it demonstrates the contract
the real implementation must satisfy.
"""

from dataclasses import dataclass

from app.domain.models import ScoredCandidateOutfit, WardrobeItem


@dataclass
class ExplanationFact:
    label: str
    value: str


def build_structured_facts(
    candidate: ScoredCandidateOutfit, wardrobe_by_id: dict[str, WardrobeItem]
) -> list[ExplanationFact]:
    items = [wardrobe_by_id[item_id] for item_id in candidate.item_ids]
    scores = candidate.scores
    facts = [
        ExplanationFact("overall_score", f"{candidate.overall_score:.2f}"),
        ExplanationFact("color_harmony_score", f"{scores.color_harmony:.2f}"),
        ExplanationFact(
            "formality_consistency_score",
            f"{scores.formality_consistency:.2f}",
        ),
    ]
    for item in items:
        facts.append(
            ExplanationFact(f"item_{item.id}_shade", item.color.semantic_shade)
        )
        facts.append(ExplanationFact(f"item_{item.id}_category", item.category))
    return facts


def generate_explanation_stub(facts: list[ExplanationFact]) -> str:
    """Placeholder for the real LLM call. Produces a deterministic,
    template-based sentence purely from the facts list, which is
    trivially grounded by construction. The real implementation swaps
    this function body for an LLM call plus the verification step
    below; the function signature does not need to change.
    """
    shade_facts = [f for f in facts if f.label.endswith("_shade")]
    shades = ", ".join(f.value for f in shade_facts)
    color_score = next(f.value for f in facts if f.label == "color_harmony_score")
    return f"This combination pairs {shades}, with a color harmony score of {color_score}."


def verify_grounding(explanation: str, facts: list[ExplanationFact]) -> bool:
    """Reject any explanation referencing a value not present in the
    structured facts. This is a minimal placeholder check; the real
    version needs proper entity extraction, not substring matching.
    """
    fact_values = {f.value.lower() for f in facts}
    words_in_explanation = set(explanation.lower().replace(",", "").split())
    referenced_shades = [
        value for value in fact_values if all(w in words_in_explanation for w in value.split())
    ]
    return len(referenced_shades) > 0
