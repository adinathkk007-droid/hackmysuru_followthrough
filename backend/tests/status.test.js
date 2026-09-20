import test from "node:test";
import assert from "node:assert/strict";
import { isValidStatus, isValidTransition } from "../src/utils/status.js";

test("canonical statuses are enforced", () => {
  assert.equal(isValidStatus("SUBMITTED"), true);
  assert.equal(isValidStatus("OPEN"), false);
});

test("normal transition is accepted", () => {
  assert.equal(isValidTransition("SUBMITTED", "ASSIGNED"), true);
  assert.equal(isValidTransition("IN_PROGRESS", "RESOLVED"), true);
});

test("invalid transition is rejected", () => {
  assert.equal(isValidTransition("SUBMITTED", "RESOLVED"), false);
  assert.equal(isValidTransition("RESOLVED", "IN_PROGRESS"), false);
});
