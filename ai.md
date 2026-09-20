# AI Usage Disclosure

## Summary

| Question | Answer |
|---|---|
| Did we use AI during development? | Yes |
| Does our product use AI/ML at runtime? | No |
| How was AI used? | Development assistance, debugging, architecture discussion, documentation and implementation support |
| Can the team explain the AI-assisted implementation? | Yes |

## 1. AI Tools Used During Development

| Tool | Used for |
|---|---|
| ChatGPT | Architecture discussion, implementation assistance, debugging, code review, documentation and troubleshooting |

AI assistance was used as a development aid. Final implementation decisions and integration were reviewed by the team.

## 2. Where AI Helped in the Codebase

| Area | AI Assistance | Human Responsibility |
|---|---|---|
| Frontend | UI implementation and debugging assistance | Reviewed and integrated by the frontend team |
| Backend | API and service implementation assistance | Reviewed and tested by the backend team |
| Risk Engine | Logic discussion and implementation assistance | Risk rules were reviewed and finalized by the team |
| Documentation | README, resource documentation and decision-log assistance | Final content reviewed by the team |

AI-generated suggestions were not treated as automatically correct. The team reviewed, modified and tested the resulting implementation.

## 3. AI Inside the Product

No LLM or trained machine-learning model is used at runtime in the Phase 1 public MVP.

The follow-through risk engine is a transparent, deterministic, rules-based Python implementation.

It considers factors such as:

- Complaint age
- Inactivity
- Priority
- Historical resolution information
- Authority workload
- Repeated delays

The engine produces a 0–100 risk score, a risk level, and human-readable reasons.

Therefore, the product does not claim trained ML prediction accuracy.

## 4. Key AI-Assisted Development Areas

AI assistance was used for:

1. Discussing the overall system architecture.
2. Designing and debugging frontend workflows.
3. Developing and troubleshooting backend API functionality.
4. Discussing the explainable risk-engine implementation.
5. Debugging integration issues.
6. Preparing project documentation and submission materials.

The team retained responsibility for the final architecture, implementation decisions, testing and integration.

## 5. Verification of AI-Assisted Work

AI-assisted code and suggestions were reviewed by the team before being incorporated.

The implementation was checked against the project requirements and tested through the working MVP and development environment.

The team also reviewed the complaint lifecycle, risk logic and frontend workflows to ensure that the implementation matched the intended system behaviour.

## 6. What We Deliberately Did Not Use AI For

The final product does not use an LLM or trained ML model to make runtime decisions.

The follow-through risk mechanism was deliberately implemented as a rules-based system so that its output is deterministic, explainable and suitable for the limited real-world dataset available during Phase 1.

## Declaration

We confirm that this disclosure accurately describes the use of AI during development and that the team can explain the implementation and decisions represented in the project.

**Team:** Aurora  
**Team ID:** HM26-094A  
**Date:** 20 September 2026