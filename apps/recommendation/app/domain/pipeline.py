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
from app.domain.versioning import VersionRegistry, create_default_registry

# Module-level default registry, seeded once with the existing PRD
# 9.3 weights, approved and active. Callers that don't care about
# versioning (existing tests, the demo script) get identical behavior
# to before this change.
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
    scoring_version_id: str | None = None,
    registry: VersionRegistry | None = None,
) -> list[RecommendationResult]:
    """By default, scores against whichever registry's active version,
    using the module-level default registry unless a different one is
    passed explicitly (mainly useful for tests that need an isolated
    registry rather than mutating the shared default).

    Pass scoring_version_id to score against a specific version
    instead of whatever is currently active, for example to preview
    an approved-but-not-yet-active version against real data before
    activating it for everyone. This always resolves through
    registry.get_for_scoring, never accepts a bare ScoringVersion
    object directly, so it is impossible to bypass the registry with
    a fabricated or unregistered version, and impossible to use a
    draft version, since get_for_scoring rejects both.
    """
    active_registry = registry or _default_registry

    if scoring_version_id is not None:
        scoring_version = active_registry.get_for_scoring(scoring_version_id)
    else:
        scoring_version = active_registry.get_active()

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

    scored = score_all_candidates(candidates, wardrobe_by_id, occasion, scoring_version)
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
                scoring_version=scoring_version.version_id,
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
