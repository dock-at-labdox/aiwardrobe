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

from app.domain.models import CandidateOutfit, WardrobeItem

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


def _slots_to_fill_for_anchor(anchor: WardrobeItem) -> set[str]:
    """Which slots need to be filled for a given anchor.

    A one_piece item (dress, jumpsuit) already covers both top and
    bottom by itself, so it must not also require separate top and
    bottom items, only footwear plus itself. Every other anchor type
    (layer, bottom) still needs the full required-slot set plus its
    own category, same as before.
    """
    if anchor.category == "one_piece":
        return {"footwear", "one_piece"}
    return set(REQUIRED_SLOTS) | {anchor.category}


def _top_candidates_for_slot(
    anchor: WardrobeItem,
    pool: list[WardrobeItem],
    category: str,
    required_item_ids: list[str],
) -> list[WardrobeItem]:
    """Return up to MAX_CANDIDATES_PER_SLOT items for this slot, ranked
    by compatibility with the anchor.

    Any eligible item in this slot that is a pinned/required item is
    always included, even if it would otherwise fall outside the
    top-N cap, since a required item silently disappearing from
    candidates because it ranked 4th on a naive compatibility score
    would violate REC-001, results must contain pinned items.
    """
    slot_items = [item for item in pool if item.category == category]
    ranked = sorted(
        slot_items,
        key=lambda item: _naive_compatibility(anchor, item),
        reverse=True,
    )
    top = ranked[:MAX_CANDIDATES_PER_SLOT]

    top_ids = {item.id for item in top}
    for item in slot_items:
        if item.id in required_item_ids and item.id not in top_ids:
            top.append(item)
            top_ids.add(item.id)

    return top


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
        slots_to_fill = _slots_to_fill_for_anchor(anchor)

        slot_options = {
            slot: (
                [anchor]
                if slot == anchor.category
                else _top_candidates_for_slot(
                    anchor, eligible_items, slot, required_item_ids
                )
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
