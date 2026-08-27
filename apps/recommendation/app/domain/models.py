"""
Core data shapes for the recommendation service. These mirror the
WardrobeItem, ColorProfile, Occasion and Outfit entities in PRD section
11, trimmed to what this service actually needs.
"""

from dataclasses import dataclass, field
from typing import ClassVar, TypedDict


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
    context_fit: float
    color_harmony: float
    formality_consistency: float
    silhouette_fit: float
    pattern_material: float
    personal_preference: float
    weather_practicality: float
    novelty: float

    # Weights from PRD section 9.3. Flagged there as an initial
    # hypothesis, not final, so this constant is the one place to
    # change during weight tuning against the golden set.
    WEIGHTS: ClassVar[dict[str, float]] = {
        "context_fit": 0.25,
        "color_harmony": 0.20,
        "formality_consistency": 0.15,
        "silhouette_fit": 0.12,
        "pattern_material": 0.10,
        "personal_preference": 0.10,
        "weather_practicality": 0.05,
        "novelty": 0.03,
    }

    def overall(self) -> float:
        components: dict[str, float] = {
            "context_fit": self.context_fit,
            "color_harmony": self.color_harmony,
            "formality_consistency": self.formality_consistency,
            "silhouette_fit": self.silhouette_fit,
            "pattern_material": self.pattern_material,
            "personal_preference": self.personal_preference,
            "weather_practicality": self.weather_practicality,
            "novelty": self.novelty,
        }
        return sum(
            components[key] * weight for key, weight in self.WEIGHTS.items()
        )


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
    """A CandidateOutfit that has been through scoring. scores is a
    required, non-optional field here, not an Optional on the
    unscored type, so every function downstream of scoring can rely
    on candidate.scores existing without a None check, and the type
    checker enforces that a caller cannot pass an unscored candidate
    into a stage that expects one.
    """

    item_ids: list[str]
    scores: ScoreComponents
    explanation: str | None = None


class RecommendationResult(TypedDict):
    """The shape returned to callers of generate_recommendations, one
    per ranked outfit. Using a TypedDict here instead of a plain dict
    means every field's type is checked at every access site, rather
    than degrading to object and forcing isinstance checks wherever
    the result is consumed (demo.py, tests, and eventually the real
    API layer).
    """

    item_ids: list[str]
    overall_score: float
    score_components: dict[str, float]
    explanation: str
