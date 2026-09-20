export const STATUSES = [
  "SUBMITTED",
  "ASSIGNED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED"
];

const transitions = {
  SUBMITTED: new Set(["ASSIGNED", "REJECTED"]),
  ASSIGNED: new Set(["ACKNOWLEDGED", "REJECTED"]),
  ACKNOWLEDGED: new Set(["IN_PROGRESS", "REJECTED"]),
  IN_PROGRESS: new Set(["RESOLVED", "REJECTED"]),
  RESOLVED: new Set(),
  REJECTED: new Set()
};

export function isValidStatus(status) {
  return STATUSES.includes(status);
}

export function isValidTransition(from, to) {
  return transitions[from]?.has(to) ?? false;
}
