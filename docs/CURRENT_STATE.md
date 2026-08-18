# Current Prototype State

## Current comprehensive branch

`KIRCH-PROTOTYPE-M5-HRIS-LEAVE-AUDIT`

This branch stacks the foundation, department/Mayor workflow, memoranda, legislative records, HRIS leave prototype, attendance boundary, and security-audit demonstration.

## Implemented demonstration surfaces

- employee login;
- department-specific dashboard backed by shared workflow data;
- municipality office directory;
- transaction list, creation, detail, routing, review, return, and forwarding;
- Mayor's Office command queue and approval decision;
- memorandum publishing, audience resolution, portal notification, viewing, and acknowledgement statistics;
- searchable legislative repository and legislative-authorized record creation;
- HR self-service leave balances and application;
- HR administration review/approval/rejection;
- attendance event display based on synthetic prototype biometric-source records;
- audit viewer for privileged accounts;
- server-side HR administration denial with an audit event;
- responsive desktop/phone layout;
- LAN runbook and synthetic reset/seed path.

## Transport note

Memorandum popup delivery uses a short portal polling interval in the prototype. This keeps the LAN demo reliable without making WebSocket availability a dependency. The database is authoritative; Laravel Reverb can later replace polling as the notification transport.

## Known prototype boundaries

- no transaction/document file uploads yet;
- no full payroll engine;
- no live biometric-device adapter;
- no SMS/native push/native app;
- no production cloud/hybrid deployment proof;
- no digital-signature integration;
- no full archival migration/OCR tooling;
- no RHU/medical-record data or workflow in this repository;
- production authorization requires Talibon's official organization and delegation matrix;
- seed data is synthetic only.

## Verification status

Repository CI is configured to verify Composer installation, frontend TypeScript/build, PostgreSQL migration/seed, and route registration. Until a CI run or equivalent local dependency-backed verification is observed as passing, this branch remains a prototype candidate rather than a verified release.
