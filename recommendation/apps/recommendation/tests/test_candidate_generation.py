"""
Tests for the two candidate-generation fixes raised in review:
1. one_piece items (dresses, jumpsuits) must not require a separate
   top and bottom, since the one_piece item already covers both.
2. A required/pinned item must never be dropped by the top-N
   per-slot cap; it must always be considered if eligible.
"""

from apps.recommendation.candidate_generation import generate_candidates
from apps.recommendation.domain.models import ColorProfile, WardrobeItem

BASE_COLOR = ColorProfile(
    dominant_lab=(50.0, 0.0, 0.0),
    semantic_family="gray",
    semantic_shade="mid gray",
    confidence=0.9,
)


def make_item(id, category, formality="business", subtype="test item"):
    return WardrobeItem(
        id=id,
        category=category,
        subtype=subtype,
        color=BASE_COLOR,
        pattern="solid",
        material_family="wool",
        formality=formality,
        silhouette=None,
        status="active",
    )


def test_one_piece_does_not_require_separate_top_and_bottom():
    """A dress plus shoes should be enough to generate a candidate.
    No top or bottom item exists in this wardrobe at all; if the bug
    were still present, generate_candidates would return nothing,
    since it would be waiting on top and bottom slots that can never
    be filled.
    """
    dress = make_item("itm_dress", "one_piece", subtype="dress")
    shoes = make_item("itm_shoes", "footwear", subtype="pump")
    wardrobe = [dress, shoes]

    candidates = generate_candidates(wardrobe, required_item_ids=[])

    assert len(candidates) > 0
    for candidate in candidates:
        assert "itm_dress" in candidate.item_ids
        assert "itm_shoes" in candidate.item_ids
        # Must not have pulled in a top or bottom slot that doesn't
        # exist in this wardrobe at all.
        assert len(candidate.item_ids) == 2


def test_required_item_survives_top_n_cap_even_when_it_ranks_low():
    """Build a slot with more than MAX_CANDIDATES_PER_SLOT items where
    the required item is deliberately the worst match by the naive
    compatibility function (mismatched formality), so it would be cut
    by the top-3 cap if the fix were not in place.
    """
    anchor = make_item("itm_anchor", "layer", formality="business")

    # Four business-formality tops outrank the required one on the
    # naive compatibility score, filling the top-3 cap before the
    # required item is ever considered.
    decoy_tops = [
        make_item(f"itm_decoy_top_{i}", "top", formality="business")
        for i in range(4)
    ]
    required_top = make_item(
        "itm_required_top", "top", formality="smart casual"
    )

    bottom = make_item("itm_bottom", "bottom", formality="business")
    shoes = make_item("itm_shoes", "footwear", formality="business")

    wardrobe = [anchor, *decoy_tops, required_top, bottom, shoes]

    candidates = generate_candidates(
        wardrobe, required_item_ids=["itm_required_top"]
    )

    assert len(candidates) > 0
    assert all(
        "itm_required_top" in candidate.item_ids for candidate in candidates
    )
