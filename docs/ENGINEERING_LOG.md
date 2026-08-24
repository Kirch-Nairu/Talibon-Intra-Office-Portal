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

### `feat: add correspondence detail workspace`

- Current TOR requirement / Slice: **Slice 3 — Correspondence Detail Workspace** only.
- Parent: `f2525ef6baf784eb4bf96e2bec3216edf5f5bc9c` (`feat: add correspondence workspace inbox`).
- Intent: add the human-facing correspondence read/detail workspace for Department Head evaluation while preserving the existing JSON detail contract and all lifecycle mutation ownership.
- New route: `GET /correspondence/{correspondence}/workspace` named `correspondence.workspace.show`; route model binding continues to use correspondence `public_id`. Existing `GET /correspondence/{correspondence}` remains JSON through `CorrespondenceLifecycleController::show`, and the machine `GET /api/v1/correspondence/{publicId}` contract is untouched.
- Authorization: the new workspace authorizes through `CorrespondenceAccessDecider::canViewInWorkspace()` **before** any detail projection is built. This preserves registrar access to eligible fresh RECEIVED intake while retaining office/assignment/classification boundaries for registered/classified/routed records; `system_admin` is not granted automatic restricted-content authority.
- Read-side organization: new `CorrespondenceDetailPresenter` centralizes correspondence/workflow/history projection. The existing JSON controller now delegates serialization to its `jsonContract()` method after the unchanged `canView()` authorization check, preserving the prior JSON shape/route while avoiding duplicate mapping. The workspace projection omits sender-contact structures and numeric correspondence IDs.
- Workspace page: new `Correspondence/Show.tsx` presents municipal/external references, lifecycle/classification, sender/source/channel, subject/summary, current office/workflow/assignee accountability, lifecycle dates, an append-only chronological event timeline, and an optional linked-workflow link only when the existing `TransactionPolicy` authorizes the actor to view that transaction. Empty lifecycle dates use the neutral `Not yet completed` label.
- Timeline: workspace events are loaded server-side in persisted `occurred_at`, then ID, order and include human/integration actor label, event office, prior/new lifecycle state, remarks and timestamp. No frontend sorting is used. RELEASE/ARCHIVE are not introduced or advertised.
- Slice 4 preparation: server-side `canRegister`, `canClassify`, `canRoute`, and `canAct` props are prepared without mutation buttons/forms. `canAct` additionally requires the existing `CorrespondenceWorkflowStateMapper::permitsInAction()` condition so the read model does not advertise an action the current mutation service would reject.
- Inbox integration: Slice 2 rows now expose a clear `View` link to the public-UUID workspace URL. Search, filters, authorization-scoped totals and server-side pagination are otherwise unchanged.
- Tests authored: new `CorrespondenceDetailWorkspaceTest` covers authorized Inertia detail, fresh RECEIVED registrar access, wrong-office denial/non-leakage, confidential denial, restricted denial, non-global `system_admin`, chronological timeline mapping, workflow/current-office/assignee projection with policy-gated transaction link, capability props including non-actionable routed state, and regression of the existing human JSON detail route/authorization contract.
- Schema/migration impact: **none**.
- Verification actually observed before commit: starting remote branch HEAD verified exactly at `f2525ef6baf784eb4bf96e2bec3216edf5f5bc9c`; local `php -l` PASS for `CorrespondenceDetailPresenter.php`, `CorrespondenceWorkspaceController.php`, `CorrespondenceLifecycleController.php`, and `CorrespondenceDetailWorkspaceTest.php`; standalone `tsc --noEmit` syntax/type parsing of the exact new `Correspondence/Show.tsx` source against minimal local module stubs PASS (syntax-level evidence only, not repository project TypeScript verification); production LOC review shows presenter **209 LOC**, workspace controller **82 LOC**, lifecycle controller **149 LOC**, new React page **211 LOC**, and inbox page **167 LOC**, all within applicable production caps.
- Environment limitation: dependency-backed checkout could not start because the isolated execution container still cannot resolve `github.com` (`git clone` failed with `Could not resolve host: github.com`). Therefore Laravel Feature execution, TypeScript project check and Vite production build are **not claimed PASS**. GitHub exact-commit status is checked after push separately.
- Explicit exclusions: no REGISTER/CLASSIFY/ROUTE/ACT frontend controls, RELEASE, ARCHIVE, attachments, user administration, task work, records search, dashboard expansion, parked-module work, API changes, or schema changes.
- Residual risks: exact dependency-backed runtime/TypeScript/build verification remains open until an executable checkout or CI result is available; capability props are intentionally server-only preparation for Slice 4 and are not rendered as controls.
- Stop condition: **Slice 3 only**. Do not begin lifecycle-action UI automatically.

### `feat: expose correspondence lifecycle actions in portal`

- Current TOR requirement / Slice: **Slice 4 — Human Correspondence Lifecycle Actions** only.
- Parent: `88294c6d8670e59376638bb597ec07d7d5ac3eb6` (`feat: add correspondence detail workspace`).
- Intent: make the existing authoritative correspondence lifecycle operable from the human Inertia workspace through `RECEIVED -> REGISTERED -> CLASSIFIED -> ROUTED -> IN_ACTION` without implementing any post-IN_ACTION semantics.
- New browser mutation routes:
  - `POST /correspondence/{correspondence}/workspace/register` → `correspondence.workspace.register`;
  - `POST /correspondence/{correspondence}/workspace/classify` → `correspondence.workspace.classify`;
  - `POST /correspondence/{correspondence}/workspace/route` → `correspondence.workspace.route`;
  - `POST /correspondence/{correspondence}/workspace/act` → `correspondence.workspace.act`.
- Preserved contracts: existing JSON `POST /correspondence/{correspondence}/register|classify|route|act`, human JSON `GET /correspondence/{correspondence}`, and machine `GET /api/v1/correspondence/{publicId}` remain registered and are not converted to Inertia redirects.
- Controller boundary: new `CorrespondenceWorkspaceActionController` is a thin browser adapter only: existing request validation where applicable → existing lifecycle/routing service → redirect to `correspondence.workspace.show` with the application's existing success flash convention. No mutation logic was moved into `CorrespondenceWorkspaceController`.
- Service reuse: REGISTER/CLASSIFY continue through `CorrespondenceLifecycleService`; ROUTE/ACT continue through `CorrespondenceRoutingService`, which still delegates workflow creation to the existing `TransactionWorkflowService::createWithinExistingTransaction()`; authorization/state locking remains in the existing access decider/services/workflow-state mapper.
- Presentation authorization: Slice 3 `canRegister`, `canClassify`, `canRoute`, and strict `canAct` remain presentation hints only. React contains no role-name authorization. Backend authorization and locked lifecycle validation remain authoritative, so stale/double submissions fail safely.
- Routing options: `CorrespondenceDetailPresenter` now emits `routeOptions` only when `canRoute` is true. Options contain only `id/code/name/shortName` for active+routable departments and exclude the actor's own office; the existing workflow service still rejects self/invalid destinations.
- Frontend: new `CorrespondenceActionPanel.tsx` keeps the main detail page compact and renders only the current valid next action: Register, Classify, Route, or Start Action. REGISTER requires confirmation and no editable municipal reference. CLASSIFY uses exactly public/internal/confidential/restricted with optional remarks and a concise sensitivity note. ROUTE uses exactly target_department_id, priority, due_at and remarks. ACT accepts optional remarks and is shown only when the existing access decider **and** workflow-state mapper allow it. Routed-but-not-actionable records continue to rely on the linked generic workflow for assignment/review rather than duplicating workflow controls.
- Error/double-submit behavior: Inertia `useForm` renders field/domain validation errors from existing backend contracts; processing disables the active submit button. No client lifecycle lock or swallowed backend exception path was added.
- Tests authored: new `CorrespondenceWorkspaceActionsTest` covers workspace REGISTER reference generation/redirect/event/outbox/exactly-once; CLASSIFY persistence/remarks/unauthorized staff/restricted visibility/invalid classification; ROUTE workflow creation/destination/priority/due/remarks/self+disabled+past-date rejection/exactly-once; conditional routing options; non-actionable ACT rejection; actionable ACT + event/outbox exactly-once; wrong-office and non-global `system_admin` mutation denial; all four existing JSON mutation contracts; existing human JSON detail; and machine status route preservation.
- Schema/migration impact: **none**.
- Verification actually observed before commit: authorized starting remote HEAD verified exactly at `88294c6d8670e59376638bb597ec07d7d5ac3eb6`. The isolated execution container still cannot resolve `github.com` (`git ls-remote` failed with `Could not resolve host: github.com`), so a dependency-backed checkout could not be established. Changed-PHP syntax checks, `CorrespondenceWorkspaceActionsTest`, `CorrespondenceDetailWorkspaceTest`, `CorrespondenceWorkspaceTest`, `CorrespondenceCoreATest`, `CorrespondenceCoreBTest`, repository TypeScript, and Vite production build are therefore **NOT OBSERVED** in this environment. No PASS is inferred from source inspection.
- Complexity: production changes remain focused: action controller about **100 LOC**, detail presenter about **236 LOC**, action panel about **276 LOC**, main correspondence detail page about **217 LOC**. No generic workflow service is expanded and no new lifecycle/authorization framework is introduced.
- Explicit exclusions: no RELEASE, ARCHIVE, completion semantics, attachments, retention, records search, task-queue work, dashboard work, user administration, parked-module work, generic workflow-state changes, or schema migration.
- Residual risk: dependency-backed runtime/TypeScript/build verification remains open until CI or an executable checkout is available; browser confirmation behavior is client-side usability only and does not replace server state guards.
- Stop condition / next action: **Slice 4 complete candidate only; do not begin Slice 5 automatically.**

### `feat: refine intra-office work queue`

- Current TOR requirement / Slice: **Slice 5 — My Work / Task Queue Refinement** only.
- Parent: `47d05b707064b196e084772c8dfca3c7dd4d974b` (`feat: expose correspondence lifecycle actions in portal`).
- Intent: replace the old latest-100 transaction index projection with an authorized, server-driven My Work queue over the existing `WorkflowTransaction` model. This is query/projection/UI refinement only; no Task model, Task engine or new workflow domain is introduced.
- Existing authoritative fields reused: `assigned_employee_id`, `current_department_id`, `origin_department_id`, `due_at`, `priority`, `status`, `received_at`, `completed_at` and the existing transaction office/assignee relationships.
- New read/query boundary: `TransactionIndexRequest` validates queue view/search/status/priority/current-office/page inputs; `WorkQueueQuery` applies existing transaction visibility first, then common filters, then the selected queue projection. Global queue visibility is derived from the existing `TransactionCapabilities::VIEW_ALL` capability rather than duplicating the former controller role list.
- Queue views: **Needs My Action**, **Assigned to Me**, **Office Queue**, **Unassigned**, **Overdue**, **Due Soon**, **High Priority**, **Waiting on Others**, and **Recently Completed**. Active/terminal behavior derives from the existing workflow terminal-status configuration. Needs My Action projects active work assigned to the actor plus active unassigned work in the actor's office. Waiting on Others projects active work originated by the actor's office but currently held elsewhere. Recently Completed projects terminal work completed, or historically terminal-updated where completion timestamp is absent, within the last 30 days.
- Search/filter behavior: server-side search covers reference, title, description, origin/current office name and assigned employee name. Status, priority and current-office filters intersect the already-authorized query. Non-global office options are limited to current offices represented by the actor's authorized transaction scope plus the actor's own office; VIEW_ALL actors receive active municipality office options.
- Counts/pagination: all nine view counts are calculated from the already-authorized base after common filters, so hidden work cannot influence queue totals. The selected queue is paginated server-side at 25 rows/page; queue ordering prioritizes overdue/deadline and urgency while Recently Completed uses completion/update recency.
- Frontend: `Transactions/Index.tsx` remains the existing My Work route but now presents the nine server-driven work views, search/status/priority/current-office filters, assignee/current-office/deadline/age/status context and clear requires-action/overdue indicators. Existing transaction detail links and the New Transaction entry point remain intact. React does not calculate role authorization or workflow mutation rules.
- Preserved mutation/detail contracts: `TransactionController::show`, `store`, `transition`, `TransactionPolicy`, `TransactionWorkflowService` and workflow definitions are unchanged by this slice.
- Tests authored: new `WorkQueueTest` covers default Needs My Action + cross-office non-leakage, all named queue projections, combined search/status/priority/current-office filtering, non-global filter intersection, VIEW_ALL municipality-wide filtering, server pagination after authorization/view projection, and regression of the existing transaction detail + transition contract.
- Schema/migration impact: **none**.
- Verification actually observed before commit: required starting remote branch HEAD verified exactly at `47d05b707064b196e084772c8dfca3c7dd4d974b`; source/contract inspection against current transaction authorization, workflow configuration, model, controller and UI completed. Dependency-backed Laravel Feature execution, repository TypeScript check and Vite production build remain **NOT OBSERVED** unless exact candidate execution evidence is obtained before push. No unobserved gate is promoted to PASS.
- Complexity: controller index is reduced to authorization + query delegation; new request is small; `WorkQueueQuery` remains within the repository service hard cap but enters the 301–400 LOC review band, justified here as one cohesive read/query projection with no mutation responsibility; the rewritten React page remains below the 400-LOC page cap.
- Explicit exclusions: no Task aggregate/engine, records-search surface, dashboard work, correspondence changes, notification architecture changes, generic workflow changes, schema migration, RELEASE/ARCHIVE/attachments, user administration or parked-module development.
- Residual risk: exact dependency-backed Feature/TypeScript/Vite verification is still required if the execution environment/CI exposes it; queue semantics are prototype projections and should be validated with Department Heads before becoming the final implementation baseline.
- Stop condition / next action: **Slice 5 only**. Do not begin Slice 6 automatically.

## Current release / prototype state

- Formal project state: `PRE-MOBILIZATION / WORKING PROTOTYPE PREPARATION`.
- Current goal: Department Head prototype readiness for the Core Intra-Office Portal.
- Production/UAT completion is not claimed.
