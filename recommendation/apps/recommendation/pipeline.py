"""
Orchestrates the five pipeline stages end to end: eligibility,
candidate generation, scoring, diversity rerank, explanation. Mirrors
the pipeline diagram in the research doc. Swap MOCK_WARDROBE for a real
wardrobe source once vision-color is available; nothing in this module
needs to change.
"""

from apps.recommendation.candidate_generation import generate_candidates
from apps.recommendation.diversity_rerank import rerank_for_diversity
from apps.recommendation.domain.models import Occasion, WardrobeItem
from apps.recommendation.eligibility import check_required_items, filter_eligible_items
from apps.recommendation.explanation import (
    build_structured_facts,
    generate_explanation_stub,
    verify_grounding,
)
from apps.recommendation.scoring import score_all_candidates


class InsufficientWardrobeError(Exception):
    pass


class ConstraintConflictError(Exception):
    def __init__(self, conflicting_item_ids: list[str]):
        self.conflicting_item_ids = conflicting_item_ids
        super().__init__(f"Required items unavailable: {conflicting_item_ids}")


def generate_recommendations(
    wardrobe: list[WardrobeItem], occasion: Occasion, top_n: int = 3
) -> list[dict]:
    conflicts = check_required_items(wardrobe, occasion)
    if conflicts:
        raise ConstraintConflictError(conflicting_item_ids=conflicts)

    eligible_items = filter_eligible_items(wardrobe, occasion)
    wardrobe_by_id = {item.id: item for item in eligible_items}

    candidates = generate_candidates(eligible_items, occasion.required_item_ids)
    if not candidates:
        raise InsufficientWardrobeError(
            "No eligible combination fills all required slots."
        )

    scored = score_all_candidates(candidates, wardrobe_by_id, occasion)
    top_candidates = rerank_for_diversity(scored, top_n=top_n)

    results = []
    for candidate in top_candidates:
        facts = build_structured_facts(candidate, wardrobe_by_id)
        explanation = generate_explanation_stub(facts)
        if not verify_grounding(explanation, facts):
            explanation = "Explanation withheld: failed grounding check."

        results.append(
            {
                "item_ids": candidate.item_ids,
                "overall_score": round(candidate.scores.overall(), 3),
                "score_components": vars(candidate.scores),
                "explanation": explanation,
            }
        )

    return results
