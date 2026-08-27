"""
Unit tests for scoring.py, focused on color harmony (the part with
real, non-trivial logic) and formality consistency. The remaining
score components are placeholder constants (see scoring.py comments)
so they are not tested for correctness here, only that score_candidate
wires them into ScoreComponents at all.
"""

from app.domain.models import CandidateOutfit, ColorProfile, Occasion, WardrobeItem
from app.domain.scoring import (
    score_all_candidates,
    score_candidate,
    score_color_harmony,
    score_formality_consistency,
)


def make_item(
    id: str,
    category: str = "top",
    formality: str = "business",
    lab: tuple[float, float, float] = (50.0, 0.0, 0.0),
) -> WardrobeItem:
    return WardrobeItem(
        id=id,
        category=category,
        subtype="test item",
        color=ColorProfile(
            dominant_lab=lab,
            semantic_family="gray",
            semantic_shade="mid gray",
            confidence=0.9,
        ),
        pattern="solid",
        material_family="wool",
        formality=formality,
        silhouette=None,
        status="active",
    )


def test_color_harmony_single_item_is_always_perfect() -> None:
    # With fewer than two items there is nothing to compare, so this
    # should not penalize a single-item edge case.
    item = make_item("itm_1")
    assert score_color_harmony([item]) == 1.0


def test_color_harmony_recognizes_complementary_hues() -> None:
    # hue 0 degrees (a=10, b=0) and hue 180 degrees (a=-10, b=0) are a
    # textbook complementary pair, exactly on one of the named harmonic
    # angles, so this should score as a perfect match.
    item_a = make_item("itm_a", lab=(50.0, 10.0, 0.0))
    item_b = make_item("itm_b", lab=(50.0, -10.0, 0.0))
    assert score_color_harmony([item_a, item_b]) == 1.0


def test_color_harmony_penalizes_hues_with_no_harmonic_relationship() -> None:
    # hue 0 degrees and hue 90 degrees are not close to any of the
    # named harmonic angles (30, 120, 180) within tolerance, so this
    # should score as no match at all, not a partial credit average.
    item_a = make_item("itm_a", lab=(50.0, 10.0, 0.0))
    item_b = make_item("itm_b", lab=(50.0, 0.0, 10.0))
    assert score_color_harmony([item_a, item_b]) == 0.0


def test_formality_consistency_all_items_match() -> None:
    items = [make_item("itm_1", formality="business"), make_item("itm_2", formality="business")]
    occasion = Occasion(id="o1", occasion_type="client_meeting", desired_formality="business")
    assert score_formality_consistency(items, occasion) == 1.0


def test_formality_consistency_partial_match() -> None:
    items = [
        make_item("itm_1", formality="business"),
        make_item("itm_2", formality="casual"),
    ]
    occasion = Occasion(id="o1", occasion_type="client_meeting", desired_formality="business")
    assert score_formality_consistency(items, occasion) == 0.5


def test_score_candidate_populates_all_eight_components() -> None:
    items = {
        "itm_1": make_item("itm_1", formality="business"),
        "itm_2": make_item("itm_2", formality="business"),
    }
    occasion = Occasion(id="o1", occasion_type="client_meeting", desired_formality="business")
    candidate = CandidateOutfit(item_ids=["itm_1", "itm_2"])

    scores = score_candidate(candidate, items, occasion)

    # All eight PRD section 9.3 components must be present and
    # numeric, even the placeholder ones, since overall() sums all
    # eight and a missing component would silently understate the
    # score rather than raise an error.
    for field in [
        "context_fit",
        "color_harmony",
        "formality_consistency",
        "silhouette_fit",
        "pattern_material",
        "personal_preference",
        "weather_practicality",
        "novelty",
    ]:
        assert isinstance(getattr(scores, field), float)


def test_score_all_candidates_returns_scored_type_with_same_item_ids() -> None:
    items = {"itm_1": make_item("itm_1"), "itm_2": make_item("itm_2")}
    occasion = Occasion(id="o1", occasion_type="client_meeting", desired_formality="business")
    candidates = [CandidateOutfit(item_ids=["itm_1", "itm_2"])]

    scored = score_all_candidates(candidates, items, occasion)

    assert len(scored) == 1
    assert scored[0].item_ids == ["itm_1", "itm_2"]
    assert scored[0].scores is not None
