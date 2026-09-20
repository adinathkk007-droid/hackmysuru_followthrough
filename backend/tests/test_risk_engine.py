import unittest

from src.risk_engine.risk_engine import calculateComplaintRisk, findDuplicateCandidate


NOW = "2026-09-19T18:00:00+00:00"


def complaint(**overrides):
    base = {
        "id": "CMP-001",
        "issueType": "POTHOLE",
        "title": "Pothole near Devaraja Market",
        "description": "Road surface damaged near market entrance.",
        "location": "Devaraja Market, Mysuru",
        "priority": "MEDIUM",
        "status": "SUBMITTED",
        "assignedAuthority": "MCC-WARD-12",
        "createdAt": "2026-09-19T14:00:00+00:00",
        "updatedAt": "2026-09-19T17:30:00+00:00",
        "resolvedAt": None,
    }
    base.update(overrides)
    return base


class RiskEngineTests(unittest.TestCase):
    def test_1_recent_complaint_recent_update_is_low_or_medium(self):
        result = calculateComplaintRisk(complaint(), {"now": NOW})
        self.assertIn(result["level"], {"LOW", "MEDIUM"})
        self.assertLess(result["score"], 50)

    def test_2_old_inactive_complaint_is_high_or_critical(self):
        result = calculateComplaintRisk(
            complaint(
                createdAt="2026-09-14T12:00:00+00:00",
                updatedAt="2026-09-15T12:00:00+00:00",
            ),
            {
                "now": NOW,
                "historicalAverageResolutionHours": 24,
                "authorityOpenComplaints": 10,
                "repeatedDelays": 2,
            },
        )
        self.assertIn(result["level"], {"HIGH", "CRITICAL"})
        self.assertGreaterEqual(result["score"], 50)

    def test_3_high_priority_inactive_is_higher_than_low_priority(self):
        context = {
            "now": NOW,
            "historicalAverageResolutionHours": 24,
            "authorityOpenComplaints": 4,
            "repeatedDelays": 0,
        }
        low = calculateComplaintRisk(
            complaint(priority="LOW", createdAt="2026-09-17T06:00:00+00:00", updatedAt="2026-09-18T06:00:00+00:00"),
            context,
        )
        high = calculateComplaintRisk(
            complaint(priority="HIGH", createdAt="2026-09-17T06:00:00+00:00", updatedAt="2026-09-18T06:00:00+00:00"),
            context,
        )
        self.assertGreater(high["score"], low["score"])

    def test_4_resolved_complaint_has_no_active_delay_risk(self):
        result = calculateComplaintRisk(
            complaint(
                status="RESOLVED",
                createdAt="2026-08-01T12:00:00+00:00",
                updatedAt="2026-08-10T12:00:00+00:00",
                resolvedAt="2026-08-10T12:00:00+00:00",
                priority="CRITICAL",
            ),
            {"now": NOW, "authorityOpenComplaints": 99, "repeatedDelays": 9},
        )
        self.assertEqual(result, {
            "score": 0,
            "level": "LOW",
            "reasons": ["Complaint is in a terminal state; no active delay risk."],
        })

    def test_5_missing_required_data_fails_validation(self):
        incomplete = complaint()
        del incomplete["updatedAt"]
        with self.assertRaises(ValueError):
            calculateComplaintRisk(incomplete, {"now": NOW})

    def test_6_duplicate_candidate_is_flagged(self):
        original = complaint(id="CMP-010", createdAt="2026-09-18T09:00:00+00:00")
        possible_duplicate = complaint(id="CMP-011", createdAt="2026-09-19T09:00:00+00:00")
        candidate = findDuplicateCandidate(possible_duplicate, [original])
        self.assertIsNotNone(candidate)
        self.assertEqual(candidate["id"], "CMP-010")

    def test_recently_updated_is_lower_than_equally_old_inactive(self):
        context = {"now": NOW, "historicalAverageResolutionHours": 24, "authorityOpenComplaints": 5}
        inactive = calculateComplaintRisk(
            complaint(
                createdAt="2026-09-14T18:00:00+00:00",
                updatedAt="2026-09-15T18:00:00+00:00",
            ), context
        )
        updated = calculateComplaintRisk(
            complaint(
                createdAt="2026-09-14T18:00:00+00:00",
                updatedAt="2026-09-19T17:30:00+00:00",
            ), context
        )
        self.assertLess(updated["score"], inactive["score"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
