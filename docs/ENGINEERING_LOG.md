# Engineering Log

Authority: `SSOT_BY_KIRCH.md` + `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`

This consolidated log is mandatory for the active Talibon build. Detailed earlier entries remain preserved in Git history. Every implementation commit must record requirement, intent, important modules, schema impact, verification actually observed, known gaps/risks, and next action. Never convert an unobserved gate into a PASS claim.

## Historical Internal Build Wave A

- M0-M1: organization/routing compatibility model; 33 routable nodes; branch-aware universal routing.
- M2-M3: persistent notifications, shared calendar/document metadata, employee profile/201 foundation.
- M4: onboarding, movement, basic property accountability. Observed baseline after fixes: build PASS; Feature suite 24 tests / 173 assertions.
- M5: DTR/leave/payroll context. Observed: build PASS 1.95s; Feature suite 28 tests / 191 assertions.
- M6: performance/development/restricted health vault. Observed: build PASS 2.68s; Feature suite 33 tests / 231 assertions.
- M7: offboarding/clearance implemented; exact post-M7 integrated gate deferred.
- M8: maintenance/inventory/reconciliation/disposal implemented; exact post-M8 integrated gate deferred.
- Pre-M9 bug bounty: `124b0070`, `4f32f0c0`, `acd46810` hardened property-reference verification.
- M9: `59eaf83d63a3d3df72b9cb442855647fd38713bc` executive/legislative workspace completion; `216ec7c1674571ad022061335044ec90386d6270` legislative permission repair.
- M10: `c3715d81f4a818283d13a8b15d1de35c497d9be9` reporting/audit/authorization hardening.
- M11-M12: `2fac461f7c08479c8010add0c31b589ea131f01a` acceptance matrix; `e9f668df223c6d2aaf01130687db5356da3b2d99` freeze/local verification handoff; `3be3e38e3636e8fd596e7a3fe1e847fb3f6f1152` consolidated rapid-sprint history.

## 2026-08-22 — Quotation / architecture reconciliation

### `fe527a12083ffe5e9fc63d051f98112e8d4c48fd` — `docs: add code review and quotation alignment`
- Compared auth/identity, routes, workflow model/policy/service, legislative, HR/health, property, documents, CI, tests and release docs to the uploaded 22-page architecture/quotation.
- Added `docs/CODE_REVIEW_2026-08-22.md`.
- Finding: codebase is ahead of the quotation in breadth, but Contract Phase 1 still has open MFA, integration/API, full correspondence, full legislative, benchmark/restore and UAT gates.
- Runtime/schema impact: none. Verification: documentation/code-review only.

### `81db2be3f4ade8602e17bb110435b435131bf017` — `docs: reconcile release status with contract phase mapping`
- Added separate internal vs commercial release labels in `docs/PHASE_1_RELEASE_STATUS.md`.
- Runtime/schema impact: none.

### `7bc0be1eb7dd6c838fae4828a683342df5291e32` — `docs: align root SSOT with contract architecture amendment`
- Updated `SSOT_BY_KIRCH.md` so historical `P1-M*` means Internal Build Wave A and the quotation-level correspondence, legislative, integration, security and cloud benchmark gates control commercial Phase 1 completion.
- Runtime/schema impact: none.
- Documentation-process note: this contents-API commit did not atomically update the consolidated log; subsequent documentation-only commits remediate the audit trail. No runtime code changed.

### `87b0850c52861a180c3f88b7a6222f4ad202becb` — `docs: finalize quotation alignment audit trail`
- Reconciled the engineering-log history. Runtime/schema impact: none.

### `0c0cb94f57f5bd3ad6766830d991db4f71c3a01d` — `docs: update agent read order for quotation authority`
- Updated `AGENTS.md` so future agents must read the commercial-phase/code-review authority before continuing development.
- Runtime/schema impact: none.

### `e39da11e53b9812be84d62856bb62af6a4ba3267` — `docs: record final quotation amendment commit`
- Corrected the consolidated audit trail before the actual amendment file was attached to the branch.
- Runtime/schema impact: none.
- Process note: the actual amendment file and this corrected consolidated log are committed together in the next repository-authority commit.

### `docs: integrate commercial quotation authority`
- Adds `SSOT_COMMERCIAL_PHASE_AMENDMENT.md` and the corrected `docs/ENGINEERING_LOG.md` to the active branch.
- Commercial mapping locked from the uploaded quotation:
  - Contract Phase 1 — Inter-Municipality Engine Core — ₱400,000;
  - Contract Phase 2 — Comprehensive HRIS Engine — ₱250,000;
  - Contract Phase 3 — Employee Self-Service Portal — ₱100,000;
  - Development Mobilization Fee — ₱50,000 separate one-time pre-development fee;
  - original quoted grand total — ₱800,000 excluding production hosting/hardware and post-pilot support/maintenance.
- Historical internal `P1-M0`–`P1-M12` is now **Internal Build Wave A**, not a one-to-one Contract Phase 1.
- Property & Asset Management is preserved as client-emphasized implementation, but is not silently represented as priced in the original ₱800,000 quotation.
- Runtime/schema impact: none; documentation/governance only.
- Verification: documentation-only. Last fully observed integrated runtime baseline remains M6 at 33 tests / 231 assertions; M7 onward still awaits exact-HEAD local verification.
- Next action: Contract Phase 1 closure — privileged MFA/login hardening -> scoped integration/API layer -> full correspondence/protected documents -> legislative lifecycle depth -> authorization/CI security hardening -> exact-HEAD regression -> cloud benchmark/restore -> structured UAT/pilot sign-off.

## 2026-08-22 — Core architecture normalization

### `refactor: introduce workflow definition normalization`
- Milestone: Core Architecture Normalization / Contract Phase 1 closure prerequisite.
- Intent: preserve the existing municipal transaction behavior while extracting workflow vocabulary, transition destinations, terminal-state knowledge, executive-office routing aliases, and SLA defaults out of controller/service conditionals into reusable workflow definitions/resolvers.
- Major files/modules: new `app/Domain/Workflow/*` definition, transition-rule, destination, and SLA resolvers; new `config/workflow.php`; `TransactionWorkflowService` refactored as the compatibility orchestration boundary; `TransactionController` now consumes definition-owned action/terminal-state vocabulary; new focused normalization tests.
- Schema/migration impact: none.
- Verification actually observed before commit: `php -l` PASS for every changed/new PHP file in the isolated execution environment. Full Laravel dependency-backed tests/build were not run locally because the execution container could not resolve GitHub to clone/install the repository; GitHub Actions remains the intended dependency-backed verification path for this commit.
- Known gaps/risks: this is a strangler-style compatibility slice, not the final Workflow/Authorization/Correspondence Engine. Existing authorization branching remains fragmented; correspondence still lacks RECEIVE/REGISTER/CLASSIFY/RELEASE/ARCHIVE depth; notifications remain synchronous; no commercial completion claim is made.
- Next action: observe CI for the exact commit, repair any regression if present, then continue architecture normalization toward authorization context/domain events before expanding the correspondence lifecycle.

### `refactor: establish workflow authorization and domain-event boundaries`
- Milestone: Core Architecture Normalization / reusable authorization context and transaction domain-event boundaries.
- Intent: preserve current transaction permissions and workflow mutation semantics while moving material policy decisions into typed context/capability objects and moving workflow audit/notification/calendar reactions behind internal typed domain events.
- Major files/modules: new `app/Domain/Authorization/*`; new `app/Domain/Workflow/Authorization/*`; new typed workflow events/listeners under `app/Domain/Workflow`; `TransactionPolicy` reduced to policy delegation; `TransactionWorkflowService` retains authoritative transactions/row locks and emits internal synchronous events after state/event persistence; `CalendarService` now consumes workflow terminal-state definitions; duplicate legislative route registration removed from `AppServiceProvider`; source-size/complexity rules added to `AGENTS.md`; focused authorization/event/route tests added.
- Event safety: workflow events are internal synchronous domain boundaries only. Their current listeners perform database-backed audit/notification/calendar reactions inside the same authoritative `DB::transaction`, preserving rollback behavior. No queue, broadcast, webhook, integration publication, or other external side effect is introduced before commit; any future external publication must use an explicit after-commit/outbox boundary.
- Schema/migration impact: none. `config/workflow.php` remains the compatibility/bootstrap definition and was not converted into a persisted generic rules platform.
- Verification actually observed before commit: `php -l` PASS for every changed/new PHP production and test file staged for this milestone; static LOC/cap review PASS for all new production files; static route cleanup inspection confirms `AppServiceProvider` no longer registers routes and `routes/web.php` remains the legislative route authority. Full Laravel Feature tests, TypeScript, Vite build, migrations/seed, and GitHub Actions were not observed in the isolated execution environment and are not claimed green.
- Compatibility/risk note: authorization behavior intentionally matches the pre-refactor role/office matrix. Delegation and classification are represented in context but are not yet granted/enforced because no authoritative delegation/classification model exists. Domain events are deliberately not queued. `EmployeeLifecycleService.php` remains an existing approximately 519-LOC service above the new default ceiling; this milestone does not touch or enlarge it, and safe strangler decomposition is the next mandatory source-size refactor debt before adding material HR lifecycle breadth.
- Remaining architecture risks: correspondence still lacks quoted RECEIVE/REGISTER/CLASSIFY/RELEASE/ARCHIVE depth and classification enforcement; authorization context is currently transaction-specific at the decision layer; notification fan-out remains synchronous; exact-HEAD Laravel regression/CI evidence remains open.
- Next action: run/observe exact-HEAD Laravel regression and CI. If green or repaired, the workflow/authorization architecture is coherent enough to begin privileged MFA without first expanding correspondence breadth; EmployeeLifecycleService decomposition remains mandatory parallel refactor debt.

### Exact-HEAD regression evidence for `63407b4bf5bc965809fb2022cb5adff45a829b1c`
- Local Laravel Feature regression evidence supplied and observed by Kirch for the exact Core Architecture Normalization HEAD: **62 passed / 374 assertions / 895.68s**.
- Core Architecture Normalization Laravel regression gate: **PASS**.
- This evidence applies to `63407b4bf5bc965809fb2022cb5adff45a829b1c` only and does not pre-verify later implementation commits.

## 2026-08-22 — Identity assurance / privileged MFA

### `feat: add privileged MFA identity assurance`
- Milestone: Contract Phase 1 Identity Assurance & Privileged MFA.
- Intent: establish a dedicated authentication-assurance boundary before existing authorization/domain actions, with the protected request chain `Authenticate -> Active Account -> Required MFA Assurance -> Authorization -> Domain Action`.
- Privileged-role policy: centralized in `app/Domain/Identity/PrivilegedRolePolicy.php` and `config/identity.php`; workflow/domain authorization capabilities remain unchanged and separate from authentication assurance.
- MFA implementation: `pragmarx/google2fa:^9.1` is the maintained TOTP implementation; application code does not implement TOTP cryptography. Privileged users without confirmed MFA are restricted to enrollment/confirmation/logout; configured privileged users must complete TOTP or one-time recovery-code challenge before municipal application routes.
- Persistence/security: additive migration `2026_08_22_130000_add_mfa_fields_to_users_table.php`; TOTP secrets use Laravel's encrypted Eloquent cast; recovery codes are stored only as one-way hashes; recovery-code display payloads are encrypted before temporary session storage; MFA material is hidden from normal model serialization.
- Session/account enforcement: new `RequireActiveAccount` middleware terminates and invalidates sessions for deactivated accounts and regenerates CSRF state; `RequireMfaSubject` keeps MFA management/enrollment routes scoped to centrally defined privileged identities; `RequireMfaAssurance` enforces privileged assurance after authentication/active-account checks. Inertia application notifications/office metadata are suppressed until required assurance is satisfied.
- Authentication controls: password-login and MFA challenge rate limiting use Laravel `RateLimiter`; failed/inactive password authentication shares generic outward error behavior; password-authenticated privileged sessions regenerate session IDs before entering restricted MFA state, and successful MFA/enrollment regenerates session IDs again before assurance is marked satisfied.
- Audit evidence: `AuditLogger` now accepts nullable actors for pre-auth/anonymous events. MFA enrollment, confirmation failure/success, challenge failure/success, recovery-code consumption/regeneration, reset/disable, assurance success/denial, login failures/rate limiting, and forced deactivation logout are recorded without fake system users or secret material in summaries.
- Test compatibility: the shared Feature `TestCase::actingAs()` helper now supplies test-only MFA enrollment/assurance for privileged identities so pre-existing domain Feature tests continue to model a fully authenticated application request. Dedicated MFA tests use HTTP login or the guard directly when they require password-only/unassured state; runtime middleware is not bypassed.
- Tooling hardening: `scripts/phase1-verify.ps1` now checks `$LASTEXITCODE` immediately after every native Git/PHP/npm command and throws on nonzero status, so the completion banner cannot print after a failed branch/HEAD/status check, migration, TypeScript check, build, or Feature suite.
- Schema/migration impact: additive nullable MFA columns on `users`; original users migration remains untouched. No HR/property/workflow/correspondence/legislative schema expansion.
- Verification actually observed for this implementation before commit: `php -l` PASS for every changed/new staged PHP production and Feature-test file; `composer.json` JSON parse PASS with `pragmarx/google2fa:^9.1`; static LOC/cap review PASS for all new production files and modified identity controllers/services/middleware; static route inspection confirms municipal routes are behind `auth`, `active`, then `mfa.assured`; static verification-script inspection confirms explicit native exit-code guards. PowerShell, Composer/vendor dependencies, Node modules, PostgreSQL migrations, TypeScript, Vite build, and Laravel Feature tests for this new implementation were not executable/observed in the isolated staging container and are not claimed green.
- Known gaps/risks: the new focused MFA Feature tests are authored but not yet runtime-observed on this exact implementation commit; repository convention currently has no `composer.lock`, so dependency resolution is not lock-pinned; the enrollment UI uses the standard `otpauth://` provisioning URI plus manual secret rather than rendering a QR image; rotation/loss of `APP_KEY` requires deliberate handling because stored MFA secrets are encrypted with the application key; reset/disable operations rely on an already MFA-assured authenticated session rather than an additional step-up prompt. `HandleInertiaRequests::share()` remains a pre-existing oversized-method refactor signal despite the middleware file staying under its 200-LOC hard cap.
- Scope control: Workflow Authorization Context is preserved unchanged; Correspondence, API Gateway, Documents, Legislative, Property, and HR lifecycle scope are not expanded. `EmployeeLifecycleService.php` is not touched or increased and remains mandatory strangler-refactor debt.
- Next action: run the focused identity-assurance Feature tests and then the normal exact-HEAD verification chain on the new commit. Privileged MFA should not be called technically closed until those implementation-specific runtime checks are observed.

### Temporary lockfile-generation branch evidence
- Tooling-only branch intent: use the existing pull-request CI dependency environment to generate the first reproducible `composer.lock` for the application without modifying the active implementation branch.
- Scope: temporary `composer.json` post-install/post-update script prints a gzip/base64 representation of the generated lockfile to CI logs; no application runtime behavior or production branch state is changed by this temporary commit.
- Verification: temporary branch only; this entry is not intended for merge into the active branch.

## Current release state

- Internal engineering: `PHASE1_CANDIDATE_OPEN_GATES`
- Commercial architecture: `CONTRACT_PHASE_1_OPEN_GATES`

Internal release-green and commercial Contract Phase 1 completion are separate decisions.
