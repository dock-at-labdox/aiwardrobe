-- Ensure each wardrobe item has at most one current color profile.
CREATE UNIQUE INDEX "color_profiles_one_current_per_item"
ON "public"."color_profiles" ("wardrobe_item_id")
WHERE "is_current" = true;