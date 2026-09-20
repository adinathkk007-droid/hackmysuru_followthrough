"""Explainable, rules-based complaint risk engine for HackMysuru Follow-through.

No framework or database dependency is required. The backend can import
``calculateComplaintRisk`` and provide a complaint plus runtime context.
"""

from __future__ import annotations

from datetime import datetime, timezone
from math import radians, sin, cos, asin, sqrt
from typing import Any, Mapping, Sequence

TERMINAL_STATUSES = {"RESOLVED", "REJECTED"}
STATUSES = {
    "SUBMITTED",
    "ASSIGNED",
    "ACKNOWLEDGED",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED",
}
PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


def _parse_iso(value: Any, field_name: str) -> datetime:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} is required and must be an ISO-8601 string")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"{field_name} must be a valid ISO-8601 timestamp") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _hours_between(later: datetime, earlier: datetime) -> float:
    return max(0.0, (later - earlier).total_seconds() / 3600.0)


def _age_points(hours: float) -> tuple[int, str | None]:
    if hours < 24:
        return 0, None
    if hours < 48:
        return 5, f"Complaint has been open for about {hours:.0f} hours."
    if hours < 72:
        return 10, f"Complaint has been open for about {hours:.0f} hours."
    if hours < 120:
        return 15, f"Complaint has been open for about {hours:.0f} hours."
    return 20, f"Complaint has been open for about {hours:.0f} hours."


def _inactivity_points(hours: float) -> tuple[int, str | None]:
    if hours < 12:
        return 0, None
    if hours < 24:
        return 5, f"No meaningful update for about {hours:.0f} hours."
    if hours < 48:
        return 15, f"No meaningful update for about {hours:.0f} hours."
    if hours < 72:
        return 22, f"No meaningful update for about {hours:.0f} hours."
    return 30, f"No meaningful update for about {hours:.0f} hours."


def _priority_points(priority: str) -> tuple[int, str | None]:
    points = {"LOW": 0, "MEDIUM": 8, "HIGH": 15, "CRITICAL": 20}[priority]
    if points == 0:
        return points, None
    return points, f"Priority is {priority}, increasing attention required."


def _history_points(inactivity_hours: float, historical_hours: float) -> tuple[int, str | None]:
    if historical_hours <= 0:
        return 0, None
    ratio = inactivity_hours / historical_hours
    if ratio < 1:
        return 0, None
    if ratio < 2:
        return 5, f"Inactivity is longer than the historical average resolution time of about {historical_hours:.0f} hours."
    return 10, f"Inactivity is at least twice the historical average resolution time of about {historical_hours:.0f} hours."


def _workload_points(open_count: int) -> tuple[int, str | None]:
    if open_count < 5:
        return 0, None
    if open_count < 10:
        return 4, f"Assigned authority currently has {open_count} open complaints."
    if open_count < 15:
        return 7, f"Assigned authority currently has {open_count} open complaints, indicating a high workload."
    return 10, f"Assigned authority currently has {open_count} open complaints, indicating a very high workload."


def _delay_points(repeated_delays: int) -> tuple[int, str | None]:
    if repeated_delays <= 0:
        return 0, None
    if repeated_delays == 1:
        return 4, "Complaint history shows 1 previous delay."
    if repeated_delays == 2:
        return 7, "Complaint history shows 2 previous delays."
    return 10, f"Complaint history shows {repeated_delays} previous delays."


def _level_for_score(score: int) -> str:
    if score < 25:
        return "LOW"
    if score < 50:
        return "MEDIUM"
    if score < 75:
        return "HIGH"
    return "CRITICAL"


def calculateComplaintRisk(complaint: Mapping[str, Any], context: Mapping[str, Any] | None = None) -> dict[str, Any]:
    """Calculate an explainable active-delay risk score from 0 to 100.

    Required complaint fields: id, status, priority, createdAt, updatedAt.
    Context may provide now, historicalAverageResolutionHours,
    authorityOpenComplaints, and repeatedDelays.
    """
    context = context or {}
    if not isinstance(complaint, Mapping):
        raise ValueError("complaint must be an object/mapping")

    missing = [
        field
        for field in ("id", "status", "priority", "createdAt", "updatedAt")
        if field not in complaint or complaint[field] in (None, "")
    ]
    if missing:
        raise ValueError("Missing required complaint data: " + ", ".join(missing))

    status = str(complaint["status"]).upper()
    priority = str(complaint["priority"]).upper()
    if status not in STATUSES:
        raise ValueError(f"status must be one of: {', '.join(sorted(STATUSES))}")
    if priority not in PRIORITIES:
        raise ValueError(f"priority must be one of: {', '.join(sorted(PRIORITIES))}")

    now_value = context.get("now")
    now = _parse_iso(now_value, "context.now") if now_value else datetime.now(timezone.utc)
    created_at = _parse_iso(complaint["createdAt"], "createdAt")
    updated_at = _parse_iso(complaint["updatedAt"], "updatedAt")

    if updated_at < created_at:
        raise ValueError("updatedAt cannot be earlier than createdAt")

    # Terminal complaints have no active delay risk.
    if status in TERMINAL_STATUSES:
        return {
            "score": 0,
            "level": "LOW",
            "reasons": ["Complaint is in a terminal state; no active delay risk."],
        }

    age_hours = _hours_between(now, created_at)
    inactivity_hours = _hours_between(now, updated_at)

    historical_hours_raw = context.get("historicalAverageResolutionHours", 0)
    open_count_raw = context.get("authorityOpenComplaints", 0)
    repeated_delays_raw = context.get("repeatedDelays", 0)
    try:
        historical_hours = max(0.0, float(historical_hours_raw or 0))
        open_count = max(0, int(open_count_raw or 0))
        repeated_delays = max(0, int(repeated_delays_raw or 0))
    except (TypeError, ValueError) as exc:
        raise ValueError("Risk context numeric fields must be valid numbers") from exc

    age_score, age_reason = _age_points(age_hours)
    inactivity_score, inactivity_reason = _inactivity_points(inactivity_hours)
    priority_score, priority_reason = _priority_points(priority)
    history_score, history_reason = _history_points(inactivity_hours, historical_hours)
    workload_score, workload_reason = _workload_points(open_count)
    delay_score, delay_reason = _delay_points(repeated_delays)

    score = min(100, max(0, age_score + inactivity_score + priority_score + history_score + workload_score + delay_score))
    reasons = [
        reason
        for reason in (
            age_reason,
            inactivity_reason,
            priority_reason,
            history_reason,
            workload_reason,
            delay_reason,
        )
        if reason
    ]

    if not reasons:
        reasons = ["Complaint is recent and has no strong active-delay risk signals."]

    return {
        "score": score,
        "level": _level_for_score(score),
        "reasons": reasons,
    }


def _normalise_text(value: Any) -> str:
    return " ".join(str(value or "").strip().lower().split())


def _location_text(complaint: Mapping[str, Any]) -> str:
    location = complaint.get("location")
    if isinstance(location, Mapping):
        return _normalise_text(location.get("text") or location.get("locationText"))
    return _normalise_text(location)


def _distance_km(a: Mapping[str, Any], b: Mapping[str, Any]) -> float | None:
    a_lat = a.get("locationLat", a.get("latitude"))
    a_lng = a.get("locationLng", a.get("longitude"))
    b_lat = b.get("locationLat", b.get("latitude"))
    b_lng = b.get("locationLng", b.get("longitude"))
    try:
        lat1, lon1, lat2, lon2 = map(float, (a_lat, a_lng, b_lat, b_lng))
    except (TypeError, ValueError):
        return None
    radius_km = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    h = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * radius_km * asin(sqrt(h))


def findDuplicateCandidate(
    complaint: Mapping[str, Any], existing_complaints: Sequence[Mapping[str, Any]], *, days: int = 7, radius_km: float = 0.05
) -> Mapping[str, Any] | None:
    """Return the first likely duplicate candidate, or None.

    This intentionally uses simple deterministic matching only; it is a helper
    for demo/testing, not a full verification system.
    """
    if not isinstance(complaint, Mapping):
        raise ValueError("complaint must be an object/mapping")
    complaint_time = _parse_iso(complaint.get("createdAt"), "createdAt")
    issue_type = _normalise_text(complaint.get("issueType"))
    title = _normalise_text(complaint.get("title"))
    location_text = _location_text(complaint)

    for candidate in existing_complaints:
        if candidate.get("id") == complaint.get("id"):
            continue
        if _normalise_text(candidate.get("issueType")) != issue_type:
            continue
        title_match = title and title == _normalise_text(candidate.get("title"))
        location_match = location_text and location_text == _location_text(candidate)
        coordinate_distance = _distance_km(complaint, candidate)
        close_coordinates = coordinate_distance is not None and coordinate_distance <= radius_km
        if not (title_match and (location_match or close_coordinates)):
            continue
        candidate_time = _parse_iso(candidate.get("createdAt"), "createdAt")
        if abs((complaint_time - candidate_time).total_seconds()) <= days * 86400:
            return candidate
    return None
