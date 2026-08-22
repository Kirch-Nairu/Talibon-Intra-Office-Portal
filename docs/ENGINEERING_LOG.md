# Engineering Log

Authority: `SSOT_BY_KIRCH.md` + `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`

This consolidated log is mandatory for the active Talibon build. Detailed pre-consolidation entries remain preserved in Git history. Every future implementation commit must record requirement, intent, important modules, schema impact, verification actually observed, known gaps/risks, and next action. Never convert an unobserved gate into a PASS claim.

---

## Historical Internal Build Wave A

- **M0-M1:** organization/routing compatibility model; 33 routable nodes (30 executive/administrative + 3 legislative); branch-aware universal routing.
- **M2-M3:** persistent notifications, shared calendar/document metadata, employee master/profile, protected HR fields, 201 metadata foundation.
- **M4:** blocker-driven onboarding, movement, basic property accountability and HTTP authorization. Observed post-fix baseline: build PASS; Feature suite **24 tests / 173 assertions**.
- **M5:** evidence-derived DTR, leave calendar/notification integration, payroll-context linkage. Observed: build PASS **1.95s**; Feature suite **28 tests / 191 assertions** in **359.37s**.
- **M6:** performance/development, expiry monitoring, explicit health-vault access grants. Observed: build PASS **2.68s**; Feature suite **33 tests / 231 assertions** in **454.19s**.
- **M7:** offboarding/clearance with live work/property blockers and account deactivation. Post-M7 integrated gate deferred.
- **M8:** maintenance, inventory, discrepancy, Accounting reconciliation and disposal. Post-M8 integrated gate deferred.
- **Pre-M9 bug bounty:** `124b0070`, `4f32f0c0`, `acd46810` hardened property reference verification. Review note: the HTTP route validates the reference; the domain service should also own this invariant for future non-HTTP callers.
- **M9:** `59eaf83d63a3d3df72b9cb442855647fd38713bc` completed executive/legislative workspace foundations; `216ec7c1674571ad022061335044ec90386d6270` fixed legislative manager permission mismatch.
- **M10:** `c3715d81f4a818283d13a8b15d1de35c497d9be9` hardened reporting/audit/authorization evidence.
- **M11-M12:** `2fac461f7c08479c8010add0c31b589ea131f01a` added integrated acceptance coverage; `e9f668df223c6d2aaf01130687db5356da3b2d99` added freeze/local verification handoff; `3be3e38e3636e8fd596e7a3fe1e847fb3f6f1152` consolidated the rapid-sprint history.

---

## 2026-08-22 quotation / architecture reconciliation

### `fe527a12083ffe5e9fc63d051f98112e8d4c48fd` — `docs: add code review and quotation alignment`
- Requirement: compare the current repository to the uploaded client-facing **Municipal Digital Operations Platform — Engineering & Project Architecture Plan with Detailed Quotation**.
- File: `docs/CODE_REVIEW_2026-08-22.md`.
- Review scope: auth/identity, routes, transaction model/policy/service, legislative records/workspace, HR lifecycle/health, property lifecycle, shared document model, CI, Feature-test inventory and release docs.
- Finding: implementation is ahead of the quotation in breadth (substantial Contract Phase 2 HRIS, partial Phase 3 self-service, extra property scope), but Contract Phase 1 remains open on MFA, integration/API clients, full correspondence, full legislative, cloud benchmark/restore and UAT evidence.
- Runtime/schema impact: none. Verification: documentation/code-review only.

### `81db2be3f4ade8602e17bb110435b435131bf017` — `docs: reconcile release status with contract phase mapping`
- Requirement: separate Internal Build Wave A status from client-facing Contract Phase 1 status.
- File: `docs/PHASE_1_RELEASE_STATUS.md`.
- Runtime/schema impact: none. Verification: documentation-only.

### `7bc0be1eb7dd6c838fae4828a683342df5291e32` — `docs: align root SSOT with contract architecture amendment`
- Requirement: make the quotation-level completion contract visible in the root SSOT.
- File: `SSOT_BY_KIRCH.md`.
- Result: historical `P1-M*` is explicitly Internal Build Wave A; quotation-level correspondence/legislative/security/integration/cloud benchmark gates are part of the root authority.
- Runtime/schema impact: none. Verification: documentation-only.
- Process note: this contents-API documentation commit did not atomically update this consolidated log; the subsequent documentation-only audit commits remediate that trail. No runtime code changed.

### `87b0850c52861a180c3f88b7a6222f4ad202becb` — `docs: finalize quotation alignment audit trail`
- Requirement: record the root-SSOT reconciliation in the engineering log.
- File: `docs/ENGINEERING_LOG.md`.
- Runtime/schema impact: none. Verification: documentation-only.

### `0c0cb94f57f5bd3ad6766830d991db4f71c3a01d` — `docs: update agent read order for quotation authority`
- Requirement: ensure future coding agents consult the quotation/code-review authority before continuing development.
- File: `AGENTS.md`.
- Runtime/schema impact: none. Verification: documentation-only.

### `2360c727ce75e15a3d40ed9b186cb4333438f66a` — `docs: integrate commercial quotation amendment`
- Requirement: finish repository-authority integration of the client quotation.
- Files: `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`, `docs/ENGINEERING_LOG.md` plus already-updated `SSOT_BY_KIRCH.md`, `AGENTS.md`, `docs/CODE_REVIEW_2026-08-22.md`, and `docs/PHASE_1_RELEASE_STATUS.md`.
- Commercial mapping locked:
  - Contract Phase 1 — Inter-Municipality Engine Core — **₱400,000**;
  - Contract Phase 2 — Comprehensive HRIS Engine — **₱250,000**;
  - Contract Phase 3 — Employee Self-Service Portal — **₱100,000**;
  - Development Mobilization Fee — **₱50,000**, separate one-time pre-development fee;
  - original quoted grand total — **₱800,000**, excluding production hosting/hardware and post-pilot support/maintenance.
- Scope rule: historical internal `P1-M0`–`P1-M12` = **Internal Build Wave A**, not a one-to-one commercial Contract Phase 1. Property & Asset Management is preserved as client-emphasized scope but is not silently represented as priced in the original ₱800,000 quotation.
- Release nomenclature: internal `PHASE1_CANDIDATE_OPEN_GATES`; commercial `CONTRACT_PHASE_1_OPEN_GATES`.
- Runtime/schema impact: none; documentation/governance only.
- Verification: documentation-only. Last fully observed integrated runtime baseline remains M6 at **33 tests / 231 assertions**. M7 onward still awaits exact-HEAD local verification.
- Next action: Contract Phase 1 closure stream — privileged MFA/login hardening -> integration/API-client layer -> correspondence completeness/protected documents -> legislative lifecycle depth -> authorization consolidation/CI security gates -> exact-HEAD local regression -> cloud benchmark/restore drill -> structured UAT/pilot sign-off.

---

## Current release state

**Internal engineering label:** `PHASE1_CANDIDATE_OPEN_GATES`  
**Commercial architecture label:** `CONTRACT_PHASE_1_OPEN_GATES`

Internal release-green and commercial Contract Phase 1 completion are separate decisions. Internal release-green requires exact-HEAD local migration/type/build/Feature evidence. Contract Phase 1 completion additionally requires the quoted identity/integration, correspondence, legislative, benchmark/recovery, security-review and UAT gates to close or be formally re-scoped.