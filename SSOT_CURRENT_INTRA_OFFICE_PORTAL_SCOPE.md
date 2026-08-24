# TALIBON INTRA-OFFICE PORTAL — CURRENT PROCUREMENT AUTHORITY

Owner / technical authority: Kirch Ivan A. Balite  
Legal / implementing entity: ALZA IT Solutions  
Project team: Team ALZA  
Technical Lead: Kirch Ivan A. Balite — System Architecture & Engineering Direction  
Client: Local Government Unit of Talibon, Bohol  
Active repository: `Kirch-Nairu/Talibon-Intra-Office-Portal`  
Active branch: `KIRCH-PHASE1-INTERNAL-OPS-HRIS`  
Effective date: 2026-08-24

## 1. Current procurement

The current immediate procurement and active development authority is:

**Municipal Digital Operations Platform — Core Intra-Office Portal**

Current formal project state:

**PRE-MOBILIZATION / WORKING PROTOTYPE PREPARATION**

The immediate engineering objective is to make the existing backend engineering usable and presentable to Department Heads for prototype evaluation and requirements validation.

This is a Portal/UI integration and prototype-readiness wave. It is not authority for another broad backend architecture expansion.

## 2. Authority relationship

This file is the controlling scope authority for active work under the present Core Intra-Office Portal procurement.

Existing historical documents remain preserved, including:

- `SSOT_BY_KIRCH.md`
- `SSOT_COMMERCIAL_PHASE_AMENDMENT.md`
- historical phase plans, code reviews, release notes and architecture records

Those documents remain valid engineering and historical evidence where they do not conflict with this current procurement scope. Where an older commercial-phase assumption would expand active development beyond the present Core Intra-Office Portal TOR, this file controls current work.

This authority does not delete, roll back or invalidate broader implementation already present in the repository.

## 3. Current active scope

Current active development maps only to the present Core Intra-Office Portal TOR, centered on:

- authenticated municipal access;
- department/office-aware authorization;
- correspondence workspace and lifecycle UI for already implemented backend states;
- inter-office transactions and routing;
- work/task queue projections from existing workflow data;
- current-scope records tracking/search;
- notifications and memoranda where they support intra-office operations;
- department and executive dashboards for current portal work;
- departments/organization data required for routing;
- audit and security visibility for authorized users;
- prototype verification and Department Head evaluation readiness.

Existing foundations must be reused, including authentication, active-account enforcement, MFA, roles/office authorization, the generic workflow engine, correspondence classification authorization, audit history, notifications, scoped integration clients, idempotency and the transactional outbox.

## 4. Preserved but parked implementation

The following existing or future areas are preserved but parked from active implementation unless Kirch Ivan A. Balite explicitly authorizes a scope change:

- HRIS;
- payroll;
- DTR;
- attendance;
- leave;
- employee self-service;
- health-vault expansion;
- Property expansion;
- Legislative expansion;
- GAD, which remains a separate initiative;
- public portal;
- eBOSS;
- biometric integration;
- Project Monitoring expansion;
- Procurement / PR lifecycle expansion;
- Budget-specific expansion;
- GIS;
- CBMS;
- unrelated integrations and future modules.

Existing parked routes, migrations, models, services, tests and historical documentation must not be deleted merely to simplify the prototype presentation.

## 5. Prototype presentation rule

Department Heads must see the system they are evaluating, not the full historical implementation breadth.

The current prototype presentation should expose current-scope surfaces such as Dashboard, My Work, Correspondence, authorized Mayor/Executive work, Memoranda, Departments and authorized Audit & Security.

Parked modules should be removed from the current prototype navigation/presentation while their underlying code remains intact.

Employees may remain reachable where operationally necessary for routing or assignment dependencies but must not be presented as an active HRIS expansion.

## 6. Correspondence boundary for this prototype wave

The repository already implements the correspondence backend through:

`RECEIVE -> REGISTER -> CLASSIFY -> ROUTE -> IN_ACTION`

The immediate task is to expose and integrate those existing capabilities for authenticated municipal users.

Do not start new correspondence terminal semantics, RELEASE, ARCHIVE, attachment storage, document versioning or retention/destruction during the Department Head prototype-preparation wave.

Those items require requirements validation first.

## 7. Pre-mobilization and completion language

Existing pre-mobilization implementation is engineering progress and prototype evidence. It is not contractual completion, production acceptance, UAT sign-off or final deployment.

No existing module is automatically complete merely because code, schema, tests or a screen exists.

The correct current client-facing posture is:

**working prototype ready for evaluation and requirements validation**

once the Department Head prototype freeze gate has actually been passed.

## 8. Required project sequence

The governing sequence is:

1. working prototype preparation;
2. Department Head prototype evaluation;
3. consolidated client feedback;
4. confirmed implementation baseline;
5. formal implementation of the validated baseline;
6. UAT;
7. production deployment;
8. orientation and turnover.

Department Head prototype evaluation therefore precedes the final implementation baseline.

Do not encode unresolved assumptions prematurely merely to make the system appear broader.

## 9. Engineering invariants

Maintain the modular monolith.

Do not introduce:

- microservices;
- a new workflow engine;
- a new Task engine;
- a new notification architecture;
- Kafka or RabbitMQ;
- a giant generic records framework;
- business rules in React;
- frontend role-name authorization.

Keep PostgreSQL authoritative, reuse existing services/domain boundaries, keep server-side authorization authoritative, preserve append-only/auditable workflow evidence and keep sensitive/classified data from leaking through list counts, search, filters, pagination or page props.

`TransactionWorkflowService` is already in the repository review band and must not be expanded casually. New substantial query/read-model logic should use focused query/application services rather than controller bloat.

## 10. Verification and honesty

Every implementation commit must update `docs/ENGINEERING_LOG.md` in the same commit.

Only tests and verification actually observed may be recorded as PASS.

The integrated Department Head prototype freeze occurs only after the approved prototype slices are complete and the intended regression/build/browser checks are actually run.

After Department Head presentation, feature development does not continue automatically. Consolidated feedback must first be classified as defect, in-scope configuration, in-scope functional requirement or material scope expansion before the next implementation authority is issued.
