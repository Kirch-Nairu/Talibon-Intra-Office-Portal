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

### Integration Foundation A/B and Correspondence Core A/B

- Integration Foundation A established first-class machine identities, scoped credentials, correlation identity, request validation, client rate limiting and machine audit identity.
- Integration Foundation B established persisted idempotency and a transactionally atomic outbox without external transport or microservice split.
- Correspondence Core A established the aggregate/history and `RECEIVE -> REGISTER -> CLASSIFY` with locked municipal numbering and classification-aware content access.
- Correspondence Core B bridged `ROUTE -> IN_ACTION` into the existing generic workflow engine without duplicating workflow persistence/rules.
- Last validated Core B runtime candidate `8ac6689b2d682c1f743cb759f9ea5802bd0ba3d6`: `CorrespondenceCoreBTest` **16 passed / 148 assertions / 3.08s**; Core A **17 passed / 100 assertions / 1.86s**; Foundation B **15 passed / 86 assertions / 1.44s**; Foundation A **17 passed / 129 assertions / 1.28s**; disposable PostgreSQL migration/seed, Composer validation, PHP lint and route inspection PASS. This was candidate-tree evidence, not an exact runtime run of later documentation-bearing commits.
- Final repository HEAD before the current procurement wave was `8e4f97da892b8cb7205f53b150531bc1cd4687f4`.

## 2026-08-24 — Current Core Intra-Office Portal procurement

### `docs: establish current intra-office portal scope authority`

- Current TOR requirement / Slice: **Slice 0 — Current Procurement Authority**.
- Parent: `8e4f97da892b8cb7205f53b150531bc1cd4687f4`.
- Commit: `7af0df82ec9abb18d64a77c84fc8d3a658b7691a`.
- Intent: make the present Core Intra-Office Portal procurement the active development authority without deleting historical SSOT/commercial records or broader implementation already present.
- Files/modules changed: new `SSOT_CURRENT_INTRA_OFFICE_PORTAL_SCOPE.md`; `AGENTS.md`; `docs/ENGINEERING_LOG.md`.
- Scope authority recorded: ALZA IT Solutions is the legal/implementing entity; Team ALZA is the project team; Kirch Ivan A. Balite is Technical Lead for System Architecture & Engineering Direction; current state is PRE-MOBILIZATION / WORKING PROTOTYPE PREPARATION; active work maps only to the Core Intra-Office Portal TOR.
- Schema/migration impact: **none**. Runtime impact: **none**.
- Verification actually observed: starting remote branch HEAD verified exactly before the docs-only commit and final branch ref verified at the Slice 0 commit. No runtime/build result claimed.
- Next slice: **Slice 1 — Prototype Navigation Isolation**.

### `feat: isolate current intra-office portal prototype navigation`

- Current TOR requirement / Slice: **Slice 1 — Prototype Navigation Isolation**.
- Parent: `7af0df82ec9abb18d64a77c84fc8d3a658b7691a`.
- Commit: `e3f614baa3b4b2f52b483a1fb0caf3bad91fadad`.
- Intent: present only current Core Intra-Office Portal surfaces to Department Heads while preserving all parked routes and backend modules.
- Changed: `AppLayout.tsx`, `DashboardController.php`, `Dashboard.tsx`, new `CurrentPortalNavigationTest.php`, this log.
- Presentation: hides Operations, Central Records/Legislative, HRIS, Employees and broad Reports; retains Dashboard, My Work, authorized Mayor's Office, Memoranda, Departments and authorized Audit & Security.
- Dashboard: removes Legislative, HR/workforce and project/procurement/fund/compliance rollups from current presentation data.
- Route preservation: no parked route was removed. Focused test coverage was authored to assert representative parked routes remain registered.
- Correspondence sequencing: the clickable Correspondence navigation item was intentionally deferred until Slice 2 so Slice 1 did not ship a dead link.
- Schema/migration impact: **none**.
- Verification actually observed: source-level inspection only. `CurrentPortalNavigationTest` was authored but not executed. Exact-commit workflow lookup exposed no run. No PHP runtime, TypeScript or Vite PASS claimed.
- Next slice: **Slice 2 — Correspondence Index / Inbox**.

### `feat: add correspondence workspace inbox`

- Current TOR requirement / Slice: **Slice 2 — Correspondence Index / Inbox**.
- Parent: `e3f614baa3b4b2f52b483a1fb0caf3bad91fadad`.
- Intent: expose the existing correspondence backend as an authenticated, server-authorized Department Head/staff inbox without creating a new workflow, task or authorization architecture.
- New/changed production modules:
  - `CorrespondenceWorkspaceController` — thin Inertia entry point for the human inbox;
  - `CorrespondenceIndexRequest` — validates search, lifecycle, classification, office, assignment, action and aging filters;
  - `CorrespondenceInboxQuery` — focused authorized query/read-model service with server-side search, filtering, pagination and row serialization;
  - `CorrespondenceAccessDecider` — adds SQL visibility scoping, workspace visibility semantics for registration-eligible unregistered RECEIVE intake, authorized classification options and action-required projection while retaining the existing office/assignment/classification rules;
  - `GET /correspondence` named `correspondence.index`, registered before the existing record route;
  - `Correspondence/Index.tsx` — responsive inbox with server-driven filters, authorized paginator, lifecycle/classification/current-office/assignee/age/action/overdue presentation;
  - `AppLayout.tsx` — activates the Correspondence navigation item now that the route exists.
- Authorization behavior: all row visibility, search and pagination begin from `CorrespondenceAccessDecider::scopeVisibleTo()`. Fresh machine-received records remain visible only to roles already permitted by existing `canRegister()` semantics; office/assignment context governs registered/routed records; classification visibility remains role-sensitive; `system_admin` is not made global content authority. Restricted/confidential records outside the actor's authorized office/assignment context cannot influence totals, search results, pages or returned props.
- Query behavior: search covers municipal/external reference, sender, organization, source and subject. Lifecycle, authorized classification, current office, assigned-to-me, action-required and linked-workflow overdue filters execute server-side. Pagination is 20 records/page and preserves query parameters.
- Prototype scope: filter options intentionally advertise only `received`, `registered`, `classified`, `routed`, and `in_action`; reserved RELEASE/ARCHIVE vocabulary is not activated.
- Tests authored: new `CorrespondenceWorkspaceTest` covers authorized intake/office visibility, cross-office restricted non-enumeration, classification-filter non-leakage, search+lifecycle filtering, assigned-to-me, overdue, action-required and pagination/filter combination. `CurrentPortalNavigationTest` is updated to require the new Correspondence link/route while continuing to assert parked-route preservation.
- Schema/migration impact: **none**.
- Local verification attempt: dependency-backed checkout could not start because the isolated execution container could not resolve `github.com` (`git clone` failed with `Could not resolve host: github.com`). This is an environment limitation and is not recorded as a test failure or PASS.
- Verification actually observed before commit: repository contract/source inspection and generated-blob review only. Laravel Feature tests, TypeScript and Vite production build are **not claimed PASS** in this entry because no executable checkout/dependency graph was available in the isolated container before commit.
- LOC/complexity: new controller/request/query service remain focused and below repository hard caps; the new React page is kept below the 400-LOC page cap; `TransactionWorkflowService` and correspondence lifecycle services are not expanded.
- Residual risks: runtime verification remains open; the inbox is intentionally read/list-only and does not yet turn the existing JSON correspondence detail endpoint into an Inertia workspace; REGISTER/CLASSIFY/ROUTE/ACT controls remain future Slices 3/4; RELEASE/ARCHIVE/attachments remain explicitly deferred.
- Next slice after review: **Slice 3 — Correspondence Detail Workspace**. Do not begin it automatically until this Slice 2 commit is coherent and pushed/reported.

## Current release / prototype state

- Formal project state: `PRE-MOBILIZATION / WORKING PROTOTYPE PREPARATION`.
- Current goal: Department Head prototype readiness for the Core Intra-Office Portal.
- Production/UAT completion is not claimed.
