"""
Unit tests for explanation.py, in particular the grounding check,
since that is the actual enforcement mechanism for the rule that
explanations may only rephrase structured facts and never invent one.
A bug here would let a hallucinated explanation through silently.
"""

from app.domain.explanation import (
    ExplanationFact,
    build_structured_facts,
    generate_explanation_stub,
    verify_grounding,
)
from app.domain.models import ColorProfile, ScoreComponents, ScoredCandidateOutfit, WardrobeItem


def make_item(id: str, shade: str = "bottle green", category: str = "layer") -> WardrobeItem:
    return WardrobeItem(
        id=id,
        category=category,
        subtype="test item",
        color=ColorProfile(
            dominant_lab=(31.0, -22.0, 10.0),
            semantic_family="green",
            semantic_shade=shade,
            confidence=0.9,
        ),
        pattern="solid",
        material_family="wool",
        formality="business",
        silhouette=None,
        status="active",
    )


def make_scored_candidate(item_ids: list[str]) -> ScoredCandidateOutfit:
    scores = ScoreComponents(
        context_fit=0.8,
        color_harmony=0.7,
        formality_consistency=0.9,
        silhouette_fit=0.7,
        pattern_material=0.7,
        personal_preference=0.5,
        weather_practicality=0.8,
        novelty=0.5,
    )
    return ScoredCandidateOutfit(item_ids=item_ids, scores=scores, overall_score=0.75)


def test_build_structured_facts_includes_every_item_and_score() -> None:
    wardrobe = {
        "itm_1": make_item("itm_1", shade="bottle green"),
        "itm_2": make_item("itm_2", shade="off white"),
    }
    candidate = make_scored_candidate(["itm_1", "itm_2"])

    facts = build_structured_facts(candidate, wardrobe)
    fact_values = {f.value for f in facts}

    assert "bottle green" in fact_values
    assert "off white" in fact_values
    # Overall and color harmony scores must both be present, since the
    # explanation stub references color_harmony_score by exact label.
    labels = {f.label for f in facts}
    assert "overall_score" in labels
    assert "color_harmony_score" in labels


def test_generate_explanation_stub_only_uses_given_facts() -> None:
    wardrobe = {"itm_1": make_item("itm_1", shade="mustard yellow")}
    candidate = make_scored_candidate(["itm_1"])
    facts = build_structured_facts(candidate, wardrobe)

    explanation = generate_explanation_stub(facts)

    assert "mustard yellow" in explanation


def test_verify_grounding_accepts_explanation_referencing_real_facts() -> None:
    facts = [ExplanationFact("item_itm_1_shade", "bottle green")]
    explanation = "This combination pairs bottle green with a clean silhouette."
    assert verify_grounding(explanation, facts) is True


def test_verify_grounding_rejects_explanation_with_no_matching_fact() -> None:
    # This is the actual safety property: an explanation that mentions
    # a color never present in the structured facts must be rejected,
    # since that would mean the explanation invented a detail rather
    # than rephrasing a real one.
    facts = [ExplanationFact("item_itm_1_shade", "bottle green")]
    hallucinated_explanation = "This combination pairs a striking crimson red top."
    assert verify_grounding(hallucinated_explanation, facts) is False


def test_end_to_end_stub_explanation_passes_its_own_grounding_check() -> None:
    # The stub is grounded by construction, so this should always be
    # true; if it were ever false, the stub itself would be broken.
    wardrobe = {"itm_1": make_item("itm_1", shade="navy blue")}
    candidate = make_scored_candidate(["itm_1"])
    facts = build_structured_facts(candidate, wardrobe)
    explanation = generate_explanation_stub(facts)

    assert verify_grounding(explanation, facts) is True
