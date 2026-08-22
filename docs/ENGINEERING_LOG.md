# Engineering Log

Authority: `SSOT_BY_KIRCH.md`

This log is mandatory for the active Talibon build. It was consolidated on 2026-08-22 after the rapid Phase 1 implementation sequence so agents can see the current engineering state without reconstructing it from chat history. The pre-consolidation detailed log remains preserved in Git history.

## Required commit record

Every implementation commit must identify:

- milestone / requirement;
- intent;
- important files or modules;
- schema / migration impact;
- verification actually observed;
- known gaps / risks;
- next action.

A sprint may be implementation-complete while verification remains open. Never convert an unobserved gate into a PASS claim.

---

## Governance and Phase 1 foundation

### `docs: establish Kirch SSOT and mandatory engineering log`
- Milestone: project governance baseline.
- Intent: establish `SSOT_BY_KIRCH.md`, agent read order, internal Phase 1 scope, and mandatory documentation.
- Runtime impact: none.

### `docs: lock Phase 1 execution plan and acceptance gates`
- Milestone: Phase 1 execution baseline.
- Intent: define M0-M12 sequencing, acceptance gates, release labels, and the prohibition against destructive refreshes on the presentation database.
- Runtime impact: none.

### `feat: establish Phase 1 organization routing foundation`
### `feat: enforce branch-aware universal office routing`
- Milestone: P1-M0 / P1-M1.
- Intent: preserve `departments` as the compatibility anchor while adding branch, office type, hierarchy, routability, ordering, and universal routing enforcement.
- Schema: additive organization metadata.
- Acceptance contract: 33 routable nodes, split as 30 executive/administrative + 3 legislative.

### `feat: add persistent notifications calendar and shared document foundation`
- Milestone: P1-M2.
- Intent: persistent notification truth, shared municipal calendar, workflow deadline publication, and reusable document metadata/link records.
- Schema: `platform_notifications`, `calendar_events`, `documents`, `document_links`.

### `feat: establish permission-aware employee profile and 201 foundation`
- Milestone: P1-M3.
- Intent: employee master/profile expansion, encrypted private HR fields, permission-aware employee projections, and 201-document metadata without implicit health access.
- Schema: additive employee employment/private profile fields.

---

## HR lifecycle and property foundation

### `feat: add onboarding movement and property domain foundations`
### `feat: expose lifecycle and property accountability workspaces`
### `fix: align onboarding task UI type contract`
### `fix: align frontend calls with Inertia v3 contracts`
- Milestone: P1-M4.
- Intent: blocker-driven onboarding, employment movement, basic asset accountability, HTTP authorization, lifecycle/property workspaces, and Inertia v3 compatibility.
- Verification observed after fixes: production build PASS; Feature suite PASS at **24 tests / 173 assertions**.

### `feat: integrate DTR leave and payroll context`
- Milestone: P1-M5.
- Intent: evidence-derived DTR, approved-leave calendar/notification integration, and locked DTR context linked to payroll without silently recalculating monetary values.
- Schema: DTR periods/summaries and payroll context links.
- Verification observed: production build PASS in **1.95s**; Feature suite PASS at **28 tests / 191 assertions** in **359.37s**.

### `feat: add performance development and explicit health-vault authorization`
- Milestone: P1-M6.
- Intent: performance/development records, credential/contract expiry monitoring, and explicit purpose-bound employee health-vault access.
- Security rule: ordinary HR and system administration do not automatically receive health-content access.
- Verification observed: production build PASS in **2.68s**; Feature suite PASS at **33 tests / 231 assertions** in **454.19s**.

### `feat: add blocker-driven employee offboarding and clearance`
- Milestone: P1-M7.
- Intent: separation/offboarding as cross-office clearance rather than a status toggle; live blockers include open work, accountable property, financial/payroll/leave/document/biometric clearance, and access revocation.
- Schema: offboarding cases/tasks plus employee separation date.
- Verification: implementation and syntax-level review performed; full post-M7 integrated local gate intentionally deferred to final sprint verification.

### `feat: implement full property lifecycle controls`
- Milestone: P1-M8.
- Intent: maintenance, physical inventory, discrepancy evidence, Accounting reconciliation, and controlled disposal while preserving append-only asset history.
- Schema: maintenance, inventory sessions/scans, reconciliation, disposal.
- Verification: implementation/test coverage added; full post-M8 integrated local gate intentionally deferred.

---

## 2026-08-22 bug-bounty hardening before M9

### `124b0070` — backend inventory-reference enforcement
- Finding: the property UI described QR/reference verification but the server did not require proof that the submitted scan/reference matched the selected asset.
- Fix: require the exact stored reference at the HTTP/domain boundary, compare it server-side, reject mismatches, and reject disposed assets from active inventory scans.
- Risk closed: selecting an asset record can no longer masquerade as physical-reference verification.

### `4f32f0c0` — explicit property scan/reference UI
- Intent: require the operator to submit the observed QR/property reference instead of silently trusting the selected asset ID.

### `acd46810` — property reference integrity regression coverage
- Intent: cover the mismatch/invalid-reference path so the integrity fix cannot regress silently.

The isolated execution VM still had outbound DNS restrictions and could not construct a dependency-complete GitHub/Composer environment, so no full Laravel/Vite PASS was claimed from that VM.

---

## P1-M9 — Executive and Legislative completion

### M9 scaffold chain
- `b2b33f30`, `e011420a`, `402cecf8`, `667d5826`, `76f9be05`, `dfcff542`, `d09f2352`
- Intent: introduce legislative session/agenda foundations and expand the Mayor backend from a local approval queue into municipality-wide accountability data.

### `59eaf83d63a3d3df72b9cb442855647fd38713bc` — `feat: complete M9 executive and legislative workspaces`
- Milestone: P1-M9.
- Intent:
  - wire the legislative workspace routes;
  - add session scheduling and agenda controls;
  - publish legislative sessions to the shared municipal calendar;
  - surface routed work currently held by legislative offices;
  - expand the Mayor UI to municipality-wide open work, overdue work, returned/information-requested work, and office bottlenecks;
  - add M9 feature coverage.
- Schema: consumes the additive `legislative_sessions` / `legislative_agenda_items` migration already introduced in the M9 scaffold.
- Verification: implementation and static contract review only; local integrated gate deferred.

### `216ec7c1674571ad022061335044ec90386d6270` — `fix: align legislative manager permissions with Phase 1 demo roles`
- Finding: the featured `legislative@talibon.demo` account is a `legislative_staff` user assigned to SB, while the first manager guard only allowed SB Secretary. The UI also exposed controls more broadly than the write guard.
- Fix: centralize `canView` / `canManage`; permit legislative staff in SB or SB Secretary to manage sessions/agenda for the Phase 1 demo contract; keep Vice Mayor read-capable; expose `canManage` to the UI; hide write controls when false; remove the unused frontend import; add featured-account regression coverage.
- Production note: the final municipal permission matrix can narrow manager authority after the official legislative staffing/delegation workflow is confirmed.

---

## P1-M10 — Reporting, audit, and authorization hardening

### `c3715d81f4a818283d13a8b15d1de35c497d9be9` — `feat: harden M10 reporting audit and authorization evidence`
- Milestone: P1-M10.
- Intent:
  - extend executive/HR reporting with onboarding, offboarding, property assignment, and reconciliation state;
  - keep payroll export HR-only;
  - add audit summaries for recent events, denied activity, and distinct actors;
  - add server-side audit filtering by outcome, action family, and department;
  - load explicit actor-department context;
  - add security regression tests proving privileged report/audit boundaries.
- Schema: none.
- Verification: implementation/test authoring completed; local integrated gate deferred.
- Security invariant: normal engineering users cannot open reports/audit; HR can access reports but not the privileged audit surface; non-HR executives cannot export payroll summaries.

---

## P1-M11 — Integrated acceptance preparation

### `2fac461f7c08479c8010add0c31b589ea131f01a` — `test: add M11 integrated Phase 1 acceptance matrix`
- Milestone: P1-M11.
- Intent: add a consolidated smoke/authorization acceptance test across dashboard, calendar, property, legislative workspace, Mayor workspace, reports, audit, HRIS lifecycle/offboarding/DTR/payroll, plus the 33-node routing shape.
- Documentation: adds `docs/PHASE_1_ACCEPTANCE_CHECKLIST.md`.
- Verification: tests authored but deliberately not represented as executed; final local run remains the acceptance authority.

---

## P1-M12 — Freeze and local handoff preparation

### `e9f668df223c6d2aaf01130687db5356da3b2d99` — `chore: prepare M12 freeze and local verification handoff`
- Milestone: P1-M12 preparation.
- Intent: stop feature creep, establish `PHASE1_CANDIDATE_OPEN_GATES`, add the release-status document, and provide a safe local verification script.
- Files: `scripts/phase1-verify.ps1`, `docs/PHASE_1_RELEASE_STATUS.md`.
- Verification script runs only:
  - additive `php artisan migrate`;
  - `npm run types:check`;
  - `npm run build`;
  - `php artisan test --testsuite=Feature`.
- Safety: the script contains no `migrate:fresh` or destructive database reset.

---

## Current release state

**Label:** `PHASE1_CANDIDATE_OPEN_GATES`

Feature implementation through M10 is materially present. M11 acceptance coverage and M12 handoff tooling are present. The branch must not be called release-green until the final local verification is run against the exact current HEAD and the observed migration/type/build/Feature results are recorded here.

The next allowed changes before release-green are limited to:

1. observed migration/type/build/test failures;
2. security or data-integrity defects;
3. acceptance blockers from `docs/PHASE_1_ACCEPTANCE_CHECKLIST.md`;
4. benchmark handoff documentation.

No new Phase 1 feature scope should be added during the freeze.

### `docs: consolidate engineering log through Phase 1 freeze prep`
- Milestone: engineering governance reconciliation.
- Intent: consolidate rapid-sprint history, explicitly document the M8 bug-bounty chain and M9-M12 commits, and restore the repository-level documentation trail before final local verification.
- Schema/runtime impact: none.
- Verification: documentation-only.
- Next action: run the final local verification after pulling the current branch, then fix only observed blockers and record the exact green evidence before assigning a release-green label.
