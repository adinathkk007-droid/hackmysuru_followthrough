# Civic Governance & Clean Mysuru — Follow-through Backend

A small Node.js + Express + Supabase backend for HackMysuru 1.0.

## Architecture

React frontend → Express API → Supabase PostgreSQL + Supabase Auth.

Vedanth's original rules-based Python risk engine is integrated at `src/risk_engine/risk_engine.py` and is called by `src/services/riskService.js` through a small JSON stdin/stdout bridge.

## 1. Configure Supabase

Your existing project URL is already in `.env.example`.

Open the Supabase SQL Editor and run:

`supabase/schema.sql`

Do not put the service-role key in the frontend.

## 2. Configure environment

Copy `.env.example` to `.env` and fill in:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- FRONTEND_URL
- PORT

The service-role key is backend-only.

## 3. Install and run

```bash
npm install
npm run dev
```

Health check:

`GET http://localhost:5000/health`

## 4. Seed demo data

After the schema exists and the service-role key is configured:

```bash
npm run seed
```

Demo accounts:

- citizen.demo@civicmysuru.local / CivicDemo123!
- authority.demo@civicmysuru.local / CivicDemo123!

Change/delete these after the hackathon.

## API

- POST `/api/complaints`
- GET `/api/complaints`
- GET `/api/complaints/:id`
- PATCH `/api/complaints/:id/status`
- GET `/api/complaints/:id/history`
- GET `/api/complaints/:id/risk`
- GET `/api/dashboard/summary`

Authenticated create/status requests use:

`Authorization: Bearer <supabase_access_token>`

## Create complaint

```json
{
  "issueType": "GARBAGE",
  "title": "Garbage not collected",
  "description": "Garbage has not been collected for four days.",
  "location": {
    "lat": 12.2958,
    "lng": 76.6394,
    "text": "Vijayanagar, Mysuru"
  },
  "priority": "HIGH"
}
```

## Status update

```json
{
  "status": "IN_PROGRESS",
  "remarks": "Field team has started inspection."
}
```

## Canonical statuses

SUBMITTED → ASSIGNED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED

REJECTED is supported from active stages.

## Frontend response

Complaint responses expose:

`id, citizenId, issueType, title, description, location, priority, status, assignedAuthority, createdAt, updatedAt, resolvedAt, riskScore, riskLevel`

## Important

Supabase REST calls are not automatically one multi-table transaction. The status endpoint uses a compensating update if history insertion fails. For a production system, move the status transition into a PostgreSQL function/RPC transaction.


## Debugging / diagnostics

For local debugging only, you can enable the safe diagnostic routes:

```env
DEBUG_API=true
```

Then run:

```bash
npm run doctor
```

The doctor prints only the Supabase project reference and complaint rows. It never prints the service-role key.

When the server is running, these development-only routes are available:

- `GET /api/debug/supabase`
- `GET /api/debug/complaints/:id`

They help compare an ID supplied to the API against the IDs returned by the same backend Supabase client. Do not enable `DEBUG_API` in production.


## Risk engine integration

`GET /api/complaints/:id/risk` recalculates risk from the live complaint plus backend-derived context and stores the latest result in both `complaints.risk_score/risk_level` and `risk_assessments`.

The calculation itself remains Vedanth's explainable rules engine. The Node service does not duplicate the formula. It launches the bundled Python engine and validates its `{ score, level, reasons }` result. Python 3 is required on the backend host; set `PYTHON_BIN` only if the Python executable is not discoverable as `python` (Windows) or `python3` (Linux/macOS).

The backend derives historical average resolution time, assigned-authority open workload, and explicit status-history remarks containing `delay`. No machine-learning model or accuracy claim is introduced.
