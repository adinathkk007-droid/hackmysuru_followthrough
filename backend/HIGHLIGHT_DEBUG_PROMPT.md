# Debug prompt — Civic Follow-through Backend

You are debugging a HackMysuru 1.0 backend for **Civic Governance & Clean Mysuru — Follow-through**.

## Goal
Find the root cause of any backend/database integration bug and return a corrected, runnable project. Do not merely describe possible causes.

## Stack
- Node.js
- Express 5
- Supabase PostgreSQL + Supabase Auth
- @supabase/supabase-js
- Zod validation
- Backend runs on port 5000 by default

## Supabase project
The code is intended to connect to the Supabase project whose URL is in `.env.example`.
NEVER request, expose, print, or commit the real `SUPABASE_SERVICE_ROLE_KEY` or any other secret.

## Current known bug
`GET /api/complaints` successfully returns the seeded complaint rows from Supabase, but `GET /api/complaints/:id` has been returning `404 Complaint not found` for an ID that appeared in the list response.

A direct SQL check was also attempted for the copied UUID and unexpectedly returned no rows even though the dashboard/table listing showed a complaint with what appeared to be the same UUID. This strongly suggests an ID-copy/normalization issue, environment/project mismatch, or a query/client inconsistency. Verify the evidence instead of assuming the cause.

## What you must inspect
1. `src/config.js` — verify environment loading and Supabase URL/key usage.
2. `src/supabase.js` — verify exactly one intended Supabase admin client is used.
3. `src/server.js` — verify route mounting and middleware.
4. `src/routes/complaints.js` — inspect every complaint lookup, route order, UUID handling, and Supabase query behavior.
5. `src/routes/debug.js` and `scripts/doctor.js` — use them to verify which Supabase project the backend is actually querying and compare exact IDs against recent rows.
6. `supabase/schema.sql` — verify the database schema matches the code.
7. `src/seed.js` — verify seeded data is inserted into the same project/table used by the API.
8. Tests and package scripts.

## Required API contract
Canonical statuses:
SUBMITTED → ASSIGNED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED
REJECTED is supported.

Required endpoints:
- POST /api/complaints
- GET /api/complaints
- GET /api/complaints/:id
- PATCH /api/complaints/:id/status
- GET /api/complaints/:id/history
- GET /api/complaints/:id/risk
- GET /api/dashboard/summary

Frontend complaint response must contain:
`id, citizenId, issueType, title, description, location, priority, status, assignedAuthority, createdAt, updatedAt, resolvedAt, riskScore, riskLevel`

## Constraints
- Do not invent a competing risk engine. Vedanth owns the risk formula; preserve the adapter contract in `src/services/riskService.js`.
- Do not remove Supabase Auth.
- Do not move the service-role key to frontend code.
- Keep RLS enabled.
- Do not hardcode credentials.
- Keep the project simple enough for a hackathon.
- Prefer a small deterministic fix over a large rewrite.
- If a transaction is required for multi-table status changes, use a PostgreSQL RPC/function rather than pretending two REST calls are atomic.

## Debugging requirements
- Run the tests.
- Run `npm run doctor` if environment variables are available.
- Verify `GET /health`.
- Verify `GET /api/complaints`.
- Verify lookup of an ID returned by the list endpoint.
- Verify history and risk endpoints for the same ID.
- Verify a valid status transition and an invalid transition.
- Verify malformed UUIDs return a clear 404/400 response rather than an opaque Supabase error.
- Verify no secrets are present in the output or committed files.

## Deliverable
Return the corrected complete project files, not a partial patch. Include:
1. Exact root cause.
2. Why the old code failed.
3. Corrected files.
4. Commands to install and run.
5. Exact API test commands.
6. Any Supabase SQL that must be run.
7. A short note listing anything that could not be verified because external credentials/data were unavailable.

Do not claim the system is fixed unless you actually reproduced the relevant behavior or have enough evidence from the code and tests to establish the fix.
