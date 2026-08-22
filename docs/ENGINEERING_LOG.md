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
