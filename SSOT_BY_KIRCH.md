# TALIBON INTERNAL MUNICIPAL PLATFORM — SINGLE SOURCE OF TRUTH

Owner: Kirch Ivan Balite  
Role: Lead of Technology and Backend Systems Engineer  
Organization: Kirjane Labs  
Client: Local Government Unit of Talibon, Bohol  
Status: ACTIVE / BUILD AUTHORITY  
Branch: `KIRCH-PHASE1-INTERNAL-OPS-HRIS`  
Phase 1 hard target: **2026-08-21 12:00 PHT (UTC+08:00)**

---

## 0. Authority and read order

This file is the canonical product and engineering reference for the Talibon codebase.

Every human developer and coding agent MUST read this file before planning, editing, migrating, testing, reviewing, or committing code.

If another repository document conflicts with this file, this file controls unless Kirch Ivan Balite explicitly updates or supersedes it.

Required read order:

1. `SSOT_BY_KIRCH.md`
2. `AGENTS.md`
3. `docs/PHASE_1_PLAN.md`
4. relevant module documentation
5. `docs/ENGINEERING_LOG.md`

Prototype documents remain historical evidence only. They are not allowed to silently narrow or override the Phase 1 scope defined here.

---

## 1. Project state

Talibon is now treated as a major Kirjane Labs client.

The project is moving from prototype demonstration into active Phase 1 build execution.

Existing prototype baseline:

- Laravel 13
- PHP 8.3+
- Inertia + React 19 + TypeScript
- Tailwind CSS
- PostgreSQL
- modular monolith
- existing authentication, department identity, routing, Mayor queue, memoranda, legislative repository, leave prototype, attendance simulation, payroll prototype, reports, audit evidence, and synthetic 350-employee demo population

The prototype is an implementation baseline, not the Phase 1 product definition.

No agent may claim a module is production-complete only because a prototype screen exists.

---

## 2. Phase 1 product boundary

Phase 1 is the **internal municipal operating platform**.

The following are IN SCOPE:

1. Identity and access control
2. Municipal organization / office directory
3. Office workspaces for all routing nodes
4. Inter-office transaction and document routing
5. Records and document management foundation
6. Executive / Mayor workspace
7. Legislative workspace
8. Full packaged HRIS foundation
9. Employee onboarding
10. Employee employment lifecycle and movement
11. Employee offboarding and clearance
12. Employee master profile / 201 record foundation
13. Leave / CTO / overtime / travel workflow foundation
14. Attendance / DTR / biometric integration boundary
15. Payroll administration foundation
16. Benefits / deductions / contribution tracking foundation
17. Performance / training / competency / eligibility records
18. Restricted employee health / medical vault
19. LGU property and asset tracking
20. Calendar and municipal events
21. Notification engine, real-time alerts, popups, acknowledgement, and escalation
22. Reports and management monitoring
23. Audit and security controls
24. Cloud benchmark readiness for the internal platform when infrastructure credentials are available

The following are explicitly DEFERRED from Phase 1:

- public citizen portal
- `talibon.gov.ph` resident registration integration
- public citizen identity registry rollout
- public payment ecosystem
- eBOSS / MultiSYS takeover or migration
- public GAD-SDD rollout
- barangay encoder rollout
- RHU clinical / patient medical records system
- public project dashboard
- full external website rebuild

Deferred does not mean rejected. These are later phases and must be designed so Phase 1 does not block them.

---

## 3. Core product principle

Phase 1 must behave as **one municipal operating platform**, not a collection of unrelated CRUD modules.

Shared platform primitives must be reused across modules:

- identity
- organization
- employee
- office
- workflow
- assignment
- document
- property
- calendar
- notification
- audit

Cross-module actions must propagate where required.

Example — employee transfer:

`HR movement -> office membership -> permissions -> open-work reassignment -> property review -> calendar access -> supervisor notification -> audit event`

Example — offboarding:

`HR separation -> clearance -> open-work reassignment -> property return -> payroll finalization -> access revocation -> record archival -> audit event`

---

## 4. Canonical organization model

Do not reduce the organization to only `employee.department_id`.

Required hierarchy concepts:

- Municipality
- Branch
- Office
- Unit / Section
- Position
- Employee
- Reporting relationship
- Acting / delegated assignment

Primary branches:

- Executive / Administrative
- Legislative

The initial Phase 1 routing baseline is approximately **33 internal routing nodes**, subject to M0 validation against Talibon's current organizational chart and actual office practice.

### 4.1 Executive / administrative routing nodes

1. Office of the Municipal Mayor
2. Office of the Municipal Administrator
3. Municipal Planning and Development Office / MPDC
4. Municipal Engineering Office
5. Municipal Assessor's Office
6. Municipal Budget Office
7. Internal Audit
8. Municipal Accounting Office
9. Municipal Treasurer's Office
10. Municipal Agriculture Office
11. Municipal Health Office — organizational routing only; RHU clinical system is separate
12. Municipal Social Welfare and Development Office
13. Municipal Civil Registrar / LCR — normalize duplicate directory naming during discovery
14. Municipal General Services Office
15. Human Resource Management Office
16. Municipal Disaster Risk Reduction and Management Office
17. Municipal Market
18. Public Employment Service Office
19. Municipal Environment and Natural Resources Office
20. Talibon Integrated Transport Terminal
21. Municipal Tourism Office
22. Talibon Polytechnic College — connected institutional routing node; deeper school system remains separate
23. Municipal Information Office
24. Population Office
25. Local Economic Development and Investment Promotion Office
26. Data Protection Office
27. Zoning Administration
28. Bids and Awards Committee
29. Business Permit and Licensing / BPLS
30. Community Tax Certificate / CTC function

### 4.2 Legislative routing nodes

31. Office of the Municipal Vice Mayor
32. Sangguniang Bayan Office
33. Office of the Secretary to the Sangguniang Bayan

External agency focal roles are not automatically municipal departments.

M0 must confirm aliases, merged offices, sub-units, acting heads, and any additional routing nodes before the organization model is declared authoritative.

---

## 5. Office workspace contract

Every routable office receives a workspace backed by the same shared platform services.

Minimum office workspace capabilities:

- Overview
- Incoming
- Outgoing
- For Action
- Overdue
- Assigned to Me
- Office Employees
- Documents
- Office Calendar
- Office Property
- Reports

Office-specific modules may extend this workspace but must not fork the core routing, notification, document, employee, or audit logic.

---

## 6. Routing engine

Routing is the central nervous system of Phase 1.

A transaction must support at least:

- reference number
- category / type
- subject
- priority
- confidentiality / classification
- origin office
- current office
- assigned employee
- required action
- supporting documents
- received timestamp
- due timestamp
- status
- complete append-only event history

Required action capabilities, subject to policy and authorization:

- receive
- acknowledge
- assign
- reassign
- review
- return
- request information
- forward
- recommend
- approve
- disapprove
- close
- reopen
- escalate

Authorization must consider more than role:

`role + office + assignment + transaction type + workflow state + delegation`

Routing must be configurable. Do not hardcode one Engineering -> Budget -> Mayor path as the municipal workflow model.

---

## 7. Executive / Mayor workspace

The Mayor experience is an executive control surface, not a normal employee dashboard.

Required concepts:

- Needs Decision
- Urgent
- Overdue Across LGU
- Returned / Unresolved
- High priority
- municipality-wide active workload
- office bottlenecks
- office accountability
- decision queue
- executive actions only where appropriate

The executive dashboard should optimize for: **What requires executive attention now?**

---

## 8. Legislative workspace

The legislative branch is a functional workspace, not only a repository.

Required foundation:

- Vice Mayor workspace
- Sangguniang Bayan workspace
- SB Secretary workspace
- sessions
- calendar
- agenda
- attendance
- committee referrals
- draft measures
- ordinances
- resolutions
- executive communications
- supporting documents
- action / publication state
- archive

Cross-branch routing must preserve one auditable history.

---

## 9. HRIS product definition

Phase 1 HRIS is a packaged employee lifecycle system.

It begins before an employee becomes active and ends after separation clearance.

Canonical lifecycle:

`Pre-employment -> Onboarding -> Active Employment -> Movement / Development -> Separation -> Offboarding -> Archived Employment Record`

Required HRIS domains:

- Employee Master
- 201 File foundation
- Position / Plantilla foundation
- Appointment
- Onboarding
- Employment Movement
- Promotion
- Transfer
- Contract Monitoring
- Leave
- CTO
- Overtime
- Travel Orders
- Attendance
- Biometrics integration boundary
- DTR
- Payroll
- Benefits
- Deductions / Contributions
- Performance
- Training
- Competency / Eligibility
- Restricted Medical / Health Vault
- Service Record
- Certifications
- Retirement / Separation
- Offboarding

Prototype payroll and attendance values remain synthetic until production rules and hardware are validated.

---

## 10. Onboarding contract

Onboarding must coordinate multiple modules.

Minimum workflow:

1. HR creates / validates employment appointment
2. create employee record
3. generate / record employee number
4. assign office / unit / position / supervisor
5. create portal identity
6. assign roles
7. initialize leave / HR accounts
8. create biometric enrollment task
9. initialize payroll setup
10. request property issuance when applicable
11. track required documents
12. track orientation / policy acknowledgement
13. record authorized occupational-health requirements
14. mark onboarding complete only when required tasks pass

Onboarding must expose incomplete blockers instead of silently activating an incomplete employee record.

---

## 11. Offboarding contract

Offboarding is a clearance workflow, not `employee.active = false`.

Minimum checks:

- department clearance
- open transaction reassignment
- document / records handover
- GSO property return
- financial / payroll clearance
- leave finalization
- biometric access disablement
- portal role revocation
- scheduled account deactivation
- final service / employment record archival

Offboarding cannot be finalized while required blockers remain unresolved.

---

## 12. Employee profile

The employee profile is a shared authoritative internal view assembled from governed domains.

Expected sections:

- identity / contact
- employment
- office / position / supervisor
- government identifiers under protected access
- emergency contacts
- leave
- attendance / DTR
- payroll
- performance
- training / competency
- service record
- documents / 201 file
- assigned property
- active workflow assignments
- restricted health section

Never expose all profile sections to all roles.

---

## 13. Employee health / medical vault

Phase 1 may contain employment-relevant medical / occupational-health records, but this is NOT the RHU patient system.

Potential record classes:

- blood type
- emergency medical contact
- medical certificate
- fit-to-work / fitness status
- occupational-health examination
- authorized accommodation / restriction
- vaccination record where formally required
- health-related leave attachment
- medical clearance history

Security rules:

- highly restricted access
- explicit authorization
- access logging
- normal department heads do not receive clinical detail
- normal system administration does not automatically grant medical-content access
- RHU clinical consultation and patient histories remain outside HRIS

---

## 14. LGU Property & Asset Management

Property is a first-class Phase 1 domain and primarily supports GSO accountability with Accounting reconciliation and office/employee visibility.

Required foundation:

- property / asset master
- property number
- QR / barcode capability
- category / description / serial number
- acquisition data
- acquisition cost / funding source
- supplier / warranty
- current office
- physical location
- accountable employee
- PAR / ICS reference foundation
- condition
- transfer
- return
- repair / maintenance
- inventory count
- discrepancy / missing-item workflow
- disposal lifecycle foundation
- supporting documents
- audit history
- GSO <-> Accounting reconciliation status

Property must integrate with employee onboarding, movement, and offboarding.

A basic accountability model must exist before full property lifecycle work is considered complete.

---

## 15. Calendar

Calendar is a shared platform service.

Required event classes:

- municipality-wide events
- Mayor / executive events
- office events
- SB sessions
- committee meetings
- trainings
- HR events
- approved leave / availability
- workflow deadlines
- project / procurement / compliance deadlines
- onboarding activities
- contract expirations
- property inventory schedules

Domain modules should publish calendar events rather than require duplicate manual encoding.

---

## 16. Notification and popup engine

Notifications are a backend domain, not only a bell icon.

Required notification concepts:

- recipient resolution
- priority
- delivery channel
- read state
- acknowledgement
- escalation
- expiration
- source domain / event

Priority classes:

- INFO
- ACTION REQUIRED
- URGENT
- CRITICAL
- ACKNOWLEDGEMENT REQUIRED

Automatic popup candidates:

- urgent executive request
- acknowledgement-required memorandum
- critical HR action
- property discrepancy
- deadline escalation
- security warning
- offboarding blocker

Routine updates should normally use the notification center rather than disruptive automatic popups.

Production target: domain events + queue + real-time transport (Laravel Reverb / WebSocket) with polling fallback. PostgreSQL remains authoritative.

---

## 17. Documents and records

Do not create independent upload systems in each module.

Use a shared protected document service supporting:

- document ID
- owner / office
- business-domain link
- classification
- confidentiality
- version
- protected storage reference
- checksum / integrity metadata
- retention metadata
- access log

A document may be linked to a workflow transaction, employee record, property asset, HR action, or legislative record subject to access policy.

---

## 18. Security baseline

Mandatory principles:

- server-side authorization
- least privilege
- no security based only on hidden UI controls
- office + role + assignment + state-aware access
- append-only business history for critical workflow events
- audit denied access where appropriate
- protected file access through application authorization
- secrets never committed
- no production database passwords in docs or code
- no browser/client direct database access
- no RHU clinical data in the HRIS database boundary

Any public/external portal added in later phases must not directly connect to protected internal tables or file storage.

---

## 19. Phase 1 deadline and definition of done

Hard target: **2026-08-21 12:00 PHT**.

The deadline is aggressive. Agents must optimize for integrated end-to-end coverage of the client-emphasized Phase 1 fields while preserving correctness and explicit boundaries.

A module is not "done" because code exists.

Phase 1 can only be called complete when the agreed acceptance gates in `docs/PHASE_1_PLAN.md` are satisfied and verification evidence is recorded.

At minimum:

- migrations apply cleanly against the dedicated test database
- seed/demo environment is reproducible
- authorization boundaries are tested
- key routing flows are tested
- onboarding and offboarding blockers are tested
- property accountability flow is tested
- calendar event generation is tested
- notification / popup behavior is tested
- frontend production build succeeds
- feature tests pass or known failures are explicitly documented
- no claim of green CI without observed evidence

If the hard deadline is reached with failed acceptance gates, label the build honestly as a **Phase 1 candidate with open gates**, not a verified production release.

---

## 20. Engineering and commit documentation policy

Effective immediately, every codebase commit must be documented.

Every commit must:

1. use a descriptive commit message
2. update `docs/ENGINEERING_LOG.md` in the same commit
3. state the intent / requirement addressed
4. list important files / modules changed
5. identify migrations / schema effects
6. state tests or verification actually performed
7. state known gaps / risks / follow-up
8. avoid claiming tests passed if they were not observed

Agents must not create undocumented "small" commits.

If a change is documentation-only, record that verification is documentation-only and that runtime behavior was not changed.

---

## 21. Agent operating rules

Before coding:

- read this SSOT
- read `docs/PHASE_1_PLAN.md`
- inspect existing implementation before replacing it
- preserve proven prototype behavior unless the Phase 1 architecture requires an intentional migration

During coding:

- prefer shared domain services over duplicated module logic
- use database transactions for multi-record business invariants
- preserve auditability
- write tests around permissions and lifecycle blockers
- do not silently fake production integrations

Before commit:

- run the relevant narrow tests first
- run broader verification when practical
- update `docs/ENGINEERING_LOG.md`
- document unverified areas

Never:

- expose secrets
- point automated destructive tests at presentation / production data
- represent synthetic payroll as statutory payroll
- represent simulated biometrics as live hardware integration
- mix RHU patient clinical data into HRIS
- claim production readiness without evidence

---

## 22. Current build priority

Immediate priority order:

1. organization / branch / office model
2. identity and office-aware permissions
3. office workspaces and universal routing
4. shared documents / records
5. notification + calendar foundations
6. employee master / profile
7. onboarding + movement
8. basic property accountability
9. leave / attendance / DTR / biometric boundary
10. payroll / benefits foundation
11. performance / training / competency / health vault
12. offboarding + clearance
13. full property lifecycle
14. executive workspace hardening
15. legislative workspace hardening
16. reports / audit / security / verification
17. cloud benchmark readiness

Implementation sequencing and time-boxes are defined in `docs/PHASE_1_PLAN.md`.

---

## 23. Change authority

Scope changes that materially alter Phase 1 must be added to this file by Kirch Ivan Balite or explicitly approved and then documented here.

Agents may propose changes in planning documentation, but must not silently redefine the SSOT.
