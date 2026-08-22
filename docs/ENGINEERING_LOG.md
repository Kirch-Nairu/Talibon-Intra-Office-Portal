# Engineering Log

Authority: `SSOT_BY_KIRCH.md` + `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`

This log is mandatory for the active Talibon build. Detailed pre-consolidation records remain preserved in Git history.

Every implementation commit must record milestone/requirement, intent, important modules, schema impact, verification actually observed, known gaps/risks, and next action. A sprint may be implementation-complete while verification remains open. Never convert an unobserved gate into a PASS claim.

---

## Historical internal Build Wave A summary

### Governance / planning
- Established `SSOT_BY_KIRCH.md`, agent read order, internal build scope, mandatory engineering log, M0–M12 sequencing, acceptance gates and safe verification rules.

### P1-M0 / P1-M1 — Organization and routing
- Preserved `departments` as compatibility anchor.
- Added branch/office metadata, routability, ordering and universal routing enforcement.
- Established 33 routable nodes: 30 executive/administrative + 3 legislative.

### P1-M2 / P1-M3 — Shared platform and employee foundation
- Added persistent notifications, calendar, shared document metadata/links, employee profile, protected HR fields and 201 metadata foundation.

### P1-M4 — Onboarding / movement / property foundation
- Added blocker-driven onboarding, employment movement, basic asset accountability, HTTP authorization and lifecycle/property workspaces.
- Observed post-fix baseline: production build PASS; Feature suite PASS at **24 tests / 173 assertions**.

### P1-M5 — Leave / DTR / payroll context
- Added evidence-derived DTR, leave calendar/notification integration and locked DTR payroll context without silent monetary recalculation.
- Observed: build PASS **1.95s**; Feature suite PASS **28 tests / 191 assertions** in **359.37s**.

### P1-M6 — Performance / development / restricted health vault
- Added performance/development records, expiry monitoring and explicit purpose-bound health-vault grants.
- Observed: build PASS **2.68s**; Feature suite PASS **33 tests / 231 assertions** in **454.19s**.

### P1-M7 — Offboarding
- Added cross-office offboarding/clearance with live open-work/property blockers, financial/payroll/leave/document/biometric tasks and account deactivation.
- Full post-M7 integrated local gate deferred.

### P1-M8 — Property lifecycle
- Added maintenance, inventory, discrepancy evidence, Accounting reconciliation, disposal and append-only asset history.
- Full post-M8 integrated local gate deferred.

### Pre-M9 property bug-bounty hardening
- `124b0070`: backend inventory-reference enforcement.
- `4f32f0c0`: explicit scan/reference UI.
- `acd46810`: regression coverage.
- 2026-08-22 review note: current HTTP path validates the reference, but the domain service should also own this invariant for future non-HTTP callers.

### P1-M9 — Executive / legislative
- `59eaf83d63a3d3df72b9cb442855647fd38713bc`: completed executive municipality-wide accountability surfaces and legislative session/agenda foundation.
- `216ec7c1674571ad022061335044ec90386d6270`: fixed SB/SB-Secretary manager-permission mismatch.
- Integrated local gate deferred.

### P1-M10 — Reporting / audit
- `c3715d81f4a818283d13a8b15d1de35c497d9be9`: extended onboarding/offboarding/property/reconciliation reporting, preserved payroll export HR-only, added audit summaries/filters and authorization tests.

### P1-M11 / P1-M12 — Acceptance / freeze
- `2fac461f7c08479c8010add0c31b589ea131f01a`: integrated acceptance matrix + `docs/PHASE_1_ACCEPTANCE_CHECKLIST.md`.
- `e9f668df223c6d2aaf01130687db5356da3b2d99`: freeze/handoff tooling + `scripts/phase1-verify.ps1` + release-status doc.
- `3be3e38e3636e8fd596e7a3fe1e847fb3f6f1152`: consolidated rapid-sprint engineering log.

---

## 2026-08-22 19:36 PHT — `docs: add code review and quotation alignment`

Commit: `fe527a12083ffe5e9fc63d051f98112e8d4c48fd`

- Milestone / requirement: repository code review against the client-facing Engineering & Project Architecture Plan with Detailed Quotation.
- Intent: document that the current branch is ahead of the original commercial phase sequence in breadth but still has open Contract Phase 1 core gates.
- Important file: `docs/CODE_REVIEW_2026-08-22.md`.
- Schema / runtime impact: none; documentation-only.
- Review performed: inspected identity/auth, routes, transaction workflow/model/policy, legislative records/workspace, HR lifecycle, health-vault, property lifecycle, document model, CI, Feature-test inventory and release docs; compared them to the 22-page client architecture/quotation.
- Key findings:
  - substantial Contract Phase 2 HRIS, partial Phase 3 employee self-service and extra property/asset functionality are already present;
  - Contract Phase 1 remains open because MFA, API Gateway/scoped integration clients, full correspondence lifecycle/classification/protected attachment path, full legislative authorship/voting/certification/effectivity lifecycle, cloud benchmark/restore evidence and representative UAT are not yet complete;
  - architecture/data-integrity patterns are generally strong for an internal candidate, but pilot/security gates remain below the quoted bar;
  - CI is functional but lacks dependency-security audit/static-analysis/style gates;
  - current QR/reference validation is protected at the HTTP boundary but should also live at the domain-service boundary.
- Verification: code-review/documentation only. No runtime PASS claim.

## 2026-08-22 19:38 PHT — `docs: reconcile release status with contract phase mapping`

Commit: `81db2be3f4ade8602e17bb110435b435131bf017`

- Milestone / requirement: release-label reconciliation after quotation review.
- Intent: separate internal Build Wave A status from client-facing Contract Phase 1 status so later-phase breadth cannot be mistaken for contractual Phase 1 completion.
- Important file: `docs/PHASE_1_RELEASE_STATUS.md`.
- Schema / runtime impact: none; documentation-only.
- Verification: documentation-only; no runtime claim.

## 2026-08-22 19:41 PHT — `docs: align root SSOT with contract architecture amendment`

Commit: `7bc0be1eb7dd6c838fae4828a683342df5291e32`

- Milestone / requirement: align the root SSOT itself with the client-facing architecture/quotation rather than relying on a secondary document alone.
- Intent: redefine historical `P1-M*` wording as Internal Build Wave A, add the quotation-level correspondence and legislative completion contracts, make external integration/no-direct-DB rules explicit, add cloud benchmark/pilot-readiness requirements, preserve accelerated HR/property work, and set Contract Phase 1 closure as current engineering priority.
- Important file: `SSOT_BY_KIRCH.md`.
- Schema / runtime impact: none; documentation-only.
- Verification: documentation-only; no runtime claim.
- Process note: this root-SSOT update did not update the consolidated engineering log in the same atomic contents-API commit. The immediately following authority-integration commit records and corrects that documentation trail; runtime code was not changed.

## 2026-08-22 19:43 PHT — `docs: integrate quotation amendment and agent authority`

Commit: `ff13adf77f7d76c64b8986c5a778cee2b1ea51e6`

- Milestone / requirement: complete repository-authority integration of the client quotation and code review.
- Intent: add the commercial-phase amendment, update agent read order, and reconcile the engineering log so future agents distinguish Internal Build Wave A from commercial Contract Phase 1/2/3.
- Important files:
  - `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`;
  - `AGENTS.md`;
  - `docs/ENGINEERING_LOG.md`;
  - existing `SSOT_BY_KIRCH.md`;
  - existing `docs/CODE_REVIEW_2026-08-22.md`;
  - existing `docs/PHASE_1_RELEASE_STATUS.md`.
- Schema / runtime impact: none; documentation/governance only.
- Commercial mapping locked:
  - Contract Phase 1 — Inter-Municipality Engine Core — ₱400,000;
  - Contract Phase 2 — Comprehensive HRIS Engine — ₱250,000;
  - Contract Phase 3 — Employee Self-Service Portal — ₱100,000;
  - Development Mobilization Fee — ₱50,000 separate one-time pre-development fee;
  - original quoted grand total — ₱800,000 excluding production hosting/hardware and post-pilot support/maintenance.
- Scope interpretation:
  - historical internal `P1-M0`–`P1-M12` is **Internal Build Wave A**, not a one-to-one commercial Phase 1;
  - later-phase implementation remains preserved and useful;
  - Property & Asset Management is preserved as client-emphasized scope but is not silently represented as priced in the original ₱800,000 quotation.
- Release nomenclature:
  - internal engineering: `PHASE1_CANDIDATE_OPEN_GATES`;
  - commercial architecture: `CONTRACT_PHASE_1_OPEN_GATES`.
- Verification performed: documentation-only reconciliation. Last fully observed integrated runtime baseline remains M6 at **33 tests / 231 assertions**. M7 onward remains pending exact-HEAD local verification.
- Next action: close Contract Phase 1 in priority order: privileged MFA/login hardening -> integration/API-client layer -> correspondence completeness/protected documents -> legislative lifecycle depth -> authorization consolidation/CI security gates -> exact-HEAD local regression -> cloud benchmark/restore drill -> structured UAT/pilot sign-off.

---

## Current release state

**Internal engineering label:** `PHASE1_CANDIDATE_OPEN_GATES`  
**Commercial architecture label:** `CONTRACT_PHASE_1_OPEN_GATES`

Internal release-green and commercial Contract Phase 1 completion are separate decisions. Internal release-green requires exact-HEAD local migration/type/build/Feature evidence. Contract Phase 1 completion additionally requires the quoted identity/integration, correspondence, legislative, benchmark/recovery, security-review and UAT gates to close or be formally re-scoped.