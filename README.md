# Talibon Intra-Office Portal

Secure municipal intra-office operations prototype for LGU Talibon.

## Current prototype candidate

```text
Branch: KIRCH-PROTOTYPE-M5-HRIS-LEAVE-AUDIT
Pull Request: #2
Status: Draft candidate pending dependency-backed verification
```

The current branch demonstrates the municipality's requested internal workflow using one shared Laravel application and PostgreSQL database.

## Working prototype scope

- employee authentication with department identity;
- distinct department dashboards backed by shared workflow data;
- municipality department / office overview;
- inter-office transaction creation and routing;
- append-only transaction history;
- dedicated Mayor's Office review and approval queue;
- memorandum publishing to all employees, selected departments, or selected employees;
- in-portal memorandum notification, viewing, and acknowledgement tracking;
- searchable legislative records for ordinances, resolutions, executive orders, and related issuances;
- employee HRIS self-service with electronic leave credits;
- leave request submission and HR-only approval / rejection;
- leave-credit transaction ledger foundation;
- attendance event records prepared for future biometric integration;
- server-side HR administration restriction;
- audit evidence for important workflow actions and denied HR access;
- responsive desktop and phone browser interface;
- LAN deployment runbook and synthetic demonstration data.

## Technology

- Laravel 13
- PHP 8.3+
- Inertia + React 19 + TypeScript
- Tailwind CSS
- PostgreSQL
- Laravel notifications / portal polling fallback for the prototype
- modular monolith architecture

Realtime transport is intentionally not the source of truth. PostgreSQL is authoritative. Laravel Reverb can replace the prototype polling transport later without changing the memorandum records or acknowledgement model.

## Quick start

Prerequisites:

- PHP 8.3+
- Composer
- Node.js 22+
- PostgreSQL 16+

```powershell
Copy-Item .env.example .env
composer install
php artisan key:generate
npm install
```

Create a PostgreSQL database named `talibon_portal`, configure the database credentials in `.env`, then run:

```powershell
php artisan migrate:fresh --seed
npm run build
php artisan serve --host=0.0.0.0 --port=8000
```

Other devices on the same trusted LAN open:

```text
http://HOST_IPV4:8000
```

See `docs/LAN_RUNBOOK.md` for the complete LAN procedure.

## Synthetic demo accounts

All prototype accounts use:

```text
Password: TalibonDemo2026!
```

Accounts:

```text
admin@talibon.demo
mayor@talibon.demo
engineering@talibon.demo
budget@talibon.demo
hr@talibon.demo
legislative@talibon.demo
employee@talibon.demo
```

All people, balances, attendance events, transactions, memoranda, and legislative records in the seed database are synthetic demonstration data.

## Main demo path

```text
Engineering
    -> creates transaction
Budget
    -> receives and reviews
    -> routes to Mayor's Office
Mayor's Office
    -> reviews and approves
Engineering
    -> sees approved state and complete routing history
```

Second demo path:

```text
Mayor's Office
    -> publishes memorandum
Employee browser / phone
    -> receives portal notification
    -> opens and acknowledges
Mayor's Office
    -> sees delivery / view / acknowledgement statistics
```

Security proof:

```text
Engineering account -> /hris/admin -> DENIED + audit event
HR account          -> /hris/admin -> ALLOWED
```

## Deliberate prototype boundaries

Not claimed complete:

- transaction or document file upload / archival ingestion;
- government payroll computation;
- live biometric hardware integration;
- native mobile application, SMS, or native OS push notification;
- production cloud or hybrid deployment;
- legal digital signatures;
- full procurement, accounting, or fund-utilization engines;
- OCR / bulk archival migration;
- RHU / medical-record functionality.

The separate RHU / primary healthcare facility system must remain a separate application and data boundary.

## Documentation

Start with:

- `docs/CURRENT_STATE.md`
- `docs/PROTOTYPE_SCOPE.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY_MODEL.md`
- `docs/DATA_MODEL.md`
- `docs/DEMO_FLOW.md`
- `docs/LAN_RUNBOOK.md`
- `docs/MEMORANDA.md`
- `docs/LEGISLATIVE_RECORDS.md`
- `docs/HRIS_PROTOTYPE.md`
- `docs/DEVELOPMENT_PLAN.md`

## Verification

CI is configured to perform Composer installation, TypeScript checking, production frontend build, PostgreSQL migration/seed, demo-critical feature tests, and route inspection. Until an actual CI run or equivalent local dependency-backed verification is observed as passing, PR #2 remains a draft prototype candidate rather than a verified release.
