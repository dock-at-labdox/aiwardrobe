"""
Unit tests for diversity_rerank.py. Focused on the two behaviors that
actually matter for REC-002 (safe, balanced, distinctive results): the
single highest-scoring candidate is always picked first, and the
remaining picks are influenced by dissimilarity, not just raw score.
"""

from app.domain.diversity_rerank import rerank_for_diversity
from app.domain.models import ScoreComponents, ScoredCandidateOutfit


def make_scored(item_ids: list[str], overall_score: float) -> ScoredCandidateOutfit:
    # The exact component breakdown doesn't matter for these tests,
    # only the resulting overall_score, which is now a direct field
    # rather than something computed from weighted components.
    scores = ScoreComponents(
        context_fit=overall_score,
        color_harmony=overall_score,
        formality_consistency=overall_score,
        silhouette_fit=overall_score,
        pattern_material=overall_score,
        personal_preference=overall_score,
        weather_practicality=overall_score,
        novelty=overall_score,
    )
    return ScoredCandidateOutfit(item_ids=item_ids, scores=scores, overall_score=overall_score)


def test_empty_list_returns_empty() -> None:
    assert rerank_for_diversity([]) == []


def test_highest_scoring_candidate_is_always_selected_first() -> None:
    low = make_scored(["a", "b"], overall_score=0.3)
    high = make_scored(["c", "d"], overall_score=0.9)
    mid = make_scored(["e", "f"], overall_score=0.6)

    result = rerank_for_diversity([low, high, mid], top_n=3)

    assert result[0] is high


def test_near_duplicate_is_deprioritized_in_favor_of_a_distinct_option() -> None:
    # "high" and "near_duplicate" share every item, so they are
    # maximally similar. "different" scores lower on raw score but
    # shares nothing with "high". With lambda favoring some
    # diversity, "different" should be preferred over the near
    # duplicate for the second slot, since picking it twice in
    # nearly identical form would violate REC-002's requirement for
    # meaningfully different options.
    high = make_scored(["blazer", "shirt", "trousers"], overall_score=0.9)
    near_duplicate = make_scored(["blazer", "shirt", "trousers2"], overall_score=0.85)
    different = make_scored(["dress", "heels", "bag"], overall_score=0.7)

    result = rerank_for_diversity(
        [high, near_duplicate, different], top_n=2, lambda_param=0.5
    )

    assert result[0] is high
    assert result[1] is different


def test_respects_top_n_limit() -> None:
    candidates = [make_scored([f"item_{i}"], overall_score=0.1 * i) for i in range(5)]
    result = rerank_for_diversity(candidates, top_n=2)
    assert len(result) == 2


def test_never_returns_more_than_available_candidates() -> None:
    candidates = [make_scored(["a"], overall_score=0.5), make_scored(["b"], overall_score=0.6)]
    result = rerank_for_diversity(candidates, top_n=5)
    assert len(result) == 2
