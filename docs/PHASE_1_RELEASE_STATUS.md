# Phase 1 Release Status

Authority: `SSOT_BY_KIRCH.md`

Current label: `PHASE1_CANDIDATE_OPEN_GATES`

## Implementation state

The active Phase 1 branch contains the planned internal municipal platform through:

- M1 organization and universal routing;
- M2 notifications, calendar, and shared document foundation;
- M3 employee profile / 201 foundation;
- M4 onboarding, movement, and basic property accountability;
- M5 leave, attendance/DTR, and payroll context;
- M6 performance, development, credential monitoring, and restricted employee health vault;
- M7 separation, offboarding, and clearance;
- M8 full LGU property lifecycle;
- M9 executive and legislative workspaces;
- M10 reporting, audit, and authorization evidence;
- M11 integrated acceptance coverage and release checklist.

## M12 freeze rule

No additional Phase 1 feature scope should be accepted before the local integrated gates are completed. From this point, changes should be limited to:

1. observed build/type/test failures;
2. security or data-integrity defects;
3. acceptance blockers against `docs/PHASE_1_ACCEPTANCE_CHECKLIST.md`;
4. documentation required for benchmark handoff.

## Required local evidence before release-green

Run:

```powershell
.\scripts\phase1-verify.ps1
```

The script performs additive migrations, TypeScript checking, production Vite build, and the complete Feature suite. It intentionally contains no destructive database reset.

Record:

- exact tested commit SHA;
- migration result;
- TypeScript result;
- Vite production-build result and duration;
- Feature-test count, assertion count, failures, and duration;
- manual desktop/mobile/LAN observations;
- known limitations accepted for benchmark deployment.

## Release decision

Do not label the branch `PHASE1_RELEASE_GREEN` until the above evidence is recorded in `docs/ENGINEERING_LOG.md`.

If any gate fails, remain on `PHASE1_CANDIDATE_OPEN_GATES`, fix only the observed blocker, rerun the affected gate, and then rerun the complete verification script before final handoff.
