"""
Stage 2: candidate generation. Builds actual outfit combinations from
eligible items, anchor-first, capped per slot before combinatorial
expansion. This mirrors the Loom architecture referenced in the
research notes: pick anchors, retrieve compatible items per slot, cap
the count per slot, then expand.

Compatibility here is a placeholder stand-in for the real embedding
service (see docs/embedding_options_note.md). It is intentionally
simple so the rest of the pipeline can be built and tested now,
without waiting on that decision.
"""

from itertools import product

from apps.recommendation.domain.models import CandidateOutfit, WardrobeItem

ANCHOR_CATEGORIES = {"layer", "one_piece", "bottom"}
REQUIRED_SLOTS = {"top", "bottom", "footwear"}
MAX_CANDIDATES_PER_SLOT = 3


def _naive_compatibility(a: WardrobeItem, b: WardrobeItem) -> float:
    """Temporary compatibility score, to be replaced by whichever
    embedding model wins the benchmark. Rewards matching formality and
    penalizes nothing else, on purpose, so it is obviously a stand-in
    and not mistaken for the real scoring logic.
    """
    return 1.0 if a.formality == b.formality else 0.3


def _top_candidates_for_slot(
    anchor: WardrobeItem, pool: list[WardrobeItem], category: str
) -> list[WardrobeItem]:
    slot_items = [item for item in pool if item.category == category]
    ranked = sorted(
        slot_items,
        key=lambda item: _naive_compatibility(anchor, item),
        reverse=True,
    )
    return ranked[:MAX_CANDIDATES_PER_SLOT]


def generate_candidates(
    eligible_items: list[WardrobeItem], required_item_ids: list[str]
) -> list[CandidateOutfit]:
    """Anchor-first candidate generation. Returns unscored candidates;
    scoring happens in the next stage.
    """
    anchors = [
        item for item in eligible_items if item.category in ANCHOR_CATEGORIES
    ]
    if not anchors:
        return []

    candidates: list[CandidateOutfit] = []
    for anchor in anchors:
        # Slots to fill: the required slots, plus the anchor's own
        # category if that category is not already one of them (for
        # example a blazer, category "layer", is not itself a required
        # slot but must still appear in the final outfit).
        slots_to_fill = set(REQUIRED_SLOTS) | {anchor.category}

        slot_options = {
            slot: (
                [anchor]
                if slot == anchor.category
                else _top_candidates_for_slot(anchor, eligible_items, slot)
            )
            for slot in slots_to_fill
        }

        # Skip anchors that cannot fill every required slot at all,
        # this is where INSUFFICIENT_WARDROBE would be raised upstream.
        if not all(slot_options.get(slot) for slot in slots_to_fill):
            continue

        combos = product(*[slot_options[slot] for slot in slots_to_fill])
        for combo in combos:
            item_ids = [item.id for item in combo]
            if all(req_id in item_ids for req_id in required_item_ids):
                candidates.append(CandidateOutfit(item_ids=item_ids))

    return candidates
