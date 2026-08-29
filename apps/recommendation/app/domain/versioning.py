"""
Versioning for the recommendation engine's scoring weights.

This exists so that every recommendation can be traced back to exactly
which set of weights produced it, and so that changing the weights is
a deliberate, auditable action rather than editing a constant in
place. This is service-local and code-based, per the task scope: no
database tables, no migrations, no backend API. Backend persistence
is a later integration step.

Lifecycle: draft -> approved -> active -> superseded (normal forward
replacement by a newer approved version) or rolled-back (an active
version that was reverted away from during a rollback). A version's
weights never change after creation, regardless of status; the only
thing that ever changes is which status a version currently holds,
and that status change always produces a new, separate record rather
than mutating the existing one in place.
"""

from dataclasses import dataclass, field, replace
from datetime import UTC, datetime
from enum import Enum


class VersionStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    ROLLED_BACK = "rolled-back"


class VersionError(Exception):
    """Base class for versioning errors."""


class VersionNotFoundError(VersionError):
    def __init__(self, version_id: str) -> None:
        super().__init__(f"No scoring version found with id {version_id!r}.")
        self.version_id = version_id


class InvalidVersionTransitionError(VersionError):
    def __init__(self, version_id: str, from_status: VersionStatus, action: str) -> None:
        super().__init__(
            f"Cannot {action} version {version_id!r}: it is currently "
            f"{from_status.value!r}."
        )
        self.version_id = version_id
        self.from_status = from_status
        self.action = action


class NoActiveVersionError(VersionError):
    def __init__(self) -> None:
        super().__init__("No scoring version is currently active.")


@dataclass(frozen=True)
class ScoringWeights:
    """The eight PRD section 9.3 weight components. Frozen so that,
    once a ScoringWeights instance exists, its values can never be
    changed in place. Changing a weight always means creating a new
    ScoringWeights and a new ScoringVersion around it, never editing
    this one.
    """

    context_fit: float
    color_harmony: float
    formality_consistency: float
    silhouette_fit: float
    pattern_material: float
    personal_preference: float
    weather_practicality: float
    novelty: float

    def as_dict(self) -> dict[str, float]:
        return {
            "context_fit": self.context_fit,
            "color_harmony": self.color_harmony,
            "formality_consistency": self.formality_consistency,
            "silhouette_fit": self.silhouette_fit,
            "pattern_material": self.pattern_material,
            "personal_preference": self.personal_preference,
            "weather_practicality": self.weather_practicality,
            "novelty": self.novelty,
        }


@dataclass(frozen=True)
class ScoringVersion:
    """A single, immutable record of a scoring rule set at a point in
    its lifecycle. Every status transition (approve, activate,
    rollback) produces a new ScoringVersion instance with the same
    version_id and weights, via dataclasses.replace, rather than
    mutating this one. weights and version_id are therefore
    effectively permanent for the life of a version; only status,
    reviewer, and updated_at ever change, and only through the
    VersionRegistry's own methods below, never directly.
    """

    version_id: str
    weights: ScoringWeights
    status: VersionStatus
    owner: str
    reason: str
    created_at: datetime
    updated_at: datetime
    reviewer: str | None = None


@dataclass
class VersionRegistry:
    """In-memory registry of scoring versions for this service
    instance. Not persisted; a fresh process starts from whatever
    create_default_registry() seeds. Real persistence is explicitly
    out of scope for this task and will be added when this service is
    wired up to a backend.
    """

    _versions: dict[str, ScoringVersion] = field(default_factory=dict)
    _active_version_id: str | None = field(default=None)
    _next_id: int = field(default=1)

    def create_draft(self, weights: ScoringWeights, owner: str, reason: str) -> ScoringVersion:
        version_id = f"v{self._next_id}"
        self._next_id += 1
        now = datetime.now(UTC)
        version = ScoringVersion(
            version_id=version_id,
            weights=weights,
            status=VersionStatus.DRAFT,
            owner=owner,
            reason=reason,
            created_at=now,
            updated_at=now,
        )
        self._versions[version_id] = version
        return version

    def approve(self, version_id: str, reviewer: str) -> ScoringVersion:
        version = self._require(version_id)
        if version.status != VersionStatus.DRAFT:
            raise InvalidVersionTransitionError(version_id, version.status, "approve")
        approved = replace(
            version,
            status=VersionStatus.APPROVED,
            reviewer=reviewer,
            updated_at=datetime.now(UTC),
        )
        self._versions[version_id] = approved
        return approved

    def activate(self, version_id: str) -> ScoringVersion:
        """Promote an approved version to active. This is for moving
        forward to a version that has never been active before. The
        previously active version, if any, becomes superseded, since
        this is a normal forward replacement, not a rollback.
        """
        version = self._require(version_id)
        if version.status != VersionStatus.APPROVED:
            raise InvalidVersionTransitionError(version_id, version.status, "activate")
        now = datetime.now(UTC)
        if self._active_version_id is not None:
            current_active = self._versions[self._active_version_id]
            self._versions[self._active_version_id] = replace(
                current_active, status=VersionStatus.SUPERSEDED, updated_at=now
            )
        activated = replace(version, status=VersionStatus.ACTIVE, updated_at=now)
        self._versions[version_id] = activated
        self._active_version_id = version_id
        return activated

    def rollback_to(self, version_id: str) -> ScoringVersion:
        """Revert to a version that was previously active (status
        superseded or rolled-back). The version currently active
        becomes rolled-back, distinct from superseded, since this
        marks an active version being undone rather than normally
        replaced by newer work.
        """
        version = self._require(version_id)
        if version.status not in (VersionStatus.SUPERSEDED, VersionStatus.ROLLED_BACK):
            raise InvalidVersionTransitionError(version_id, version.status, "roll back to")
        now = datetime.now(UTC)
        if self._active_version_id is not None:
            current_active = self._versions[self._active_version_id]
            self._versions[self._active_version_id] = replace(
                current_active, status=VersionStatus.ROLLED_BACK, updated_at=now
            )
        reactivated = replace(version, status=VersionStatus.ACTIVE, updated_at=now)
        self._versions[version_id] = reactivated
        self._active_version_id = version_id
        return reactivated

    def get(self, version_id: str) -> ScoringVersion:
        return self._require(version_id)

    def get_active(self) -> ScoringVersion:
        if self._active_version_id is None:
            raise NoActiveVersionError()
        return self._versions[self._active_version_id]

    def all_versions(self) -> list[ScoringVersion]:
        return list(self._versions.values())

    def _require(self, version_id: str) -> ScoringVersion:
        try:
            return self._versions[version_id]
        except KeyError:
            raise VersionNotFoundError(version_id) from None


def create_default_registry() -> VersionRegistry:
    """Seeds a registry with a single version carrying the exact
    weights already defined in PRD section 9.3, approved and
    activated immediately so existing recommendation behavior does
    not change. This is now the only place those specific weight
    values are written down; the scoring pipeline reads them through
    whichever version is active, not a hardcoded constant.
    """
    registry = VersionRegistry()
    initial_weights = ScoringWeights(
        context_fit=0.25,
        color_harmony=0.20,
        formality_consistency=0.15,
        silhouette_fit=0.12,
        pattern_material=0.10,
        personal_preference=0.10,
        weather_practicality=0.05,
        novelty=0.03,
    )
    draft = registry.create_draft(
        weights=initial_weights,
        owner="system",
        reason=(
            "Initial migration of the PRD section 9.3 hypothesis weights "
            "into the versioning system. Values unchanged from the "
            "original hardcoded constant."
        ),
    )
    approved = registry.approve(draft.version_id, reviewer="system")
    registry.activate(approved.version_id)
    return registry
