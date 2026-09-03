"""
Core data shapes for the recommendation service. These mirror the
WardrobeItem, ColorProfile, Occasion and Outfit entities in PRD section
11, trimmed to what this service actually needs.
"""

from dataclasses import dataclass, field
from typing import TypedDict


@dataclass
class ColorProfile:
    dominant_lab: tuple[float, float, float]
    semantic_family: str
    semantic_shade: str
    confidence: float


@dataclass
class WardrobeItem:
    id: str
    category: str  # layer, top, bottom, one_piece, footwear, accessory
    subtype: str
    color: ColorProfile
    pattern: str
    material_family: str
    formality: str
    silhouette: str | None
    status: str  # active, laundry, packed, archived, lent, donated


@dataclass
class Occasion:
    id: str
    occasion_type: str
    desired_formality: str
    required_item_ids: list[str] = field(default_factory=list)
    excluded_item_ids: list[str] = field(default_factory=list)
    excluded_colors: list[str] = field(default_factory=list)


@dataclass
class ScoreComponents:
    """The eight raw component scores from PRD section 9.3, before any
    weighting is applied. Weighting them into a single overall score
    is done separately using an active ScoringVersion's weights (see
    app/domain/versioning.py), not by this class, since the weights
    themselves are now versioned rather than a fixed constant.
    """

    context_fit: float
    color_harmony: float
    formality_consistency: float
    silhouette_fit: float
    pattern_material: float
    personal_preference: float
    weather_practicality: float
    novelty: float


@dataclass
class CandidateOutfit:
    """Unscored candidate outfit, produced by candidate_generation. Has
    no scores field at all, on purpose. Trying to call .overall() or
    read scores on one of these should be a type error, not a runtime
    None-check, since scoring genuinely has not happened yet at this
    point in the pipeline.
    """

    item_ids: list[str]


@dataclass
class ScoredCandidateOutfit:
    """A CandidateOutfit that has been through scoring. scores and
    overall_score are both required, non-optional fields, so every
    function downstream of scoring can rely on them existing without
    a None check. overall_score is computed once, at scoring time,
    from the active ScoringVersion's weights, and stored here so that
    later stages (diversity rerank) never need to know about weights
    or versions at all, only this single precomputed number.
    """

    item_ids: list[str]
    scores: ScoreComponents
    overall_score: float
    explanation: str | None = None


class RecommendationResult(TypedDict):
    """The shape returned to callers of generate_recommendations, one
    per ranked outfit. Using a TypedDict here instead of a plain dict
    means every field's type is checked at every access site, rather
    than degrading to object and forcing isinstance checks wherever
    the result is consumed (demo.py, tests, and eventually the real
    API layer). scoring_version records exactly which scoring rule
    version produced this result, per the versioning requirement.
    """

    item_ids: list[str]
    overall_score: float
    score_components: dict[str, float]
    explanation: str
    scoring_version: str
