import pytest

from apps.recommendation.domain.models import Occasion
from apps.recommendation.eligibility import filter_eligible_items
from apps.recommendation.mocks.mock_wardrobe import MOCK_WARDROBE
from apps.recommendation.pipeline import (
    ConstraintConflictError,
    InsufficientWardrobeError,
    generate_recommendations,
)


def make_occasion(**overrides):
    defaults = dict(
        id="occ_test",
        occasion_type="client_meeting",
        desired_formality="business",
        required_item_ids=[],
        excluded_item_ids=[],
        excluded_colors=[],
    )
    defaults.update(overrides)
    return Occasion(**defaults)


def test_eligibility_excludes_unavailable_items():
    occasion = make_occasion()
    eligible = filter_eligible_items(MOCK_WARDROBE, occasion)
    eligible_ids = {item.id for item in eligible}
    # itm_008 is status=laundry in the mock wardrobe, must be excluded.
    assert "itm_008" not in eligible_ids


def test_eligibility_excludes_by_color():
    occasion = make_occasion(excluded_colors=["mustard"])
    eligible = filter_eligible_items(MOCK_WARDROBE, occasion)
    assert all(item.color.semantic_family != "mustard" for item in eligible)


def test_pipeline_returns_three_diverse_outfits():
    occasion = make_occasion(required_item_ids=["itm_001"])
    results = generate_recommendations(MOCK_WARDROBE, occasion)

    assert len(results) == 3
    # Every result must include the pinned required item, per REC-001.
    assert all("itm_001" in outfit["item_ids"] for outfit in results)
    # Diversity rerank should mean no two outfits are identical.
    seen = set()
    for outfit in results:
        key = tuple(sorted(outfit["item_ids"]))
        assert key not in seen
        seen.add(key)


def test_pipeline_raises_constraint_conflict_for_unavailable_required_item():
    occasion = make_occasion(required_item_ids=["itm_008"])  # laundry status
    with pytest.raises(ConstraintConflictError) as exc_info:
        generate_recommendations(MOCK_WARDROBE, occasion)
    assert "itm_008" in exc_info.value.conflicting_item_ids


def test_pipeline_raises_insufficient_wardrobe_when_slots_cannot_be_filled():
    # A wardrobe with no footwear at all cannot satisfy required slots.
    no_footwear = [item for item in MOCK_WARDROBE if item.category != "footwear"]
    occasion = make_occasion()
    with pytest.raises(InsufficientWardrobeError):
        generate_recommendations(no_footwear, occasion)


def test_explanations_are_grounded_in_actual_items():
    occasion = make_occasion(required_item_ids=["itm_001"])
    results = generate_recommendations(MOCK_WARDROBE, occasion)
    for outfit in results:
        assert outfit["explanation"] != "Explanation withheld: failed grounding check."
