# Engineering Log

Current authority: `SSOT_CURRENT_INTRA_OFFICE_PORTAL_SCOPE.md`  
Historical authority retained: `SSOT_BY_KIRCH.md` + `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`

This consolidated log records active implementation history and observed verification only. Detailed pre-current-procurement entries remain preserved in Git history at parent `8e4f97da892b8cb7205f53b150531bc1cd4687f4` and its predecessors; this consolidation does not erase that history.

Every implementation commit must update this file in the same commit. Never convert an unobserved gate into a PASS claim.

## Historical implementation baseline

### Internal Build Wave A

- M0-M1: organization/routing compatibility model; 33 routable nodes; branch-aware universal routing.
- M2-M3: persistent notifications, shared calendar/document metadata, employee profile/201 foundation.
- M4: onboarding, movement and basic property accountability. Historical observed baseline: build PASS; Feature suite 24 tests / 173 assertions.
- M5: DTR/leave/payroll context. Historical observed baseline: build PASS; Feature suite 28 tests / 191 assertions.
- M6: performance/development/restricted health vault. Historical observed baseline: build PASS; Feature suite 33 tests / 231 assertions.
- M7-M12 and later accelerated work added offboarding, property lifecycle, executive/legislative workspaces, reporting/audit/security and release evidence. These broader modules are preserved but do not define the current Core Intra-Office Portal procurement.

### Core architecture normalization

- Workflow vocabulary, transition rules, SLA/default state knowledge and authorization context were extracted into reusable domain boundaries without replacing the existing modular-monolith workflow engine.
- Internal synchronous workflow domain events preserve database-backed audit/notification/calendar behavior inside authoritative transactions.
- Exact-HEAD runtime evidence historically supplied for `63407b4bf5bc965809fb2022cb5adff45a829b1c`: **62 passed / 374 assertions / 895.68s**. That evidence applies only to that exact commit.

### Privileged MFA / identity assurance

- Privileged MFA, active-account enforcement, assurance generation/versioning, sensitive Inertia handling, recovery-code controls and authentication audit evidence were implemented.
- Exact-HEAD closure evidence for `fb59f126ad63958dbb5b8d3d56182983b858dfde`: Composer install PASS; Composer validate PASS; Composer audit PASS with no advisories; migration PASS; `MfaSecurityControlsTest` **11 passed / 109 assertions / 7.50s**; `PrivilegedMfaAuthenticationTest` **7 passed / 50 assertions / 5.35s**; TypeScript PASS; Vite build PASS; full Feature regression **80 passed / 533 assertions / 1147.41s**. This evidence applies only to that exact commit.

### Integration Foundation A

- First-class machine identities, scoped credentials, correlation identity, request validation, client rate limiting and separate machine audit identity were established.
- Validated candidate `4b098990398182054b04be93f7799b3543bf7865`: `IntegrationFoundationTest` **17 passed / 129 assertions / 1.14s**, plus disposable PostgreSQL migrate/seed, Composer validation, PHP lint and route inspection PASS.

### Integration Foundation B

- Persisted idempotency and transactional outbox boundaries were established without external transport, queues, Kafka/RabbitMQ or microservice split.
- Validated runtime candidate `f7159962ee46df06615bd6233b9b52645322ad27`: `IntegrationFoundationBTest` **15 passed / 86 assertions / 1.31s** and Foundation A compatibility **17 passed / 129 assertions / 1.19s**, plus disposable PostgreSQL migration/seed, Composer validation, PHP lint and route inspection PASS.

### Correspondence Core A

- Added authoritative correspondence aggregate/history and machine RECEIVE plus human REGISTER / CLASSIFY lifecycle.
- Added annual locked municipal reference allocation and classification-aware access control.
- Validated runtime candidate `f6f1c989b4a4cf884b3affc4557eb8717e703400`: `CorrespondenceCoreATest` **17 passed / 100 assertions / 1.81s**; Foundation B **15 passed / 86 assertions / 1.51s**; Foundation A **17 passed / 129 assertions / 1.19s**; disposable PostgreSQL migration/seed, Composer validation, PHP lint and route inspection PASS.

### Correspondence Core B

- Parent/base: `72782c86653dd871cbd6c15fcb162eaff2789cbd`.
- Final repository commit before the current procurement-authority wave: `8e4f97da892b8cb7205f53b150531bc1cd4687f4` (`feat: bridge correspondence routing and action workflow`).
- Added human ROUTE and ACT / IN_ACTION bridge into the existing generic workflow engine without duplicating workflow persistence/rules.
- Added classification-aware human correspondence read/route/action behavior and append-only routed/in-action history/outbox events.
- Validated runtime candidate `8ac6689b2d682c1f743cb759f9ea5802bd0ba3d6`: `CorrespondenceCoreBTest` **16 passed / 148 assertions / 3.08s**; Core A **17 passed / 100 assertions / 1.86s**; Foundation B **15 passed / 86 assertions / 1.44s**; Foundation A **17 passed / 129 assertions / 1.28s**; disposable PostgreSQL migration/seed, Composer validation, PHP lint and route inspection PASS.
- The documentation-bearing repository HEAD `8e4f97d...` itself had no newly observed exact-HEAD CI/check result at the start of the current procurement wave; candidate evidence is not silently transferred to a distinct commit SHA.
- Known preserved gaps at that point: human correspondence UI remained absent; protected documents, RELEASE/ARCHIVE and explicit grants/delegations remained deferred; outbox remained transport-free.

## 2026-08-24 — Current Core Intra-Office Portal procurement

### `docs: establish current intra-office portal scope authority`

- Current TOR requirement / Slice: **Slice 0 — Current Procurement Authority**.
- Parent: `8e4f97da892b8cb7205f53b150531bc1cd4687f4`.
- Commit: `7af0df82ec9abb18d64a77c84fc8d3a658b7691a`.
- Intent: make the present Core Intra-Office Portal procurement the active development authority without deleting historical SSOT/commercial records or broader implementation already present.
- Files/modules changed: new `SSOT_CURRENT_INTRA_OFFICE_PORTAL_SCOPE.md`; `AGENTS.md`; `docs/ENGINEERING_LOG.md`.
- Scope authority recorded: ALZA IT Solutions is the legal/implementing entity; Team ALZA is the project team; Kirch Ivan A. Balite is Technical Lead for System Architecture & Engineering Direction; current state is PRE-MOBILIZATION / WORKING PROTOTYPE PREPARATION; active work maps only to the Core Intra-Office Portal TOR.
- Preserved/parked: broader HRIS, payroll/DTR/attendance/leave, health-vault expansion, Property expansion, Legislative expansion, GAD, public portal, eBOSS, biometric, project/procurement expansion and other future modules remain in the repository but are not current implementation authority.
- Commercial/state rule: existing pre-mobilization implementation is engineering/prototype progress and is not contractual completion. Department Head prototype evaluation precedes the final implementation baseline.
- Schema/migration impact: **none**.
- Runtime impact: **none**; documentation/governance only.
- Verification actually observed: remote branch HEAD verified as exactly `8e4f97da892b8cb7205f53b150531bc1cd4687f4` before implementation; final branch ref then verified at `7af0df82ec9abb18d64a77c84fc8d3a658b7691a`. No runtime, Laravel, TypeScript or Vite test is claimed for this docs-only slice.
- Known gaps/risks: older historical documents still contain broader commercial terminology by design; agents/developers must follow the new read order so those files do not silently expand active scope.
- Next slice: **Slice 1 — Prototype Navigation Isolation**.

### `feat: isolate current intra-office portal prototype navigation`

- Current TOR requirement / Slice: **Slice 1 — Prototype Navigation Isolation**.
- Parent: `7af0df82ec9abb18d64a77c84fc8d3a658b7691a`.
- Intent: present only current Core Intra-Office Portal surfaces to Department Heads while preserving all parked routes and backend modules.
- Files/modules changed:
  - `resources/js/layouts/AppLayout.tsx` — removes Operations, Central Records/Legislative, HRIS, Employees and broad Reports from the prototype navigation while retaining Dashboard, My Work, authorized Mayor's Office, Memoranda, Departments and authorized Audit & Security;
  - `app/Http/Controllers/DashboardController.php` — removes Legislative, HR/workforce and project/procurement/fund/compliance rollups from serialized dashboard data;
  - `resources/js/pages/Dashboard.tsx` — removes parked-module cards/links and keeps current intra-office workload, recent transactions, office bottlenecks and current portal shortcuts;
  - `tests/Feature/CurrentPortalNavigationTest.php` — focused presentation-scope and route-preservation coverage;
  - `docs/ENGINEERING_LOG.md` — this entry.
- Correspondence navigation sequencing: the clickable Correspondence item is intentionally activated in Slice 2 together with the real `GET /correspondence` index route so Slice 1 does not ship a dead navigation link.
- Authorization behavior: existing server-side authorization and parked direct-route authorization are unchanged. Audit & Security and Mayor's Office remain role-gated in the shell; hiding parked links does not grant or revoke backend access.
- Route preservation: Slice 1 does not delete or alter parked routes. Focused test coverage asserts representative Operations, Legislative, HRIS, Property, Reports and Employees routes remain registered even though they are not advertised in the current prototype shell.
- Schema/migration impact: **none**.
- Verification authored for this slice: `CurrentPortalNavigationTest` checks current-scope navigation labels, absence of parked navigation hrefs, preservation of parked route registration, and absence of old parked dashboard rollup props.
- Verification actually observed before commit: source-level inspection of the changed PHP/TSX content and route names only. No PHP runtime, Laravel Feature execution, TypeScript compiler or Vite build is claimed yet because no dependency-backed execution environment is available through the repository connector itself. CI status will be checked after push if GitHub exposes a run for the exact commit.
- LOC/complexity: rewritten `DashboardController.php` remains comfortably under the 300-LOC controller cap; `Dashboard.tsx` remains under the 400-LOC React page cap; no existing service is enlarged.
- Residual risks: Correspondence is not yet exposed in navigation until Slice 2 creates a functional index; Slice 7 will later perform the deeper dashboard refocus around correspondence-specific attention metrics.
- Next slice: **Slice 2 — Correspondence Index / Inbox**.

## Current release / prototype state

- Formal project state: `PRE-MOBILIZATION / WORKING PROTOTYPE PREPARATION`.
- Current goal: Department Head prototype readiness for the Core Intra-Office Portal.
- Production/UAT completion is not claimed.
