"""
Stage 1: eligibility rules. Deterministic filtering, no scoring here.
Anything that survives this stage is usable for the occasion; anything
that does not survive is never scored, never shown, and never enters
candidate generation.
"""

from app.domain.models import Occasion, WardrobeItem

UNAVAILABLE_STATUSES = {"laundry", "packed", "archived", "lent", "donated"}


def filter_eligible_items(
    wardrobe: list[WardrobeItem], occasion: Occasion
) -> list[WardrobeItem]:
    """Return only items that could legally appear in a candidate for
    this occasion. Required items are validated separately, since a
    required item that fails eligibility is a conflict, not a silent
    drop.
    """
    eligible = []
    for item in wardrobe:
        if item.status in UNAVAILABLE_STATUSES:
            continue
        if item.id in occasion.excluded_item_ids:
            continue
        if item.color.semantic_family in occasion.excluded_colors:
            continue
        eligible.append(item)
    return eligible


def check_required_items(
    wardrobe: list[WardrobeItem], occasion: Occasion
) -> list[str]:
    """Return the IDs of required items that are missing or unavailable.
    A non-empty result means the caller should raise
    CONSTRAINT_CONFLICT rather than proceed.
    """
    wardrobe_by_id = {item.id: item for item in wardrobe}
    conflicts = []
    for required_id in occasion.required_item_ids:
        item = wardrobe_by_id.get(required_id)
        if item is None or item.status in UNAVAILABLE_STATUSES:
            conflicts.append(required_id)
    return conflicts
