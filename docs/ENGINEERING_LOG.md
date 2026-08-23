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


### `fix: harden privileged MFA assurance lifecycle`
- Milestone: Contract Phase 1 Identity Assurance & Privileged MFA closure hardening. This is a focused closure slice only; Integration/API Gateway work has not started.
- Assurance-generation model: additive `users.mfa_version` epoch with safe default `0`; session assurance now stores `auth.assurance.mfa_user_id`, `auth.assurance.mfa_verified_at`, and `auth.assurance.mfa_version`. `AuthenticationAssurance::isSatisfied()` reloads persisted identity state and requires MFA to remain required, enrollment to remain confirmed, and both session user ID and session MFA version to match the current persisted enrollment generation.
- Proven-factor boundary: new `App\Domain\Identity\ConfirmedMfaEnrollment` carries the exact user ID and MFA version proven inside the authoritative locked enrollment-confirmation or MFA-challenge transaction. `AuthenticationAssurance::markSatisfied()` consumes that proof instead of refreshing the user and blessing whatever version exists later, closing the factor-version race across reset/re-enrollment.
- MFA state locking: enrollment-secret creation, enrollment confirmation, successful TOTP/recovery challenge proof, recovery-code consumption, reset, and disable use row-locked database transactions. Reset and disable advance the epoch immediately; re-enrollment advances it again on confirmation, so previously assured sessions remain invalid after the new enrollment is active. No global session deletion mechanism is used.
- Sensitive Inertia handling: new `app/Services/SensitiveInertiaResponse.php` uses the supported Inertia v3 `encryptHistory()` API and sets `Cache-Control: no-store, private, no-cache, max-age=0, must-revalidate`, `Pragma: no-cache`, and `Expires: 0`. Enrollment secret/provisioning responses and recovery-code display responses use this boundary.
- Recovery-code display: plaintext recovery codes remain generated only transiently while persisted recovery material remains one-way hashed. The one-time display now uses supported Inertia v3 flash data (`Inertia::flash`) instead of ordinary persistent page props; the React recovery page reads `page.flash`. The sensitive response is history-encrypted and non-cacheable.
- Stale authenticated identity repair: enrollment confirmation, reset, disable, enrollment rendering, challenge routing, and MFA settings synchronize the authenticated `User` where state freshness matters. This closes the prior post-enrollment stale-model redirect defect.
- Schema/migration impact: new additive migration `2026_08_22_144500_add_mfa_version_to_users_table.php`; historical users migration is unchanged. `mfa_version` is cast to integer and hidden from ordinary user serialization.
- Dependency reproducibility: application-level `composer.lock` is committed from the exact `c874c97` `composer.json` dependency set. The isolated Composer resolution produced 109 locked packages and resolved `pragmarx/google2fa v9.1.0`, `paragonie/constant_time_encoding v3.1.3`, `inertiajs/inertia-laravel v3.3.1`, and `laravel/framework v13.26.1` using Composer 2.10.2 / PHP 8.4.24. This dependency-resolution evidence is not runtime proof for this closure commit.
- Historical runtime evidence retained without transfer: Core Architecture Normalization exact HEAD `63407b4bf5bc965809fb2022cb5adff45a829b1c` remains **62 passed / 374 assertions / 895.68s**. That evidence applies only to that exact commit and does not pre-verify this MFA closure.
- Failed diagnostic evidence retained without transfer: the temporary dependency probe against parent `c874c97c9b2340a5d25f1e0512f57c9bd3122de4` reached **74 passed / 459 assertions with 1 failure**. The failure was the stale authenticated `User` state after successful MFA enrollment; `/security/mfa` redirected because the in-memory user still reflected pre-confirmation MFA state. This is explicitly FAILED diagnostic evidence, not a PASS and not runtime proof for this closure commit.
- Tests changed: focused MFA Feature coverage now includes epoch/generation increments, exact enrollment proof capture, exact TOTP challenge proof capture, stale assured-session replay after reset and after re-enrollment, reset/disable invalidation, one-time recovery-code consumption/display, sensitive cache headers, encrypted Inertia history, ordinary-serialization exclusion, nonprivileged compatibility, and active-account enforcement. Shared Feature `actingAs()` compatibility now includes the current MFA version in test-only assurance state.
- Verification actually observed before commit: `php -l` PASS for all changed/new PHP production, migration, and Feature-test files; Composer JSON and lock JSON parse PASS; the staged `composer.json` Git blob exactly matches parent blob `ffbd279e1c57c070ecf213663cec3620ee26b95b`; staged `composer.lock` byte-for-byte matches the generated CI artifact and resolves the expected 109-package graph; TypeScript smoke check for the recovery-code flash page PASS; production LOC/cap review PASS; static route/middleware inspection confirms municipal routes remain ordered behind `auth -> active -> mfa.assured`, with MFA management routes additionally behind `mfa.subject`. Composer CLI is not installed in the isolated local container, so `composer validate` was not executed here. No Laravel Feature/runtime suite, migration execution, Vite production build, or exact-HEAD PowerShell closure run is claimed for this commit.
- Privileged-role policy: unchanged. `department_staff` remains an MFA subject and is explicitly left as a deployment sign-off decision before pilot.
- Remaining pre-pilot hardening debt: MFA reset/disable still require an already MFA-assured session but do not add a fresh step-up prompt immediately before the destructive MFA operation; this remains explicit debt and is not claimed implemented. Application-key rotation/loss still requires deliberate MFA-secret handling because secrets use Laravel encrypted casts.
- Scope control: the identity chain remains `Authenticate -> Active Account -> Required MFA Assurance -> Authorization -> Domain Action`. MFA assurance is not merged into Workflow Authorization Context. Integration/API Gateway, Correspondence, Documents, Legislative, Property, and HRIS are not expanded. `EmployeeLifecycleService.php` is untouched.
- Next action: run Kirch's local exact-HEAD MFA closure pipeline against the resulting commit SHA. Do not convert the milestone to runtime PASS until that exact commit is observed green.

### `test: correct MFA security regression harness`
- Scope: focused MFA test-harness correction on parent `b2d3687020ae1c14dd8950657c716692ce25db2d`; production MFA services, middleware, controllers, route ordering, epoch/version semantics, and sensitive-response behavior are intentionally unchanged.
- Parent runtime evidence supplied by Kirch: Composer install PASS; Composer validate PASS; Composer audit PASS with no advisories; npm install PASS; additive MFA-version migration PASS; `PrivilegedMfaAuthenticationTest` PASS. Parent `b2d3687` is not green because `MfaSecurityControlsTest` failed.
- Exact focused diagnostic rerun supplied by Kirch: **MfaSecurityControlsTest: 2 failed / 8 passed / 1 pending / 61 assertions**. The earlier full run exposed **3 failures / 8 passed / 62 assertions** because the recovery-code test also hit the same incomplete Inertia-request HTTP 409 condition. Both are failure evidence, not PASS evidence.
- Isolated harness diagnostic after the initial corrections: **1 failed / 10 passed / 101 assertions**. Both sensitive Inertia tests passed; the remaining failure was the harness using `/dashboard` to prove epoch-N assurance, which reached unrelated downstream domain authorization and returned 403. The baseline check was corrected to the MFA settings route so it measures authentication assurance directly without weakening production authorization.
- Harness corrections: the stale-session regression takes a deterministic epoch-N snapshot from `assuredSession($user->fresh())` instead of assuming `session()->only(...)` captured the post-challenge version key. The sensitive enrollment and recovery-code tests use normal initial Inertia responses with `assertInertia`; recovery-code flash uses the supported Inertia v3 `hasFlash()` assertion. No Inertia asset-version negotiation is bypassed or disabled.
- Verification for this corrective tree: `php -l tests/Feature/MfaSecurityControlsTest.php` PASS; `php artisan test tests/Feature/MfaSecurityControlsTest.php` PASS; `php artisan test --filter=PrivilegedMfaAuthenticationTest` PASS on the isolated focused runtime harness. The full Phase 1 suite was not run.
- Next action: after this corrective commit is pushed, Kirch may resume the exact-HEAD MFA closure pipeline. No full Phase 1 runtime PASS is claimed by this entry.

## 2026-08-23 — Exact-HEAD privileged MFA closure evidence

### Runtime evidence for `fb59f126ad63958dbb5b8d3d56182983b858dfde`
- Verified exact implementation/test HEAD: `fb59f126ad63958dbb5b8d3d56182983b858dfde`; sole parent `b2d3687020ae1c14dd8950657c716692ce25db2d`. Exact HEAD remained unchanged through the focused and full runtime gates; final worktree was clean.
- Dependency/runtime environment: committed Composer graph verified at **109 packages**; `pragmarx/google2fa v9.1.0`, `paragonie/constant_time_encoding v3.1.3`, `laravel/framework v13.26.1`, and `inertiajs/inertia-laravel v3.3.1`. `composer install` PASS; `composer validate --no-check-publish` PASS; `composer audit` PASS with **no security vulnerability advisories**.
- Database gate: additive `php artisan migrate --no-interaction` PASS with nothing pending; **`migrate:fresh` was not used** in the exact-HEAD closure run.
- Focused MFA security gate: `tests/Feature/MfaSecurityControlsTest.php` **11 passed / 109 assertions / 7.50s**.
- Focused privileged MFA authentication gate: `PrivilegedMfaAuthenticationTest` **7 passed / 50 assertions / 5.35s**.
- Frontend/runtime gate: TypeScript `tsc --noEmit` PASS; production Vite build PASS, completing in **22.37s**.
- Full exact-HEAD Feature regression: **80 passed / 533 assertions / 1147.41s**. The full verifier completed successfully on the same exact HEAD.
- Disposition: **Privileged MFA technical gate CLOSED** for the verified implementation lineage. This closes the MFA implementation/runtime gate only; it does not convert Contract Phase 1 to complete or pilot-ready.
- Remaining pre-pilot MFA hardening: fresh immediate step-up before reset/disable remains explicit debt; `department_staff` remains an MFA subject pending deployment sign-off; `APP_KEY` rotation/loss still requires a defined MFA-secret operational procedure.
- Release status remains unchanged: internal `PHASE1_CANDIDATE_OPEN_GATES`; commercial `CONTRACT_PHASE_1_OPEN_GATES`.
- Runtime/schema impact of this documentation entry: none. This docs-only evidence records verification for `fb59f126...`; it does not claim the resulting documentation commit itself was the tested runtime SHA.
- Next action: begin the Contract Phase 1 **Integration Engine / scoped API-client layer**: client identity and credential lifecycle, explicit scopes, correlation identity, request validation, rate limiting, idempotency/replay protection, audit envelope, and a safe after-commit/outbox boundary for future external publication.

## Current release state

- Internal engineering: `PHASE1_CANDIDATE_OPEN_GATES`
- Commercial architecture: `CONTRACT_PHASE_1_OPEN_GATES`

Internal release-green and commercial Contract Phase 1 completion are separate decisions.