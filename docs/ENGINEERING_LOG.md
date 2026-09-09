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

## Current release state

- Internal engineering: `PHASE1_CANDIDATE_OPEN_GATES`
- Commercial architecture: `CONTRACT_PHASE_1_OPEN_GATES`

Internal release-green and commercial Contract Phase 1 completion are separate decisions.

## 2026-09-09 — V2-QA1 dedicated visual evidence harness

### `test: add V2 visual acceptance harness`

- Current TOR requirement / slice: **V2-QA1 — dedicated visual evidence harness only** for the accepted Frontend Design V2 baseline and forward corrections on `KIRCH-TALIBON-FRONTEND-DESIGN-V2`.
- Intent: automate objective public/authenticated browser evidence without reusing historical F1-F8 presentation verdicts. The default-branch carrier is manual-only, preserves the harness outside the target checkout, hard-restricts execution to commit `74e628fc344ab1d0c15aed99bfa6da449372b205` or later commits on the current V2 branch lineage, then checks out and inspects that exact target SHA.
- Files/modules changed: new `tests/Browser/v2-visual-acceptance.mjs`; new `.github/workflows/v2-visual-acceptance.yml`; this log.
- Evidence contract: public screenshots at 1366x768, 768x1024 and 390x844; System Admin, Executive, Department Head and Employee dashboards at 1440x900 and 390x844 in Light and Dark; viewport/full-page evidence plus mobile drawer captures; workspace identity/V2 surface checks; horizontal-overflow/navigation-fit checks; public/authenticated menu behavior; page/console/application-request/5xx diagnostics; sanitized JSON and HTML reports.
- Security/data boundary: fresh synthetic PostgreSQL only. GitHub QA generates and masks a random runtime `PROTOTYPE_DEMO_PASSWORD`; no universal local demo password is embedded. MFA setup/recovery material is remembered only in-process for masking and is never intentionally written to reports or screenshots. No production/live LGU data is used.
- Verdict boundary: the automated state is limited to `AUTOMATED_CHECKS_PASS` or `AUTOMATED_CHECKS_FAIL`; every report remains `VISUAL_REVIEW_REQUIRED`. Mechanical browser success is not design GREEN, UAT, production acceptance, deployment approval or production readiness.
- Schema/migration/backend/permission/workflow/design impact: **none**. Historical Browser harnesses, F1-F8 assertions, application routes, production frontend, authorization, workflow, seed definitions and V2 source are untouched by this carrier commit.
- Verification actually observed before commit: required repository authority/scope and existing Browser/workflow machinery inspected; `node --check` PASS on the new 377-line harness; YAML structure parse PASS on the new manual workflow. Playwright runtime, GitHub Actions execution, screenshots and report verdict are **NOT OBSERVED** until the dispatcher runs on an allowed exact target.
- Known gaps/risks: `workflow_dispatch` must be invoked after this carrier commit exists on default branch `main`; artifact review remains a required human step; visual/design acceptance is intentionally not automated.
- Next action: manually dispatch this workflow against exact V2 head `74e628fc344ab1d0c15aed99bfa6da449372b205`, download one `talibon-v2-visual-*` artifact, inspect its JSON/HTML report and screenshots, then issue either V2 visual acceptance or narrowly scoped correction commits on the V2 branch.

## 2026-09-09 — V2-QA1 automatic carrier trigger

### `test: auto-trigger V2 visual acceptance`

- Current TOR requirement / slice: **V2-QA1 harness execution automation only**. No application or design scope is reopened.
- Intent: remove the one manual Actions click for this acceptance run while preserving the dedicated default-branch QA carrier. The workflow now retains `workflow_dispatch` and additionally listens only to `main` pushes that modify `.github/workflows/v2-visual-acceptance.yml`; non-dispatch executions default to `KIRCH-TALIBON-FRONTEND-DESIGN-V2` and keep the same lineage restriction before checking out the exact target SHA.
- Files/modules changed: `.github/workflows/v2-visual-acceptance.yml`; this log.
- Production/V2 impact: **none**. `KIRCH-TALIBON-FRONTEND-DESIGN-V2` remains unchanged; no historical Browser carrier is moved; no backend, frontend, route, authorization, schema, workflow, seed or production data is changed.
- Security boundary: the generated/masked random GitHub QA password mechanism is unchanged. No local universal demo credential is introduced into GitHub QA.
- Verification actually observed before commit: current `main` carrier SHA `8f3627db2fbde3856afca3a1cc6a43aa79a7a02c` and V2 target SHA `74e628fc344ab1d0c15aed99bfa6da449372b205` were rechecked; current workflow and harness source were inspected. The automatic Actions run, browser checks, screenshots and artifact are **NOT YET OBSERVED** and must not be represented as PASS until GitHub reports them.
- Known gap / next action: advancing this forward-only carrier commit on `main` is expected to trigger one path-scoped V2 visual-evidence run. Observe that exact run, inspect its jobs and sanitized artifact, then issue `AUTOMATED_CHECKS_PASS` or classify/fix the reproduced defect; visual design remains `VISUAL_REVIEW_REQUIRED` until screenshot review.
