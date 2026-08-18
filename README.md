# Talibon Intra-Office Portal

Prototype of a secure municipal intra-office operations platform for LGU Talibon.

## Prototype objective

Deliver a minimal working LAN-capable prototype that demonstrates the municipality's requested internal workflow:

- employee accounts with department separation;
- department dashboards and inboxes;
- inter-office transaction routing;
- Mayor's Office review and approval queue;
- memorandum publishing, delivery, and acknowledgement;
- centralized legislative records for ordinances and resolutions;
- HRIS foundations including employee directory, leave credits, leave requests, and attendance records;
- role- and department-aware authorization;
- auditable workflow and security events;
- responsive browser access for desktop and mobile devices.

## Technology direction

- Laravel 13
- PHP 8.3+
- Inertia + React 19 + TypeScript
- Tailwind CSS
- PostgreSQL
- Laravel Reverb / broadcasting for realtime events where appropriate
- Modular monolith architecture

## Deployment direction

The prototype will run as one authoritative application and PostgreSQL database on a LAN host. Other devices connect through the browser over the local network. Production cloud/hybrid deployment remains a later infrastructure decision and must not weaken authorization, audit, privacy, backup, or records controls.

## Scope boundary

The separate RHU / primary healthcare facility medical-record system is **not part of this repository**. Health information requires a separate application and data boundary.

## Current development lane

Development begins with the municipal identity, organization, department separation, transaction-routing, Mayor's Office, memoranda, legislative records, HR leave foundations, and audit trail required for the working prototype.

See `docs/` for architecture, prototype scope, security model, and demo flow as they are added.
