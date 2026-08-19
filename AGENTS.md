# AGENTS.md — TALIBON REPOSITORY OPERATING RULES

## Mandatory first read

Before doing any work in this repository, read:

1. `SSOT_BY_KIRCH.md`
2. `docs/PHASE_1_PLAN.md`
3. relevant module docs
4. `docs/ENGINEERING_LOG.md`

`SSOT_BY_KIRCH.md` is the controlling product and engineering source of truth.

If another document conflicts with it, stop and follow the SSOT unless Kirch Ivan Balite explicitly changes the authority.

## Current branch / target

Primary active build branch:

`KIRCH-PHASE1-INTERNAL-OPS-HRIS`

Phase 1 hard target:

`2026-08-21 12:00 PHT (UTC+08:00)`

Do not interpret the deadline as permission to bypass authorization, data integrity, migration safety, auditability, or honest verification.

## Every commit must be documented

Effective immediately, every commit MUST update `docs/ENGINEERING_LOG.md` in the same commit.

Each log entry must include:

- timestamp / date
- commit message or intent
- requirement / milestone
- files or modules changed
- schema / migration impact
- tests / verification actually run
- known gaps / risks
- next action when applicable

Do not claim green tests, builds, CI, device behavior, or integrations unless observed.

## Implementation discipline

- Inspect before replacing.
- Reuse shared services instead of duplicating logic per module.
- Keep PostgreSQL authoritative.
- Keep business transitions auditable.
- Use transactions / locking where invariants require them.
- Enforce permissions server-side.
- Treat office, assignment, workflow state, delegation, and classification as authorization inputs where relevant.
- Keep presentation/test/production data boundaries explicit.
- Never commit secrets or database passwords.
- Never point destructive automated tests at the presentation or production database.
- Do not represent synthetic payroll formulas as government payroll rules.
- Do not represent simulated biometric data as live hardware integration.
- Do not put RHU patient clinical records into HRIS.

## Phase 1 focus

Build the internal municipal platform first:

- all office routing
- executive and legislative workspaces
- packaged HRIS
- onboarding / movement / offboarding
- employee profile
- restricted employee health vault
- property and asset accountability
- calendar
- notifications / popups
- documents / records
- reports / audit / security

Public citizen / talibon.gov.ph integration is later phase work unless Kirch explicitly changes the SSOT.
