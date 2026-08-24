"""
Core data shapes for the recommendation service. These mirror the
WardrobeItem, ColorProfile, Occasion and Outfit entities in PRD section
11, trimmed to what this service actually needs.
"""

from dataclasses import dataclass, field


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
    WEIGHTS = {
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
        return sum(
            getattr(self, key) * weight
            for key, weight in self.WEIGHTS.items()
        )


@dataclass
class CandidateOutfit:
    item_ids: list[str]
    scores: ScoreComponents | None = None
    explanation: str | None = None
