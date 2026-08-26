"""
Stage 4: diversity rerank, using Maximal Marginal Relevance. Greedily
picks the next outfit that maximizes score minus similarity to
whatever has already been picked, so the final list is safe, balanced
and distinctive per REC-002, not three near-duplicates.
"""

from apps.recommendation.domain.models import ScoredCandidateOutfit

# Closer to 1.0 favors raw score, closer to 0.5 favors distinctiveness.
# Since our candidates are already pre-filtered by hard eligibility
# rules, they should be less redundant going in than a typical search
# result set, so this starts higher than a generic MMR use case. Needs
# validation against the golden set, not treated as final.
DEFAULT_LAMBDA = 0.7


def _similarity(a: ScoredCandidateOutfit, b: ScoredCandidateOutfit) -> float:
    """Jaccard overlap of item IDs, a cheap stand-in for embedding
    distance between outfits. Fine for an MVP; revisit once the
    embedding benchmark is done.
    """
    set_a, set_b = set(a.item_ids), set(b.item_ids)
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def rerank_for_diversity(
    scored_candidates: list[ScoredCandidateOutfit],
    top_n: int = 3,
    lambda_param: float = DEFAULT_LAMBDA,
) -> list[ScoredCandidateOutfit]:
    remaining = sorted(
        scored_candidates, key=lambda c: c.scores.overall(), reverse=True
    )
    if not remaining:
        return []

    selected = [remaining.pop(0)]

    while remaining and len(selected) < top_n:
        best_candidate = None
        best_mmr = float("-inf")
        for candidate in remaining:
            max_similarity = max(
                _similarity(candidate, chosen) for chosen in selected
            )
            mmr = (
                lambda_param * candidate.scores.overall()
                - (1 - lambda_param) * max_similarity
            )
            if mmr > best_mmr:
                best_mmr = mmr
                best_candidate = candidate

        selected.append(best_candidate)
        remaining.remove(best_candidate)

    return selected
