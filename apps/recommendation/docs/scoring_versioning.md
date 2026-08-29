# Scoring version management

This explains how the recommendation engine's scoring weights are
versioned, how to move a new version through its lifecycle, and how
rollback works. Code lives in `app/domain/versioning.py`.

## Why this exists

The scoring weights (context fit, color harmony, and so on, from PRD
section 9.3) used to be a hardcoded constant. That made two things
impossible: knowing which exact weights produced a past
recommendation, and changing a weight safely, since editing a
constant in place has no history and no review step. This module
fixes both, entirely in-process, no database or backend API involved.
That comes later, when this service is wired up for real.

## Validation

A `ScoringWeights` instance is validated the moment it is created, not
afterward:

- No weight may be negative.
- The eight weights must sum to 1.0 (within a small floating point
  tolerance, since literals like `0.25 + 0.20 + ...` can pick up tiny
  representation error even when they are obviously meant to total
  exactly 1.0).

Both checks raise `InvalidWeightsError` from inside
`ScoringWeights.__post_init__`, so there is no way to construct an
invalid weight set and have it sit around unnoticed; the error
happens at the point of creation, not later when something tries to
use it.

## Draft versions can never drive a real recommendation

`generate_recommendations` never accepts a bare `ScoringVersion`
object. Instead, if you want to score against something other than
the currently active version, you pass a `scoring_version_id: str`,
and it is resolved through `registry.get_for_scoring(version_id)`.
That method enforces two things together:

- The id must actually be registered. A fabricated id, a typo, or an
  id from a different registry raises `VersionNotFoundError`.
- The version must not be a draft. An unreviewed draft raises
  `DraftVersionNotAllowedError`. Only `approved`, `active`,
  `superseded`, or `rolled-back` versions, all of which have passed
  review at some point, are usable.

This means there is no code path that lets an unreviewed or
unregistered weight set silently produce a real recommendation.

## The lifecycle

A scoring version moves through five statuses:

```
draft -> approved -> active -> superseded
                        |
                        v
                   rolled-back
```

- **draft**: just created, not yet reviewed. Never used for real
  recommendations by default.
- **approved**: reviewed and signed off, but not yet the version in
  use.
- **active**: the version currently producing recommendations.
  Exactly one version is active at a time.
- **superseded**: was active, then a newer approved version was
  activated over it, in the normal forward direction.
- **rolled-back**: was active, then someone reverted away from it
  back to an older version. This is distinct from superseded so you
  can tell "replaced by newer work" apart from "backed out of".

A version's weights and version_id never change after creation,
regardless of status. Every status change produces a new record
internally; nothing is edited in place. This is enforced by the data
being frozen (immutable) dataclasses, not just a convention, so
attempting to mutate one raises an error rather than silently
succeeding.

## Basic usage

```python
from app.domain.versioning import ScoringWeights, VersionRegistry

registry = VersionRegistry()

# 1. Create a draft with new weights
draft = registry.create_draft(
    weights=ScoringWeights(
        context_fit=0.25,
        color_harmony=0.25,   # bumped up from 0.20
        formality_consistency=0.15,
        silhouette_fit=0.12,
        pattern_material=0.10,
        personal_preference=0.08,  # lowered to keep weights summing sensibly
        weather_practicality=0.05,
        novelty=0.00,
    ),
    owner="mahira",
    reason="Increasing color harmony weight based on golden set review.",
)

# 2. Get it reviewed and approved
approved = registry.approve(draft.version_id, reviewer="pratyush")

# 3. Activate it
registry.activate(approved.version_id)

# Now registry.get_active() returns this version, and every new
# recommendation will report this version_id.
```

## Rolling back

If an activated version turns out to be wrong, roll back to whichever
version was active before it:

```python
registry.rollback_to(previous_version.version_id)
```

`rollback_to` only accepts a version whose status is `superseded` or
`rolled-back`, since only a version that was previously active is a
valid rollback target. Trying to roll back to a version that was
never active (for example one still sitting in `draft` or `approved`)
raises `InvalidVersionTransitionError`. Use `activate` for that
instead, once it's been approved.

You can roll forward again later, back to the version you rolled back
from, using the same `rollback_to` call, since a `rolled-back` version
is itself a valid rollback target.

## Using a version in the recommendation pipeline

By default, `generate_recommendations` uses a module-level default
registry, seeded once with the original PRD 9.3 weights, already
approved and active, so existing behavior is unchanged unless you do
something explicitly:

```python
from app.domain.pipeline import generate_recommendations, get_default_registry

# Uses whatever is currently active in the default registry.
results = generate_recommendations(wardrobe, occasion)

# Or score against a specific version explicitly, by id, useful for
# previewing an approved-but-not-yet-active version against real data
# before activating it for everyone. The id must belong to a version
# that has been approved at some point; passing a draft's id raises
# DraftVersionNotAllowedError, and passing an id this registry never
# issued raises VersionNotFoundError.
results = generate_recommendations(
    wardrobe, occasion, scoring_version_id=approved_version.version_id
)
```

Every result includes which version produced it:

```python
results[0]["scoring_version"]  # e.g. "v1"
```

To change what "default" means going forward, get the shared registry
and activate a new version on it:

```python
registry = get_default_registry()
new_version = registry.create_draft(weights=..., owner=..., reason=...)
approved = registry.approve(new_version.version_id, reviewer=...)
registry.activate(approved.version_id)
# From this point on, generate_recommendations(...) without an
# explicit scoring_version_id uses this new version.
```

For tests, or anything that needs a fully isolated set of versions
rather than sharing the module-level default, pass a separate
registry instance directly:

```python
results = generate_recommendations(wardrobe, occasion, registry=my_own_registry)
```

## What this does not do yet

- No persistence. Versions live in memory for the life of the
  process; restarting the service resets to the seeded default.
  Backend persistence is a later integration step, not part of this
  module.
- No backend API or database tables. This is purely a service-local,
  code-based mechanism for now.
- No automatic weight tuning or golden-set evaluation. Deciding what
  the next version's weights should be is still a manual, human
  decision; this module only manages the lifecycle of that decision
  once made.
