# Talibon Internal Municipal Platform

Kirjane Labs internal municipal operations and HR platform for the Local Government Unit of Talibon, Bohol.

## Active build authority

Read this first:

- `SSOT_BY_KIRCH.md` — controlling product and engineering source of truth
- `AGENTS.md` — mandatory repository operating rules
- `docs/PHASE_1_PLAN.md` — active execution plan
- `docs/ENGINEERING_LOG.md` — mandatory per-commit engineering record

## Active branch

```text
KIRCH-PHASE1-INTERNAL-OPS-HRIS
```

Phase 1 hard target:

```text
2026-08-21 12:00 PHT (UTC+08:00)
```

## Phase 1 focus

Phase 1 is the internal municipal operating platform:

- municipality-wide executive and legislative office routing;
- office workspaces;
- packaged HRIS covering onboarding, active employment, movement, and offboarding;
- employee master/profile and 201-record foundation;
- leave, attendance/DTR, biometric integration boundary, payroll and workforce records;
- restricted employee health / medical vault;
- LGU property and asset accountability;
- calendar and municipal events;
- notification engine, real-time alerts, popups and acknowledgement;
- documents / records;
- executive oversight;
- legislative workspace;
- reports, audit and security.

Public citizen services, `talibon.gov.ph` resident integration, GAD-SDD public rollout, and RHU clinical records are deferred to later phases unless the SSOT is explicitly changed.

## Technology baseline

- Laravel 13
- PHP 8.3+
- Inertia + React 19 + TypeScript
- Tailwind CSS
- PostgreSQL
- modular monolith

PostgreSQL remains authoritative. Realtime delivery is a transport concern and must not become the source of truth.

## Prototype inheritance

The Phase 1 branch inherits the proven M6 prototype baseline, including authentication, synthetic employee identities, inter-office workflow, Mayor queue, memoranda, legislative records, leave prototype, attendance simulation, payroll prototype, operations monitoring, reports and audit evidence.

Prototype behavior is not automatically production-complete. Phase 1 scope and acceptance are controlled by `SSOT_BY_KIRCH.md` and `docs/PHASE_1_PLAN.md`.

## Verification rule

Never claim a build, test suite, CI workflow, hardware integration, payroll engine, or production deployment is verified until actual evidence has been observed and recorded in `docs/ENGINEERING_LOG.md`.
