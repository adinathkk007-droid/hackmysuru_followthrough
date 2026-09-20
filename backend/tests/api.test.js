import test, { describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "../src/server.js";
import { supabaseAdmin } from "../src/supabase.js";
import { config } from "../src/config.js";

describe("Civic Follow-through API Integration Tests", () => {
  let server;
  let baseUrl;
  let dynamicComplaintId;
  let sampleComplaint;

  before(async () => {
    // Start test server on dynamic port
    server = await new Promise((resolve) => {
      const s = startServer(0);
      s.on("listening", () => resolve(s));
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test("1. Database connection verification", async () => {
    const { data, error } = await supabaseAdmin
      .from("complaints")
      .select("id")
      .limit(1);

    assert.equal(error, null, `Supabase connection error: ${error?.message}`);
    assert.ok(Array.isArray(data), "Complaints data should be an array");
  });

  test("2. GET /health endpoint returns service metadata", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "civic-follow-through-backend");
    assert.ok(body.timestamp, "Timestamp should be present");
  });

  test("3. GET /api/complaints returns list of complaints", async () => {
    const res = await fetch(`${baseUrl}/api/complaints`);
    assert.equal(res.status, 200);

    const complaints = await res.json();
    assert.ok(Array.isArray(complaints), "Response should be an array");
    assert.ok(complaints.length > 0, "Complaints list should contain records");

    sampleComplaint = complaints[0];
    dynamicComplaintId = sampleComplaint.id;

    assert.ok(dynamicComplaintId, "Complaint ID must not be empty");
    assert.ok(sampleComplaint.title, "Title must be present");
    assert.ok(sampleComplaint.status, "Status must be present");
    assert.ok(sampleComplaint.location, "Location object must be present");
  });

  test("4. CRITICAL TEST: GET /api/complaints/:id using dynamic ID from list endpoint", async () => {
    assert.ok(dynamicComplaintId, "Dynamic ID from list endpoint must be available");

    const detailUrl = `${baseUrl}/api/complaints/${dynamicComplaintId}`;
    const res = await fetch(detailUrl);

    if (res.status !== 200) {
      const errorBody = await res.json().catch(() => null);
      console.error("CRITICAL TEST FAILURE DIAGNOSTICS:");
      console.error("LIST ID:", sampleComplaint.id);
      console.error("DETAIL ID:", dynamicComplaintId);
      console.error("NORMALIZED DETAIL ID:", dynamicComplaintId.trim().toLowerCase());
      console.error("SUPABASE PROJECT REF:", config.supabaseUrl);
      console.error("DETAIL QUERY RESULT STATUS:", res.status);
      console.error("DETAIL QUERY RESULT BODY:", errorBody);
    }

    assert.equal(
      res.status,
      200,
      `Detail endpoint failed for ID: ${dynamicComplaintId} with status ${res.status}`
    );

    const complaint = await res.json();
    assert.equal(complaint.id, dynamicComplaintId);
    assert.equal(complaint.title, sampleComplaint.title);
    assert.equal(complaint.status, sampleComplaint.status);
    assert.equal(complaint.issueType, sampleComplaint.issueType);
  });

  test("5. GET /api/complaints/:id normalizes quotes and case", async () => {
    // Upper case UUID
    const upperUrl = `${baseUrl}/api/complaints/${dynamicComplaintId.toUpperCase()}`;
    const upperRes = await fetch(upperUrl);
    assert.equal(upperRes.status, 200);
    const upperBody = await upperRes.json();
    assert.equal(upperBody.id, dynamicComplaintId);

    // Quoted UUID: "%22<id>%22"
    const quotedUrl = `${baseUrl}/api/complaints/%22${dynamicComplaintId}%22`;
    const quotedRes = await fetch(quotedUrl);
    assert.equal(quotedRes.status, 200);
    const quotedBody = await quotedRes.json();
    assert.equal(quotedBody.id, dynamicComplaintId);
  });

  test("6. GET /api/complaints/:id with invalid UUID returns 400 Bad Request", async () => {
    const invalidIds = ["not-a-valid-uuid", "12345", "invalid-uuid-format"];
    for (const invalidId of invalidIds) {
      const res = await fetch(`${baseUrl}/api/complaints/${invalidId}`);
      assert.equal(
        res.status,
        400,
        `Expected 400 for invalid ID '${invalidId}' but received ${res.status}`
      );

      const body = await res.json();
      assert.equal(body.error, "Invalid complaint ID");
      assert.ok(body.message.includes("UUID"));
    }
  });

  test("7. GET /api/complaints/:id with nonexistent valid UUID returns 404 Not Found", async () => {
    const nonexistentId = "00000000-0000-0000-0000-000000000000";
    const res = await fetch(`${baseUrl}/api/complaints/${nonexistentId}`);
    assert.equal(
      res.status,
      404,
      `Expected 404 for nonexistent ID '${nonexistentId}' but received ${res.status}`
    );

    const body = await res.json();
    assert.equal(body.error, "Complaint not found");
    assert.ok(body.message.includes(nonexistentId));
  });

  test("8. GET /api/complaints/:id/history returns status history", async () => {
    const res = await fetch(`${baseUrl}/api/complaints/${dynamicComplaintId}/history`);
    assert.equal(res.status, 200);

    const history = await res.json();
    assert.ok(Array.isArray(history), "History should be an array");
  });

  test("9. GET /api/complaints/:id/history with invalid UUID returns 400", async () => {
    const res = await fetch(`${baseUrl}/api/complaints/not-a-uuid/history`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, "Invalid complaint ID");
  });

  test("10. GET /api/complaints/:id/risk returns risk assessment", async () => {
    const res = await fetch(`${baseUrl}/api/complaints/${dynamicComplaintId}/risk`);
    assert.equal(res.status, 200);

    const risk = await res.json();
    assert.ok(typeof risk === "object" && risk !== null);
    assert.ok("score" in risk, "score property should be present");
    assert.ok("level" in risk, "level property should be present");
    assert.ok(Array.isArray(risk.reasons), "reasons property should be an array");
  });

  test("11. GET /api/complaints/:id/risk with invalid UUID returns 400", async () => {
    const res = await fetch(`${baseUrl}/api/complaints/not-a-uuid/risk`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, "Invalid complaint ID");
  });

  test("12. PATCH /api/complaints/:id/status requires authentication (401)", async () => {
    const res = await fetch(`${baseUrl}/api/complaints/${dynamicComplaintId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "IN_PROGRESS" })
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, "Unauthorized");
  });

  test("13. PATCH /api/complaints/:id/status rejects invalid transition (409)", async () => {
    // Sign in as authority demo user
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: "authority.demo@civicmysuru.local",
      password: "CivicDemo123!"
    });

    if (authError || !authData?.session?.access_token) {
      console.warn("Skipping auth status transition test: authority sign-in failed", authError?.message);
      return;
    }

    const token = authData.session.access_token;

    // Find a complaint with SUBMITTED status
    const listRes = await fetch(`${baseUrl}/api/complaints?status=SUBMITTED`);
    const list = await listRes.json();
    if (list.length > 0) {
      const targetId = list[0].id;
      // SUBMITTED -> RESOLVED is invalid (must go SUBMITTED -> ASSIGNED)
      const res = await fetch(`${baseUrl}/api/complaints/${targetId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "RESOLVED", remarks: "Invalid skip" })
      });
      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.error, "Invalid status transition");
    }
  });

  test("14. GET /api/dashboard/summary returns aggregated counts", async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary`);
    assert.equal(res.status, 200);

    const summary = await res.json();
    assert.ok(typeof summary.total === "number", "total should be a number");
    assert.ok(typeof summary.byStatus === "object", "byStatus should be an object");
    assert.ok(typeof summary.byPriority === "object", "byPriority should be an object");
    assert.ok(typeof summary.highRisk === "number", "highRisk should be a number");
  });
});
