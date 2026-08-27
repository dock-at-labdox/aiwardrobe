"""
Stage 3: scoring. Computes the eight weighted components from PRD
section 9.3, each independently, so they can be tested and explained
separately.

Color harmony is deliberately not a Delta E distance calculation. Delta
E measures capture accuracy (is the stored color close to the true
garment color), which is a different problem from harmony (do two
different, accurately captured colors look good together). Harmony is
computed here from hue-angle relationships in CIELCh space against
known harmonic templates, per the color harmony research in the doc.
"""

import math

from app.domain.models import (
    CandidateOutfit,
    Occasion,
    ScoreComponents,
    ScoredCandidateOutfit,
    WardrobeItem,
)

# Tolerance, in degrees, for how close two hues must be to a named
# harmonic relationship to count as harmonious. A starting value; needs
# tuning against the golden set, not a fixed constant.
HUE_TOLERANCE_DEGREES = 20.0

HARMONIC_ANGLES = {
    "complementary": 180.0,
    "analogous": 30.0,
    "triadic": 120.0,
}


def _lab_to_lch_hue(lab: tuple[float, float, float]) -> float:
    _, a, b = lab
    hue_radians = math.atan2(b, a)
    hue_degrees = math.degrees(hue_radians)
    return hue_degrees % 360


def _closest_harmonic_match(hue_diff: float) -> float:
    """Return 1.0 for a perfect match to any named harmonic angle,
    decaying linearly to 0 outside the tolerance window. Neutral colors
    (very low chroma) are not handled specially here yet; that is a
    known simplification worth revisiting once real vision-color chroma
    values are available.
    """
    best = 0.0
    for angle in HARMONIC_ANGLES.values():
        diff = abs(hue_diff - angle)
        diff = min(diff, 360 - diff)
        if diff <= HUE_TOLERANCE_DEGREES:
            match = 1.0 - (diff / HUE_TOLERANCE_DEGREES)
            best = max(best, match)
    return best


def score_color_harmony(items: list[WardrobeItem]) -> float:
    if len(items) < 2:
        return 1.0
    hues = [_lab_to_lch_hue(item.color.dominant_lab) for item in items]
    pair_scores = []
    for i in range(len(hues)):
        for j in range(i + 1, len(hues)):
            diff = abs(hues[i] - hues[j])
            pair_scores.append(_closest_harmonic_match(diff))
    return sum(pair_scores) / len(pair_scores)


def score_formality_consistency(items: list[WardrobeItem], occasion: Occasion) -> float:
    matches = sum(1 for item in items if item.formality == occasion.desired_formality)
    return matches / len(items)


def score_context_fit(items: list[WardrobeItem], occasion: Occasion) -> float:
    # Placeholder: real version should weigh industry, seniority and
    # desired impression, per PRD section 7.3. Kept simple here since it
    # depends on occasion fields not yet finalized.
    return score_formality_consistency(items, occasion)


def score_candidate(
    candidate: CandidateOutfit,
    wardrobe_by_id: dict[str, WardrobeItem],
    occasion: Occasion,
) -> ScoreComponents:
    items = [wardrobe_by_id[item_id] for item_id in candidate.item_ids]

    return ScoreComponents(
        context_fit=score_context_fit(items, occasion),
        color_harmony=score_color_harmony(items),
        formality_consistency=score_formality_consistency(items, occasion),
        # Remaining components are stand-ins pending the research gaps
        # flagged in the doc (silhouette, pattern/material) and the
        # personalization service (BPR) for preference and novelty.
        silhouette_fit=0.7,
        pattern_material=0.7,
        personal_preference=0.5,
        weather_practicality=0.8,
        novelty=0.5,
    )


def score_all_candidates(
    candidates: list[CandidateOutfit],
    wardrobe_by_id: dict[str, WardrobeItem],
    occasion: Occasion,
) -> list[ScoredCandidateOutfit]:
    """Takes unscored candidates in, returns scored candidates out, as
    a new list rather than mutating the input in place. This is what
    makes the type change in domain/models.py actually hold: nothing
    downstream can accidentally receive an unscored CandidateOutfit
    and treat it as scored, since this function's return type is
    ScoredCandidateOutfit, not the input type.
    """
    return [
        ScoredCandidateOutfit(
            item_ids=candidate.item_ids,
            scores=score_candidate(candidate, wardrobe_by_id, occasion),
        )
        for candidate in candidates
    ]
