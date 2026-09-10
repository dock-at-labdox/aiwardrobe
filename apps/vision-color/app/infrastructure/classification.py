"""Garment category classification using zero-shot CLIP.

For the first version we use CLIP zero-shot classification: it compares the
garment image against short text descriptions of each category and picks the
best match. No training is required. A trained model (DeepFashion + ResNet-50)
is a Phase 2 accuracy improvement.
"""

from __future__ import annotations

import io
from functools import lru_cache
from typing import Any, cast

from PIL import Image
from transformers import pipeline

# Each descriptive phrase maps to one category in our fixed taxonomy.
_LABEL_TO_CATEGORY: dict[str, str] = {
    "a top, shirt, blouse or t-shirt": "TOP",
    "trousers, jeans, a skirt or shorts": "BOTTOM",
    "a blazer, jacket, coat or cardigan": "LAYER",
    "a dress or gown": "DRESS",
    "shoes, sneakers, boots or footwear": "FOOTWEAR",
    "a belt": "BELT",
    "a bag, handbag or backpack": "BAG",
    "a tie or a scarf": "TIE_SCARF",
    "jewelry, a watch, a necklace or a ring": "JEWELRY",
    "some other clothing item": "OTHER",
}


@lru_cache(maxsize=1)
def _classifier() -> Any:
    """Load the zero-shot image classification model once and reuse it."""
    return pipeline(
        "zero-shot-image-classification", model="openai/clip-vit-base-patch32"
    )


def classify_garment(image_bytes: bytes) -> str:
    """Return the garment's category from the fixed taxonomy."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    labels = list(_LABEL_TO_CATEGORY.keys())
    results = _classifier()(image, candidate_labels=labels)
    best_label = cast(str, results[0]["label"])
    return _LABEL_TO_CATEGORY[best_label]