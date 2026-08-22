# AGENTS.md — TALIBON REPOSITORY OPERATING RULES

## Mandatory first read

Before doing any work in this repository, read:

1. `SSOT_BY_KIRCH.md`
2. `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`
3. `docs/CODE_REVIEW_2026-08-22.md`
4. `docs/PHASE_1_PLAN.md`
5. relevant module docs
6. `docs/ENGINEERING_LOG.md`

`SSOT_BY_KIRCH.md` remains the controlling product and engineering source of truth except for the explicit commercial-phase/nomenclature amendment in `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`, authorized by Kirch Ivan Balite on 2026-08-22 to integrate the client-facing Engineering & Project Architecture Plan with Detailed Quotation.

Do not confuse the historical internal `P1-M0` through `P1-M12` milestones with the client-facing quotation's Contract Phase 1. The internal branch accelerated work from multiple quoted phases.

If another document conflicts with the SSOT or its explicit amendment, stop and follow the SSOT/amendment unless Kirch Ivan Balite explicitly changes the authority.

## Current branch / target

Primary active build branch:

`KIRCH-PHASE1-INTERNAL-OPS-HRIS`

Historical internal Build Wave A target:

`2026-08-21 12:00 PHT (UTC+08:00)`

Current internal label:

`PHASE1_CANDIDATE_OPEN_GATES`

Current commercial architecture label:

`CONTRACT_PHASE_1_OPEN_GATES`

Do not interpret a deadline or accelerated later-phase implementation as permission to bypass authorization, data integrity, migration safety, auditability, quoted Contract Phase 1 commitments, or honest verification.

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

Do not claim green tests, builds, CI, device behavior, integrations, cloud benchmarks, restore drills, UAT, or commercial phase completion unless observed.

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
- Never give a future public/external integration direct database access.

## Source size and complexity standards

Source size is a design signal, not a formatting target.

General production-file thresholds:

- `<=300 LOC`: healthy target
- `301-400 LOC`: review required
- `401-500 LOC`: refactor-required territory
- `>500 LOC`: prohibited by default; requires explicit documented exception or immediate strangler decomposition

Role-specific hard caps:

- Controller: 300 LOC
- Middleware: 200 LOC
- Policy: 300 LOC
- Service: 400 LOC
- Engine: 450 LOC
- React page: 400 LOC

Method/function guidance:

- target `<=20 LOC`
- review when `>35 LOC`
- strong refactor signal when `>50 LOC`

Do not game these limits through traits, arbitrary helper extraction, compressed formatting, multi-statement lines, generated wrappers, or moving the same responsibility into misleadingly named files. Split by real responsibility and preserve clear ownership of invariants.

Existing oversized legacy files are refactor debt, not precedent. Do not add code that increases a file already beyond its applicable hard/default ceiling unless the same change performs a documented strangler reduction.

## Commercial Contract Phase 1 focus

Before Contract Phase 1 may be called complete/pilot-ready, close the core items identified in `SSOT_COMMERCIAL_PHASE_AMENDMENT.md` and `docs/CODE_REVIEW_2026-08-22.md`, especially:

- privileged MFA;
- controlled API Gateway / scoped integration credentials;
- correspondence RECEIVE / REGISTER / CLASSIFY / ROUTE / ACT / RELEASE / ARCHIVE lifecycle;
- classification-aware authorization and protected document handling;
- structured legislative authorship, committee, voting, certification, attestation, mayoral approval and effectivity lifecycle;
- cloud benchmark measurements;
- backup/restore evidence;
- dependency/security review;
- structured UAT / pilot sign-off.

## Accelerated internal scope already present

Preserve and harden the implemented internal work, including:

- all-office routing;
- executive and legislative workspaces;
- packaged HRIS foundations;
- onboarding / movement / offboarding;
- employee profile;
- restricted employee health vault;
- property and asset accountability;
- calendar;
- notifications / popups;
- documents / records metadata;
- reports / audit / security evidence.

Public citizen / `talibon.gov.ph` integration remains later-stage work and must connect only through the controlled integration layer unless Kirch explicitly changes the SSOT/amendment.
