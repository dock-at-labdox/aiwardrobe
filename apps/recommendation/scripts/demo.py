"""
Quick manual check that the pipeline runs end to end against mock
data. Not a substitute for the golden evaluation set, just a sanity
check while building.

Run with: python -m app.demo
"""

from app.domain.models import Occasion
from app.domain.pipeline import generate_recommendations
from app.mocks.mock_wardrobe import MOCK_WARDROBE

if __name__ == "__main__":
    occasion = Occasion(
        id="occ_demo_1",
        occasion_type="client_meeting",
        desired_formality="business",
        required_item_ids=["itm_001"],
        excluded_item_ids=[],
        excluded_colors=[],
    )

    results = generate_recommendations(MOCK_WARDROBE, occasion)

    for i, outfit in enumerate(results, start=1):
        score_out_of_10 = outfit["overall_score"] * 10
        print(f"\nOutfit {i}: {outfit['item_ids']}")
        print(f"  Overall score: {score_out_of_10:.1f} / 10")
        print(f"  Scoring version: {outfit['scoring_version']}")
        print(f"  Explanation: {outfit['explanation']}")
