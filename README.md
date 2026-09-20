# Civic Follow-through — Clean Mysuru

**HackMysuru 1.0 — Phase 1**

**Team:** Aurora  
**Team ID:** HM26-094A  
**College:** VTU Mysore

---

## 1. Problem Understanding

### Chosen sub-problem: Follow-through

Civic complaints do not always end when they are submitted. A complaint may remain open, receive no meaningful action, or become forgotten without the citizen knowing what happened.

Our project addresses the follow-through problem:

> Track a complaint after it is filed, show how long it has been open, whether action has been taken, and identify complaints that may be at risk of being forgotten.

The challenge also asks whether a system can identify complaints that are likely to be forgotten before they are actually overlooked.

---

## 2. Target Users & Context

| User | What they need |
|---|---|
| Citizens | Submit complaints and track their progress |
| Authorities | View complaints, update progress and identify complaints requiring attention |
| Civic administrators | Monitor complaints and follow-through risk |

The system is designed around the idea that submitting a complaint should not be the end of the process. The citizen should be able to see what happens afterward.

---

## 3. Solution Overview

Civic Follow-through provides separate citizen and authority interfaces for managing the complete complaint journey.

### Citizen

- Submit civic complaints
- Provide complaint details and location
- View submitted complaints
- Track complaint progress
- See the current complaint status

### Authority

- View complaints
- View complaint details
- Update complaint status
- Monitor follow-through risk
- See human-readable reasons for the risk
- Move complaints through their lifecycle

### Core Flow

```text
Citizen submits complaint
        ↓
Complaint enters the system
        ↓
Authority receives and acts
        ↓
Progress is recorded
        ↓
Follow-through risk is assessed
        ↓
Complaint is resolved or rejected
        ↓
Citizen can see the outcome
4. Architecture

The project is maintained in one integrated repository.

React / Vite Frontend
        ↓
Express / Node.js Backend
        ↓
Supabase PostgreSQL
        ↓
Risk Service
        ↓
Python Rules-based Risk Engine
Frontend

The frontend provides the citizen and authority interfaces.

Technology:

React
Vite
Backend

The backend owns:

Complaint API
Validation
Persistence
Status transitions
Complaint history
Dashboard data
Risk-engine integration

Technology:

Node.js
Express
Zod
Database

The backend uses Supabase PostgreSQL for structured storage of:

Users
Complaints
Status history
Risk assessments

Database schema:

backend/supabase/schema.sql

Risk Engine

The risk engine is implemented in Python and is connected to the backend through the risk-engine bridge.

Relevant files:

backend/src/services/riskService.js
backend/src/services/riskEngineBridge.js
backend/src/risk_engine/risk_engine.py
backend/src/risk_engine/runner.py
5. Follow-through Risk

The system includes an explainable follow-through risk mechanism.

The risk engine considers factors including:

Complaint age
Inactivity
Priority
Historical resolution information
Authority workload
Repeated delays

It produces:

A score from 0–100
A risk level
Human-readable reasons

The Phase 1 implementation uses a deterministic, rules-based Python risk engine rather than claiming trained machine-learning accuracy without sufficient real-world training data.

This makes the result transparent and explainable to the authority using the system.

6. Complaint Lifecycle

Complaints follow a defined lifecycle:

SUBMITTED
    ↓
ASSIGNED
    ↓
ACKNOWLEDGED
    ↓
IN_PROGRESS
    ↓
RESOLVED / REJECTED

Status transitions are recorded with timestamps and remarks.

This allows the system to represent not only the current state of a complaint, but also its progression over time.

7. Repository Structure
hackmysuru_followthrough/
│
├── frontend/
│   └── React/Vite citizen and authority interface
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── risk_engine/
│   │   └── ...
│   ├── supabase/
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── tests/
│
├── submission/
│   ├── decision-log.pdf
│   └── presentation.pdf
│
├── README.md
├── ai.md
└── resource.md
8. Tech Stack & AI Usage
Tech Stack
Layer	Technology
Frontend	React, Vite
Backend	Node.js, Express
Database	Supabase PostgreSQL
Validation	Zod
Risk Engine	Python
Security / Middleware	Helmet, CORS
Configuration	dotenv
AI Usage

AI tools were used during development for:

Architecture discussion
Implementation assistance
Debugging
Code troubleshooting
Documentation
Development guidance

The product does not use an LLM or trained ML model at runtime.

The follow-through risk mechanism is a transparent, rules-based Python implementation.

Complete disclosure:

ai.md

9. Live MVP

Live MVP:

https://hackmysuru-followthrough.vercel.app

The public Phase 1 MVP demonstrates the citizen and authority workflows using controlled demonstration data.

Demonstration Flow
Open the Live MVP.
Log in as a citizen.
View the citizen dashboard.
Open an existing complaint.
View complaint details and progress.
Submit a new complaint if required.
Log in as an authority.
View the authority dashboard.
Open a complaint.
View the follow-through risk score and reasons.
Update the complaint status.
Move the complaint through its lifecycle.
Resolve the complaint.
Return to the citizen view and observe the updated progress.
10. Technical Decisions
Relational Database

We chose Supabase PostgreSQL because the system contains structured relationships between users, complaints, status history and risk assessments.

Backend API

We use an Express backend so that validation, persistence, complaint lifecycle management and database access remain under server-side control.

Explainable Risk Engine

We chose a deterministic Python rules-based risk engine instead of a black-box ML model because Phase 1 does not provide sufficient real-world training data to justify a trained predictive model.

Complaint History

We record status transitions rather than storing only the current status. This provides an auditable complaint timeline and gives the risk engine historical information.

More details are available in:

submission/decision-log.pdf

11. Testing and Validation

The Phase 1 implementation was tested through the working MVP and development environment.

The main workflows tested include:

Citizen login
Authority login
Complaint creation
Complaint viewing
Complaint status updates
Complaint lifecycle
Risk display
Risk explanations
Citizen progress visibility

The repository also contains backend tests and seed/demo data.

12. Known Limitations
The public Phase 1 MVP uses controlled demonstration data.
The public frontend is not presented as a production deployment of the backend infrastructure.
The Phase 1 risk engine is rules-based rather than trained machine learning.
Real-world deployment would require integration with live civic complaint data and authority systems.
Real deployment would require production authentication, authorization and operational infrastructure.
Risk rules can be refined using validated real-world complaint history in future versions.
13. Team
Member	Program	Year	Role
Adinath	ECE	2nd Year	System Architecture, Integration, QA, Documentation and Delivery
Jai Ganesh	ECE	2nd Year	Frontend Development
Aakash	ECE	2nd Year	Backend, API and Database
Vedanth	Mechanical	2nd Year	Risk Engine, Testing and Seed/Demo Data

All team members are students of VTU Mysore.

14. Submission Resources
GitHub Repository

https://github.com/adinathkk007-droid/hackmysuru_followthrough

Live MVP

https://hackmysuru-followthrough.vercel.app

Presentation

Repository: submission/presentation.pdf

Google Drive:

https://drive.google.com/file/d/1-E1Axz7Vona_APGKiin6ZalnlkGsjdZM/view?usp=drivesdk

Decision Log

Repository: submission/decision-log.pdf

Google Drive:

https://drive.google.com/file/d/1Tz_NEUdfVnNCRml4R73cfR_PBjwYIxcM/view?usp=drivesdk

Video Walkthrough

Google Drive:

[https://drive.google.com/file/d/11nYF-rjGJafFHSGxsSGV5YTPubC89qk-/view?usp=drivesdk]

15. Project Goal

The goal of Civic Follow-through is simple:

A civic complaint should not disappear after it is reported. It should have visible follow-through.