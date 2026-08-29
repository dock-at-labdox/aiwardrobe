"""
Orchestrates the five pipeline stages end to end: eligibility,
candidate generation, scoring, diversity rerank, explanation. Mirrors
the pipeline diagram in the research doc. Swap MOCK_WARDROBE for a real
wardrobe source once vision-color is available; nothing in this module
needs to change.
"""

from app.domain.candidate_generation import generate_candidates
from app.domain.diversity_rerank import rerank_for_diversity
from app.domain.eligibility import check_required_items, filter_eligible_items
from app.domain.explanation import (
    build_structured_facts,
    generate_explanation_stub,
    verify_grounding,
)
from app.domain.models import Occasion, RecommendationResult, WardrobeItem
from app.domain.scoring import score_all_candidates
from app.domain.versioning import ScoringVersion, VersionRegistry, create_default_registry

# Module-level default registry, seeded once with the existing PRD
# 9.3 weights, approved and active. Callers that don't care about
# versioning (existing tests, the demo script) get identical behavior
# to before this change. Callers that do care can pass their own
# scoring_version explicitly, for example to test against a draft
# version before approving it.
_default_registry = create_default_registry()


class InsufficientWardrobeError(Exception):
    pass


class ConstraintConflictError(Exception):
    def __init__(self, conflicting_item_ids: list[str]):
        self.conflicting_item_ids = conflicting_item_ids
        super().__init__(f"Required items unavailable: {conflicting_item_ids}")


def generate_recommendations(
    wardrobe: list[WardrobeItem],
    occasion: Occasion,
    top_n: int = 3,
    scoring_version: ScoringVersion | None = None,
) -> list[RecommendationResult]:
    """scoring_version defaults to the module-level default registry's
    active version, so existing callers see no change in behavior.
    Pass an explicit version to score against a specific draft,
    approved-but-not-active, or previously active version instead.
    """
    active_version = scoring_version or _default_registry.get_active()

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

    scored = score_all_candidates(candidates, wardrobe_by_id, occasion, active_version)
    top_candidates = rerank_for_diversity(scored, top_n=top_n)

    results: list[RecommendationResult] = []
    for candidate in top_candidates:
        facts = build_structured_facts(candidate, wardrobe_by_id)
        explanation = generate_explanation_stub(facts)
        if not verify_grounding(explanation, facts):
            explanation = "Explanation withheld: failed grounding check."

        results.append(
            RecommendationResult(
                item_ids=candidate.item_ids,
                overall_score=round(candidate.overall_score, 3),
                score_components=vars(candidate.scores),
                explanation=explanation,
                scoring_version=active_version.version_id,
            )
        )

    return results


def get_default_registry() -> VersionRegistry:
    """Access to the module-level default registry, for callers (for
    example an eventual admin API, or tests) that need to create,
    approve, activate, or roll back versions used by default calls to
    generate_recommendations.
    """
    return _default_registry
