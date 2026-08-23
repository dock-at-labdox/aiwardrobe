"""
Mock wardrobe data, shaped to match the WardrobeItem and ColorProfile
entities in PRD section 11, since the vision-color service is not
available yet. Swap this module for a real data source later; nothing
downstream should need to change when that happens.
"""

from apps.recommendation.domain.models import ColorProfile, WardrobeItem

MOCK_WARDROBE: list[WardrobeItem] = [
    WardrobeItem(
        id="itm_001",
        category="layer",
        subtype="blazer",
        color=ColorProfile(
            dominant_lab=(31.0, -22.0, 10.0),
            semantic_family="green",
            semantic_shade="bottle green",
            confidence=0.86,
        ),
        pattern="solid",
        material_family="wool",
        formality="business",
        silhouette="structured",
        status="active",
    ),
    WardrobeItem(
        id="itm_002",
        category="top",
        subtype="dress shirt",
        color=ColorProfile(
            dominant_lab=(92.0, -1.0, 3.0),
            semantic_family="white",
            semantic_shade="off white",
            confidence=0.95,
        ),
        pattern="solid",
        material_family="cotton",
        formality="business",
        silhouette="tailored",
        status="active",
    ),
    WardrobeItem(
        id="itm_003",
        category="bottom",
        subtype="suit trousers",
        color=ColorProfile(
            dominant_lab=(20.0, 0.0, -8.0),
            semantic_family="navy",
            semantic_shade="navy blue",
            confidence=0.9,
        ),
        pattern="solid",
        material_family="wool",
        formality="business",
        silhouette="tapered",
        status="active",
    ),
    WardrobeItem(
        id="itm_004",
        category="footwear",
        subtype="oxford",
        color=ColorProfile(
            dominant_lab=(15.0, 2.0, 4.0),
            semantic_family="brown",
            semantic_shade="dark brown",
            confidence=0.88,
        ),
        pattern="solid",
        material_family="leather",
        formality="business",
        silhouette=None,
        status="active",
    ),
    WardrobeItem(
        id="itm_005",
        category="accessory",
        subtype="belt",
        color=ColorProfile(
            dominant_lab=(18.0, 3.0, 5.0),
            semantic_family="brown",
            semantic_shade="dark brown",
            confidence=0.82,
        ),
        pattern="solid",
        material_family="leather",
        formality="business",
        silhouette=None,
        status="active",
    ),
    WardrobeItem(
        id="itm_006",
        category="footwear",
        subtype="sneaker",
        color=ColorProfile(
            dominant_lab=(96.0, 0.0, 0.0),
            semantic_family="white",
            semantic_shade="white",
            confidence=0.9,
        ),
        pattern="solid",
        material_family="synthetic",
        formality="athletic",
        silhouette=None,
        status="active",
    ),
    WardrobeItem(
        id="itm_007",
        category="top",
        subtype="knit top",
        color=ColorProfile(
            dominant_lab=(45.0, 10.0, 20.0),
            semantic_family="mustard",
            semantic_shade="mustard yellow",
            confidence=0.8,
        ),
        pattern="solid",
        material_family="knit",
        formality="smart casual",
        silhouette="relaxed",
        status="active",
    ),
    WardrobeItem(
        id="itm_008",
        category="bottom",
        subtype="chinos",
        color=ColorProfile(
            dominant_lab=(50.0, 3.0, 15.0),
            semantic_family="khaki",
            semantic_shade="khaki tan",
            confidence=0.85,
        ),
        pattern="solid",
        material_family="cotton",
        formality="smart casual",
        silhouette="straight",
        status="laundry",
    ),
]
