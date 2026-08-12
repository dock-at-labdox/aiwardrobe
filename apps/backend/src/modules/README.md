# Bounded contexts

Each directory reserves one backend module: identity-consent, profiles, wardrobe,
media, occasions, recommendations, outfits-planner, tryon, feedback, billing,
admin, audit, and integration-events. Every feature module will own `api`,
`application`, `domain`, `infrastructure`, and `tests`; cross-module table writes
and direct imports into another module's internals are prohibited.
