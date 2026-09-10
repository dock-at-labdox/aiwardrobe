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
    results = generate_recommendations(
        MOCK_WARDROBE, occasion, scoring_version_id=approved.version_id
    )

    for outfit in results:
        assert outfit["scoring_version"] == approved.version_id
    # The default registry's active version must be unaffected, since
    # passing an explicit version should never change what "default"
    # means for other callers.
    assert registry.get_active().version_id == "v1"


def test_an_active_scoring_version_can_be_selected_explicitly() -> None:
    from app.domain.versioning import create_default_registry

    registry = create_default_registry()
    occasion = make_occasion(required_item_ids=["itm_001"])

    results = generate_recommendations(
        MOCK_WARDROBE,
        occasion,
        scoring_version_id=registry.get_active().version_id,
        registry=registry,
    )

    assert all(result["scoring_version"] == "v1" for result in results)


def test_cannot_bypass_the_registry_with_a_draft_version() -> None:
    """A draft has not been reviewed by anyone. Passing its id must be
    rejected, not silently used, since that would let unreviewed
    weights drive a real recommendation.
    """
    from app.domain.pipeline import get_default_registry
    from app.domain.versioning import DraftVersionNotAllowedError, ScoringWeights

    registry = get_default_registry()
    draft = registry.create_draft(
        weights=ScoringWeights(
            context_fit=1.0,
            color_harmony=0.0,
            formality_consistency=0.0,
            silhouette_fit=0.0,
            pattern_material=0.0,
            personal_preference=0.0,
            weather_practicality=0.0,
            novelty=0.0,
        ),
        owner="test",
        reason="should never be usable while still a draft",
    )

    occasion = make_occasion(required_item_ids=["itm_001"])
    with pytest.raises(DraftVersionNotAllowedError):
        generate_recommendations(
            MOCK_WARDROBE, occasion, scoring_version_id=draft.version_id
        )


def test_cannot_bypass_the_registry_with_an_unregistered_version_id() -> None:
    """A version_id that was never created by this registry (a typo,
    or a fabricated id) must be rejected, not silently ignored or
    treated as if it were the active version.
    """
    from app.domain.versioning import VersionNotFoundError

    occasion = make_occasion(required_item_ids=["itm_001"])
    with pytest.raises(VersionNotFoundError):
        generate_recommendations(
            MOCK_WARDROBE, occasion, scoring_version_id="v_fabricated_does_not_exist"
        )


def test_cannot_use_a_superseded_version_for_recommendations() -> None:
    from app.domain.versioning import (
        ScoringWeights,
        VersionNotEligibleForScoringError,
        create_default_registry,
    )

    registry = create_default_registry()
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
        reason="create a superseded version",
    )
    registry.approve(draft.version_id, reviewer="test")
    registry.activate(draft.version_id)

    occasion = make_occasion(required_item_ids=["itm_001"])
    with pytest.raises(VersionNotEligibleForScoringError):
        generate_recommendations(
            MOCK_WARDROBE, occasion, scoring_version_id="v1", registry=registry
        )


def test_cannot_use_a_rolled_back_version_for_recommendations() -> None:
    from app.domain.versioning import (
        ScoringWeights,
        VersionNotEligibleForScoringError,
        create_default_registry,
    )

    registry = create_default_registry()
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
        reason="create a version to roll back",
    )
    registry.approve(draft.version_id, reviewer="test")
    registry.activate(draft.version_id)
    registry.rollback_to("v1")

    occasion = make_occasion(required_item_ids=["itm_001"])
    with pytest.raises(VersionNotEligibleForScoringError):
        generate_recommendations(
            MOCK_WARDROBE, occasion, scoring_version_id=draft.version_id, registry=registry
        )


def test_activating_a_new_version_changes_the_default_score_and_reported_version() -> None:
    """End-to-end: create, approve and activate a version with a
    deliberately different weighting on a fresh, isolated registry,
    then confirm a default call (no explicit scoring_version_id) picks
    it up automatically, both in the score it produces and in which
    version it reports. Uses its own registry rather than the shared
    module-level default, so this test cannot leak state into any
    other test that assumes the shared default stays on 'v1'.
    """
    from app.domain.versioning import ScoringWeights, create_default_registry

    registry = create_default_registry()
    occasion = make_occasion(required_item_ids=["itm_001"])

    baseline = generate_recommendations(MOCK_WARDROBE, occasion, registry=registry)
    assert baseline[0]["scoring_version"] == "v1"

    # Weight everything onto color harmony instead of the original
    # mostly-context-fit-driven weighting, which is different enough
    # to change the ranked outfits' overall scores.
    new_weights = ScoringWeights(
        context_fit=0.0,
        color_harmony=1.0,
        formality_consistency=0.0,
        silhouette_fit=0.0,
        pattern_material=0.0,
        personal_preference=0.0,
        weather_practicality=0.0,
        novelty=0.0,
    )
    draft = registry.create_draft(
        weights=new_weights, owner="mahira", reason="e2e activation test"
    )
    approved = registry.approve(draft.version_id, reviewer="pratyush")
    registry.activate(approved.version_id)

    updated = generate_recommendations(MOCK_WARDROBE, occasion, registry=registry)

    assert updated[0]["scoring_version"] == approved.version_id
    assert updated[0]["scoring_version"] != baseline[0]["scoring_version"]
    assert updated[0]["overall_score"] != baseline[0]["overall_score"]
