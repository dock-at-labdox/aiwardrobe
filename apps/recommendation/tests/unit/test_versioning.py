"""
Tests for app/domain/versioning.py: version creation, immutability,
the approve/activate lifecycle, and rollback. These are the behaviors
the whole versioning task exists to guarantee, so each is tested for
the actual mechanism, not just the happy path.
"""

from dataclasses import FrozenInstanceError

import pytest

from app.domain.versioning import (
    InvalidVersionTransitionError,
    NoActiveVersionError,
    ScoringWeights,
    VersionNotFoundError,
    VersionRegistry,
    VersionStatus,
    create_default_registry,
)


def make_weights(context_fit: float = 0.25) -> ScoringWeights:
    return ScoringWeights(
        context_fit=context_fit,
        color_harmony=0.20,
        formality_consistency=0.15,
        silhouette_fit=0.12,
        pattern_material=0.10,
        personal_preference=0.10,
        weather_practicality=0.05,
        novelty=0.03,
    )


def test_create_draft_produces_draft_status() -> None:
    registry = VersionRegistry()
    version = registry.create_draft(make_weights(), owner="mahira", reason="testing")
    assert version.status == VersionStatus.DRAFT
    assert version.owner == "mahira"
    assert version.reviewer is None


def test_weights_are_frozen_and_cannot_be_mutated() -> None:
    weights = make_weights()
    with pytest.raises(FrozenInstanceError):
        weights.context_fit = 0.9  # type: ignore[misc]


def test_version_is_frozen_and_cannot_be_mutated_directly() -> None:
    registry = VersionRegistry()
    version = registry.create_draft(make_weights(), owner="mahira", reason="testing")
    with pytest.raises(FrozenInstanceError):
        version.status = VersionStatus.APPROVED  # type: ignore[misc]


def test_approve_transitions_draft_to_approved_and_sets_reviewer() -> None:
    registry = VersionRegistry()
    draft = registry.create_draft(make_weights(), owner="mahira", reason="testing")
    approved = registry.approve(draft.version_id, reviewer="pratyush")
    assert approved.status == VersionStatus.APPROVED
    assert approved.reviewer == "pratyush"
    # The weights must be identical to the original draft's, since
    # approval changes status, never the weights themselves.
    assert approved.weights == draft.weights


def test_approve_rejects_a_version_that_is_not_a_draft() -> None:
    registry = VersionRegistry()
    draft = registry.create_draft(make_weights(), owner="mahira", reason="testing")
    registry.approve(draft.version_id, reviewer="pratyush")
    with pytest.raises(InvalidVersionTransitionError):
        registry.approve(draft.version_id, reviewer="pratyush")


def test_activate_requires_approved_status() -> None:
    registry = VersionRegistry()
    draft = registry.create_draft(make_weights(), owner="mahira", reason="testing")
    with pytest.raises(InvalidVersionTransitionError):
        registry.activate(draft.version_id)


def test_activate_marks_previous_active_version_as_superseded() -> None:
    registry = VersionRegistry()
    v1 = registry.create_draft(make_weights(0.25), owner="mahira", reason="v1")
    registry.approve(v1.version_id, reviewer="pratyush")
    registry.activate(v1.version_id)

    v2 = registry.create_draft(make_weights(0.30), owner="mahira", reason="v2")
    registry.approve(v2.version_id, reviewer="pratyush")
    registry.activate(v2.version_id)

    assert registry.get_active().version_id == v2.version_id
    assert registry.get(v1.version_id).status == VersionStatus.SUPERSEDED
    assert registry.get(v2.version_id).status == VersionStatus.ACTIVE


def test_get_active_raises_when_nothing_is_active_yet() -> None:
    registry = VersionRegistry()
    with pytest.raises(NoActiveVersionError):
        registry.get_active()


def test_get_raises_for_unknown_version_id() -> None:
    registry = VersionRegistry()
    with pytest.raises(VersionNotFoundError):
        registry.get("does_not_exist")


def test_rollback_requires_a_previously_active_version() -> None:
    registry = VersionRegistry()
    draft = registry.create_draft(make_weights(), owner="mahira", reason="testing")
    approved = registry.approve(draft.version_id, reviewer="pratyush")
    # approved but never activated, so it has never been active and
    # cannot be the rollback target.
    with pytest.raises(InvalidVersionTransitionError):
        registry.rollback_to(approved.version_id)


def test_rollback_reactivates_old_version_and_marks_current_as_rolled_back() -> None:
    registry = VersionRegistry()
    v1 = registry.create_draft(make_weights(0.25), owner="mahira", reason="v1")
    registry.approve(v1.version_id, reviewer="pratyush")
    registry.activate(v1.version_id)

    v2 = registry.create_draft(make_weights(0.30), owner="mahira", reason="v2")
    registry.approve(v2.version_id, reviewer="pratyush")
    registry.activate(v2.version_id)

    rolled_back_to = registry.rollback_to(v1.version_id)

    assert rolled_back_to.status == VersionStatus.ACTIVE
    assert rolled_back_to.version_id == v1.version_id
    assert registry.get_active().version_id == v1.version_id
    # v2 was rolled back away from, distinct from a normal supersede.
    assert registry.get(v2.version_id).status == VersionStatus.ROLLED_BACK


def test_can_roll_forward_again_after_a_rollback() -> None:
    """A version with status rolled-back must itself be a valid
    rollback target later, since a team might roll back, then decide
    to roll forward to that same version again.
    """
    registry = VersionRegistry()
    v1 = registry.create_draft(make_weights(0.25), owner="mahira", reason="v1")
    registry.approve(v1.version_id, reviewer="pratyush")
    registry.activate(v1.version_id)

    v2 = registry.create_draft(make_weights(0.30), owner="mahira", reason="v2")
    registry.approve(v2.version_id, reviewer="pratyush")
    registry.activate(v2.version_id)

    registry.rollback_to(v1.version_id)  # v2 is now rolled-back
    reactivated_v2 = registry.rollback_to(v2.version_id)

    assert reactivated_v2.status == VersionStatus.ACTIVE
    assert registry.get_active().version_id == v2.version_id
    assert registry.get(v1.version_id).status == VersionStatus.ROLLED_BACK


def test_default_registry_seeds_an_active_version_matching_prd_weights() -> None:
    registry = create_default_registry()
    active = registry.get_active()
    assert active.status == VersionStatus.ACTIVE
    assert active.weights.context_fit == 0.25
    assert active.weights.color_harmony == 0.20
    assert active.weights.novelty == 0.03
