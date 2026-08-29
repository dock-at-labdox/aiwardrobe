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
from math import isclose

# How close the eight weights must sum to 1.0 to count as normalized.
# Not zero, since float weight literals like 0.25 + 0.20 + ... can
# accumulate tiny representation error even when the values are
# "obviously" meant to sum to exactly 1.0.
WEIGHT_SUM_TOLERANCE = 1e-6


class VersionStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    ROLLED_BACK = "rolled-back"


class VersionError(Exception):
    """Base class for versioning errors."""


class InvalidWeightsError(VersionError):
    """Raised when a ScoringWeights instance would have a negative
    weight, or its eight weights don't sum to 1.0. Raised from
    ScoringWeights.__post_init__, so it is impossible to construct an
    invalid ScoringWeights at all, not just discouraged.
    """


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


class DraftVersionNotAllowedError(VersionError):
    """Raised when something tries to use a draft version to actually
    generate a recommendation. Drafts are for review, never for real
    scoring, since they haven't been approved by anyone yet.
    """

    def __init__(self, version_id: str) -> None:
        super().__init__(
            f"Scoring version {version_id!r} is still a draft and has not "
            "been approved. Draft versions cannot be used to generate real "
            "recommendations; approve it first."
        )
        self.version_id = version_id


@dataclass(frozen=True)
class ScoringWeights:
    """The eight PRD section 9.3 weight components. Frozen so that,
    once a ScoringWeights instance exists, its values can never be
    changed in place. Changing a weight always means creating a new
    ScoringWeights and a new ScoringVersion around it, never editing
    this one.

    Validated on construction: no weight may be negative, and the
    eight weights must sum to 1.0 (within floating point tolerance).
    This makes an invalid weight set impossible to create in the
    first place, rather than something callers have to remember to
    check afterward.
    """

    context_fit: float
    color_harmony: float
    formality_consistency: float
    silhouette_fit: float
    pattern_material: float
    personal_preference: float
    weather_practicality: float
    novelty: float

    def __post_init__(self) -> None:
        for name, value in self.as_dict().items():
            if value < 0:
                raise InvalidWeightsError(
                    f"Weight {name!r} cannot be negative, got {value}."
                )
        total = sum(self.as_dict().values())
        if not isclose(total, 1.0, abs_tol=WEIGHT_SUM_TOLERANCE):
            raise InvalidWeightsError(
                f"Weights must sum to 1.0, got {total} instead."
            )

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

    def get_for_scoring(self, version_id: str) -> ScoringVersion:
        """Resolve a version_id to a version that is actually safe to
        score real recommendations with: it must be registered here
        (raises VersionNotFoundError otherwise, so a fabricated or
        unregistered ScoringVersion can never be used, only one this
        registry actually issued) and it must not be a draft (raises
        DraftVersionNotAllowedError otherwise, since an unreviewed
        draft must never silently drive real recommendations). This
        is the only sanctioned way to turn a version_id into
        something the scoring pipeline is allowed to use; nothing in
        the pipeline should call get() directly for that purpose.
        """
        version = self._require(version_id)
        if version.status == VersionStatus.DRAFT:
            raise DraftVersionNotAllowedError(version_id)
        return version

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
