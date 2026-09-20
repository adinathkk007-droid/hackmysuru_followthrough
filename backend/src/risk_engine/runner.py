"""CLI bridge used by the Node backend to call Vedanth's unchanged Python risk engine."""
from __future__ import annotations

import json
import sys

from risk_engine import calculateComplaintRisk


def main() -> int:
    try:
        payload = json.load(sys.stdin)
        complaint = payload.get("complaint")
        context = payload.get("context") or {}
        result = calculateComplaintRisk(complaint, context)
        json.dump(result, sys.stdout, separators=(",", ":"))
        sys.stdout.write("\n")
        return 0
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stdout, separators=(",", ":"))
        sys.stdout.write("\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
