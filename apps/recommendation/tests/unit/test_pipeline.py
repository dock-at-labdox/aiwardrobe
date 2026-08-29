import pytest

from app.domain.eligibility import filter_eligible_items
from app.domain.models import Occasion
from app.domain.pipeline import (
    ConstraintConflictError,
    InsufficientWardrobeError,
    generate_recommendations,
)
from app.mocks.mock_wardrobe import MOCK_WARDROBE


def make_occasion(**overrides: object) -> Occasion:
    defaults: dict[str, object] = {
        "id": "occ_test",
        "occasion_type": "client_meeting",
        "desired_formality": "business",
        "required_item_ids": [],
        "excluded_item_ids": [],
        "excluded_colors": [],
    }
    defaults.update(overrides)
    return Occasion(**defaults)  # type: ignore[arg-type]


def test_eligibility_excludes_unavailable_items() -> None:
    occasion = make_occasion()
    eligible = filter_eligible_items(MOCK_WARDROBE, occasion)
    eligible_ids = {item.id for item in eligible}
    # itm_008 is status=laundry in the mock wardrobe, must be excluded.
    assert "itm_008" not in eligible_ids


def test_eligibility_excludes_by_color() -> None:
    occasion = make_occasion(excluded_colors=["mustard"])
    eligible = filter_eligible_items(MOCK_WARDROBE, occasion)
    assert all(item.color.semantic_family != "mustard" for item in eligible)


def test_pipeline_returns_three_diverse_outfits() -> None:
    occasion = make_occasion(required_item_ids=["itm_001"])
    results = generate_recommendations(MOCK_WARDROBE, occasion)

    assert len(results) == 3
    # Every result must include the pinned required item, per REC-001.
    assert all("itm_001" in outfit["item_ids"] for outfit in results)
    # Diversity rerank should mean no two outfits are identical.
    seen: set[tuple[str, ...]] = set()
    for outfit in results:
        key = tuple(sorted(outfit["item_ids"]))
        assert key not in seen
        seen.add(key)


def test_pipeline_raises_constraint_conflict_for_unavailable_required_item() -> None:
    occasion = make_occasion(required_item_ids=["itm_008"])  # laundry status
    with pytest.raises(ConstraintConflictError) as exc_info:
        generate_recommendations(MOCK_WARDROBE, occasion)
    assert "itm_008" in exc_info.value.conflicting_item_ids


def test_pipeline_raises_insufficient_wardrobe_when_slots_cannot_be_filled() -> None:
    # A wardrobe with no footwear at all cannot satisfy required slots.
    no_footwear = [item for item in MOCK_WARDROBE if item.category != "footwear"]
    occasion = make_occasion()
    with pytest.raises(InsufficientWardrobeError):
        generate_recommendations(no_footwear, occasion)


def test_explanations_are_grounded_in_actual_items() -> None:
    occasion = make_occasion(required_item_ids=["itm_001"])
    results = generate_recommendations(MOCK_WARDROBE, occasion)
    for outfit in results:
        assert outfit["explanation"] != "Explanation withheld: failed grounding check."


def test_recommendations_report_which_scoring_version_produced_them() -> None:
    occasion = make_occasion(required_item_ids=["itm_001"])
    results = generate_recommendations(MOCK_WARDROBE, occasion)
    for outfit in results:
        assert outfit["scoring_version"] == "v1"


def test_passing_a_different_scoring_version_changes_which_version_is_reported() -> None:
    from app.domain.pipeline import get_default_registry
    from app.domain.versioning import ScoringWeights

    registry = get_default_registry()
    draft = registry.create_draft(
        weights=ScoringWeights(
            context_fit=0.5,
            color_harmony=0.5,
            formality_consistency=0.0,
            silhouette_fit=0.0,
            pattern_material=0.0,
            personal_preference=0.0,
            weather_practicality=0.0,
            novelty=0.0,
        ),
        owner="test",
        reason="testing an alternate weighting",
    )
    approved = registry.approve(draft.version_id, reviewer="test")

    occasion = make_occasion(required_item_ids=["itm_001"])
    results = generate_recommendations(MOCK_WARDROBE, occasion, scoring_version=approved)

    for outfit in results:
        assert outfit["scoring_version"] == approved.version_id
    # The default registry's active version must be unaffected, since
    # passing an explicit version should never change what "default"
    # means for other callers.
    assert registry.get_active().version_id == "v1"
