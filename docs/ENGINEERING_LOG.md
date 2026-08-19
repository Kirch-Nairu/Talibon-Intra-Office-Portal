# Engineering Log

This log is mandatory for every commit on the active Talibon build.

Authority: `SSOT_BY_KIRCH.md`.

## Entry format

### YYYY-MM-DD HH:MM PHT — `<commit message>`

- Milestone / requirement:
- Intent:
- Important files / modules:
- Schema / migration impact:
- Verification performed:
- Known gaps / risks:
- Next action:

---

## 2026-08-19 20:09 PHT — `docs: establish Kirch SSOT and mandatory engineering log`

- Milestone / requirement: Phase 1 project start / governance baseline.
- Intent: Establish the controlling Phase 1 scope, client priority, internal architecture boundaries, hard delivery target, agent read order, and mandatory commit documentation policy before implementation begins.
- Important files / modules: `SSOT_BY_KIRCH.md`, `AGENTS.md`, `docs/ENGINEERING_LOG.md`.
- Schema / migration impact: None.
- Verification performed: Documentation-only change; no runtime behavior changed and no application test result is claimed.
- Known gaps / risks: `docs/PHASE_1_PLAN.md` is the next required artifact; organization routing aliases still require M0 validation; production integrations remain unverified.
- Next action: Create the detailed Phase 1 execution plan and acceptance gates, then start P1-M0/P1-M1 implementation.

## 2026-08-19 20:15 PHT — `docs: lock Phase 1 execution plan and acceptance gates`

- Milestone / requirement: P1 planning / execution baseline.
- Intent: Convert the Kirch SSOT into an engineering sequence for the Aug 21 12:00 PHT target, define workstreams, migration ownership, priority cut line, data/event contracts, authorization principles, acceptance scenarios, verification gates, and honest release labels.
- Important files / modules: `docs/PHASE_1_PLAN.md`, `docs/ENGINEERING_LOG.md`.
- Schema / migration impact: None; plan proposes candidate structures but explicitly requires inspection before migrations are created.
- Verification performed: Documentation-only planning change; no runtime behavior changed and no application test result is claimed.
- Known gaps / risks: M0 code inspection still required before schema implementation; existing 29-office prototype seeding must be reconciled with the approximately 33-node routing baseline; hard deadline is highly compressed.
- Next action: Begin P1-M0 repository inspection, establish the compatibility organization model, then implement P1-M1.

## 2026-08-19 20:56 PHT — `feat: establish Phase 1 organization routing foundation`

- Milestone / requirement: P1-M0 / P1-M1 organization and routing foundation.
- Intent: Preserve the existing `departments` compatibility anchor while adding branch, office-type, hierarchy, routability, and ordering metadata; reconcile the prototype 29-office seed with the 33-node Phase 1 baseline; and enable CI for the active Phase 1 branch.
- Important files / modules: department schema/model, municipality structure seeder, department directory controller, Phase 1 organization routing feature test, GitHub Actions CI.
- Schema / migration impact: Additive migration on `departments`: `branch`, `office_type`, `parent_department_id`, `is_routable`, and `sort_order`. No existing department foreign keys are renamed or removed.
- Verification performed: Repository-level code inspection completed before implementation. A feature test was added for 33 routable nodes, 30 executive + 3 legislative split, and legislative routing. CI was enabled for `KIRCH-PHASE1-**`; runtime results are not yet claimed in this commit.
- Known gaps / risks: Routing controllers/services still need explicit `is_routable` enforcement; office hierarchy parent links remain unset until the actual organizational chart is formally validated; acting/delegated assignments and office-specific workspace depth are not yet implemented.
- Next action: Enforce routable-office selection server-side, update routing/directory UI for branch-aware destinations, observe CI, then proceed to shared documents/notifications/calendar and HR lifecycle foundations.

## 2026-08-19 21:12 PHT — `feat: enforce branch-aware universal office routing`

- Milestone / requirement: P1-M1 universal office routing.
- Intent: Enforce active/routable destination selection in validation and the workflow service, make the routing UI branch-aware, expose the 30 executive + 3 legislative structure in the office directory, and reject disabled routing destinations even when requests are tampered with.
- Important files / modules: `TransactionController`, `TransactionWorkflowService`, department directory UI, new-transaction UI, shared TypeScript department type, Phase 1 organization/routing feature test.
- Schema / migration impact: None beyond the additive department metadata migration introduced by the immediately preceding documented commit.
- Verification performed: Added a feature test proving non-routable destinations are rejected and existing legislative routing remains auditable. Static inspection completed; CI/runtime result is not claimed until observed.
- Known gaps / risks: Existing transaction detail transition UI is not yet visually grouped by branch even though the backend now filters to routable offices; acting/delegated assignments remain pending; office-specific workspace pages are still shared-directory level.
- Next action: Observe CI for the first Phase 1 runtime commits, fix any gate failures, then start P1-M2 shared documents/notifications/calendar followed by employee-profile and HR lifecycle work.

## 2026-08-19 21:14 PHT — `feat: add persistent notifications calendar and shared document foundation`

- Milestone / requirement: P1-M2 shared documents, notifications, and calendar foundation.
- Intent: Replace transaction-arrival notification truth with persistent deduplicated per-user records for new Phase 1 events, preserve legacy M6 event-derived notifications only as a pre-cutover fallback, create a shared municipal calendar domain, generate workflow-deadline events, and establish reusable protected document metadata/link records for later HR/property/legislative attachments.
- Important files / modules: notification/calendar/document migrations and models; `PlatformNotificationService`; `CalendarService`; transaction workflow side effects; Inertia shared notifications; calendar page/controller; notification read/ack endpoints; shared platform feature tests.
- Schema / migration impact: Adds `platform_notifications`, `calendar_events`, `documents`, and `document_links`. No existing memo, transaction, HR, or legislative tables are removed or renamed.
- Verification performed: Static repository inspection and test authoring only. Added tests for persistent transaction notifications, notification deduplication/acknowledgement, deadline calendar generation/visibility, and shared document linking. No runtime test/build/CI pass is claimed yet.
- Known gaps / risks: Actual binary upload/download authorization is not implemented in this foundation commit; calendar currently surfaces routed-work deadlines and is ready for HR/legislative/property publishers; notification acknowledgement UI beyond memoranda is not yet surfaced; Reverb/WebSocket transport is still deferred and polling remains the UI fallback.
- Next action: Observe/fix runtime gates, then proceed directly to P1-M3 employee profile/201-file foundation and P1-M4 onboarding/movement/basic property accountability.

## 2026-08-19 21:14 PHT — `feat: establish permission-aware employee profile and 201 foundation`

- Milestone / requirement: P1-M3 employee master, profile, and 201-file foundation.
- Intent: Extend the employee master with employment/supervisor/private-contact/government-identifier fields, encrypt high-sensitivity profile values at the application layer, add a permission-aware employee profile surface, reuse the shared document domain for 201-file metadata, and explicitly keep health/clinical data outside the general profile.
- Important files / modules: employee profile migration/model, employee profile controller/page, employee directory links, route, profile authorization tests.
- Schema / migration impact: Additive fields on `employees` for supervisor, employment metadata, personal/emergency contact, date of birth, and government identifiers. Sensitive text fields use Laravel encrypted casts; no existing employee keys are removed or renamed.
- Verification performed: Static inspection and feature-test authoring only. Added tests for self private-profile access, department-head denial of another employee's private/201 profile, and HR access without implicit health-vault permission. No runtime test/build/CI pass is claimed yet.
- Known gaps / risks: Production key-management/rotation policy is not yet finalized; employee profile editing and protected binary 201-file upload are not yet implemented; health vault remains a separate later Phase 1 milestone; supervisor assignments are schema-ready but not yet seeded from validated municipal reporting lines.
- Next action: Start P1-M4 onboarding and employment movement cases with blocker tasks and basic property accountability hooks.

## 2026-08-19 21:31 PHT — `feat: add onboarding movement and property domain foundations`

- Milestone / requirement: P1-M4 onboarding, employment movement, and basic property accountability foundation.
- Intent: Add blocker-driven onboarding cases, auditable employee movements with post-movement review tasks, and the first GSO-oriented asset accountability ledger so HR lifecycle changes can coordinate identity, open-work review, property review, calendar, notifications, and audit rather than behave as isolated CRUD updates.
- Important files / modules: onboarding/movement/property migrations and models; `EmployeeLifecycleService`; `AssetAccountabilityService`; employee lifecycle relationships; Phase 1 lifecycle/property feature tests.
- Schema / migration impact: Adds `onboarding_cases`, `onboarding_tasks`, `employee_movements`, `employee_movement_tasks`, `assets`, `asset_assignments`, and append-only `asset_events`. Existing employee, workflow, HR, and shared-platform tables remain compatible.
- Verification performed: Static design review and feature-test authoring only. Tests cover onboarding blocker enforcement and activation, movement-triggered open-work/property review tasks, persistent employee movement notification, and property issue/return event history. No runtime migration/test/build/CI pass is claimed yet.
- Known gaps / risks: Runtime controllers and user-facing P1-M4 surfaces are the next commit; property permissions currently exist at the domain-service boundary and will also be enforced at HTTP/controller level; asset inventory/maintenance/disposal depth remains P1-M8; onboarding task completion is manual confirmation except portal identity creation and must not be represented as live biometric/payroll integration.
- Next action: Add restricted HR lifecycle and property HTTP surfaces, server-side request validation, navigation entry points, then run/observe migration and feature gates before advancing to P1-M5.

## 2026-08-19 21:47 PHT — `feat: expose lifecycle and property accountability workspaces`

- Milestone / requirement: P1-M4 user-facing onboarding/movement/property workflows and authorization hardening.
- Intent: Expose restricted HR lifecycle controls and the property-accountability workspace, enforce HTTP and domain authorization, prevent future-dated movements from being silently applied, validate supervisors against destination offices, route cross-office review tasks to their owning offices, and prevent private employee fields from leaking through broad directory/HR-admin serialization.
- Important files / modules: `HrisLifecycleController`, `PropertyController`, lifecycle and property React pages, routes, `EmployeeLifecycleService`, `AssetAccountabilityService`, `HrisAdminController`, `EmployeeDirectoryController`, HTTP/domain feature tests.
- Schema / migration impact: No new schema beyond the P1-M4 migrations in the preceding commit. This commit consumes and hardens those tables.
- Verification performed: Static implementation review and feature-test authoring only. Added HTTP tests for HR lifecycle restriction, onboarding blocker response, property read/mutation restrictions, and property registration. Updated domain tests for immediate movement semantics. No runtime migration/test/build/CI pass is claimed yet.
- Known gaps / risks: GSO-specific featured demo credentials are not yet seeded; inventory/maintenance/disposal and Accounting reconciliation depth remain P1-M8; cross-office task completion UI is still HR-coordinated even though service authorization supports owner-office completion; actual biometric/payroll integrations remain explicit boundaries rather than simulated live integrations.
- Next action: Run the dedicated migration/feature/type/build gates, fix observed failures, then proceed to P1-M5 leave/attendance/DTR/payroll lifecycle integration.

## 2026-08-19 21:53 PHT — `fix: align onboarding task UI type contract`

- Milestone / requirement: P1-M4 frontend contract hardening before verification.
- Intent: Align the onboarding checklist TypeScript contract with the backend task payload by declaring the completion timestamp used by the rendered audit/status line.
- Important files / modules: `resources/js/pages/Hris/Lifecycle/Show.tsx`, engineering log.
- Schema / migration impact: None.
- Verification performed: Static TypeScript contract review only; no compiler/build/test pass is claimed until the dedicated verification gates run.
- Known gaps / risks: Full TypeScript and production-build verification remains pending.
- Next action: Run type checking, frontend build, migrations, and the feature suite against the dedicated test environment; fix only observed gate failures before P1-M5.

## 2026-08-19 22:04 PHT — `fix: align frontend calls with Inertia v3 contracts`

- Milestone / requirement: P1-M4 verification-gate repair after observed TypeScript failures.
- Intent: Correct five observed TypeScript errors caused by legacy Inertia call patterns: explicitly type Vite page resolution for Inertia React v3, remove unsupported `preserveState` / `preserveScroll` keys from `router.reload()` calls because reload already preserves both internally, and split `useForm().transform()` from `post()` because v3 `transform()` returns void and is no longer chainable.
- Important files / modules: `resources/js/app.tsx`, `resources/js/layouts/AppLayout.tsx`, `resources/js/pages/MayorOffice.tsx`, `resources/js/pages/Transactions/Show.tsx`, `docs/ENGINEERING_LOG.md`.
- Schema / migration impact: None.
- Verification performed: User-observed pre-fix gate: `npm run types:check` reported 5 errors across 4 files; `npm run build` succeeded in 16.76s. Inertia v3 source/type contracts were inspected before the fix. Post-fix type/build/test success is not claimed until rerun output is observed.
- Known gaps / risks: The production Vite bundle already built before this fix, but TypeScript remained red; additional type errors may surface once these five are removed. Backend feature tests and migration gates are still pending in this verification pass.
- Next action: Pull this commit and rerun `npm run types:check`, `npm run build`, and `php artisan test --testsuite=Feature`; fix any remaining observed gates before starting P1-M5.
