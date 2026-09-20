import test from "node:test";
import assert from "node:assert/strict";
import { calculateWithVedanthEngine } from "../src/services/riskEngineBridge.js";

test("Node backend risk bridge calls Vedanth's original engine", async () => {
  const result = await calculateWithVedanthEngine(
    {
      id: "CMP-BRIDGE-001",
      status: "IN_PROGRESS",
      priority: "HIGH",
      createdAt: "2026-09-14T12:00:00+00:00",
      updatedAt: "2026-09-15T12:00:00+00:00"
    },
    {
      now: "2026-09-19T18:00:00+00:00",
      historicalAverageResolutionHours: 24,
      authorityOpenComplaints: 10,
      repeatedDelays: 2
    }
  );

  assert.equal(result.score, 89);
  assert.equal(result.level, "CRITICAL");
  assert.equal(result.reasons.length, 6);
});
