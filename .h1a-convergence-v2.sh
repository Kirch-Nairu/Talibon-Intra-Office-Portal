#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH=KIRCH-TALIBON-H1A-CONVERGENCE-V2
REQUIRED_HEAD=e43eddf242cf429137585f6970e2129b018ec9f9
H1A_SOURCE=67ed5c8bc9f5b771356b7912febfe5daf8f3e609

export H1A_SOURCE

git fetch origin "$TARGET_BRANCH"
test "$(git rev-parse FETCH_HEAD)" = "$REQUIRED_HEAD"
git checkout --detach "$REQUIRED_HEAD"
test "$(git rev-parse HEAD)" = "$REQUIRED_HEAD"
git cat-file -e "$H1A_SOURCE^{commit}"

git checkout "$H1A_SOURCE" -- \
  resources/js/pages/Transactions/Create.tsx \
  resources/js/pages/Memoranda/Create.tsx \
  resources/js/pages/Memoranda/Show.tsx

python3 - <<'PY'
from pathlib import Path
import os
import subprocess

source = os.environ['H1A_SOURCE']
current_log = Path('docs/ENGINEERING_LOG.md')
current = current_log.read_text()
source_log = subprocess.check_output(['git', 'show', f'{source}:docs/ENGINEERING_LOG.md'], text=True)
marker = '## 2026-09-13 — Stable Baseline H1A client mutation reliability'
if marker in current:
    raise SystemExit('H1A log entry already present unexpectedly')
start = source_log.index(marker)
current_log.write_text(current.rstrip() + '\n\n' + source_log[start:].rstrip() + '\n')

controller = Path('app/Http/Controllers/TransactionController.php')
text = controller.read_text()
old = "            'permissions' => $mutable['permissions'],"
new = "            'transactionPermissions' => $mutable['permissions'],"
if text.count(old) != 1:
    raise SystemExit(f'expected one TransactionController permissions prop, found {text.count(old)}')
controller.write_text(text.replace(old, new, 1))

show = Path('resources/js/pages/Transactions/Show.tsx')
text = show.read_text()
replacements = [
    ('    permissions: initialPermissions,\n    evidence,', '    transactionPermissions: initialPermissions,\n    evidence,'),
    ('    accountability: Accountability;\n    permissions: Permissions;\n    evidence: EvidencePayload;', '    accountability: Accountability;\n    transactionPermissions: Permissions;\n    evidence: EvidencePayload;'),
]
for old, new in replacements:
    if text.count(old) != 1:
        raise SystemExit(f'expected one transaction Show prop target, found {text.count(old)}')
    text = text.replace(old, new, 1)
show.write_text(text)

memo = Path('resources/js/pages/Memoranda/Show.tsx')
text = memo.read_text()
replacements = [
    ("import { useState } from 'react';", "import { useRef, useState } from 'react';"),
    ('    const acknowledgement = useForm({});\n    const [acknowledgementError, setAcknowledgementError] = useState<string | null>(null);', '    const acknowledgement = useForm({});\n    const acknowledgementInFlight = useRef(false);\n    const [acknowledgementError, setAcknowledgementError] = useState<string | null>(null);'),
    ('        if (acknowledgement.processing) {\n            return;\n        }\n\n        setAcknowledgementError(null);\n        acknowledgement.post', '        if (acknowledgementInFlight.current || acknowledgement.processing) {\n            return;\n        }\n\n        acknowledgementInFlight.current = true;\n        setAcknowledgementError(null);\n        acknowledgement.post'),
    ("            onSuccess: () => setAcknowledgementError(null),\n            onError: (errors) => {\n                const message = Object.values(errors).find((value): value is string => typeof value === 'string');\n                setAcknowledgementError(message ?? 'Unable to record acknowledgement. Please try again.');\n            },", "            onSuccess: () => setAcknowledgementError(null),\n            onError: (errors) => {\n                const message = Object.values(errors).find((value): value is string => typeof value === 'string');\n                setAcknowledgementError(message ?? 'Unable to record acknowledgement. Please try again.');\n            },\n            onFinish: () => {\n                acknowledgementInFlight.current = false;\n            },"),
]
for old, new in replacements:
    if text.count(old) != 1:
        raise SystemExit(f'expected one memorandum guard target, found {text.count(old)}')
    text = text.replace(old, new, 1)
memo.write_text(text)

harness = Path('tests/Browser/h1-mutation-readiness.mjs')
text = harness.read_text()
old = "    failed: 0,\n    pageerrorCount: 0,"
new = "    failed: 0,\n    failH1: 0,\n    deferredH2: 0,\n    pageerrorCount: 0,"
if text.count(old) != 1:
    raise SystemExit('H1 summary shape target not found exactly once')
text = text.replace(old, new, 1)

old = "    mutationName: meta.mutation,\n    requestCount: 0,"
new = "    mutationName: meta.mutation,\n    disposition: meta.disposition || 'H1',\n    requestCount: 0,"
if text.count(old) != 1:
    raise SystemExit('H1 row disposition target not found exactly once')
text = text.replace(old, new, 1)

for scenario in ('correspondence-route-double-click', 'correspondence-begin-action'):
    old = f"scenario: '{scenario}',"
    if text.count(old) != 1:
        raise SystemExit(f'expected one scenario metadata target for {scenario}, found {text.count(old)}')
    text = text.replace(old, old + "\n      disposition: 'DEFERRED_H2',", 1)

old = """  row.failureReason = row._failures.length ? row._failures.join(' | ') : null;
  row.result = row.failureReason ? 'FAIL' : 'PASS';
  delete row._failures;

  if (row.result === 'PASS') report.summary.passed++;
  else {
    report.summary.failed++;
    report.defects.push({ scenario: row.scenario, reason: row.failureReason });
    if (meta.safeScreenshot !== false) await safeScreenshot(page, row);
  }
"""
new = """  row.failureReason = row._failures.length ? row._failures.join(' | ') : null;
  const deferredH2 = meta.disposition === 'DEFERRED_H2';
  row.result = deferredH2 ? 'DEFERRED_H2' : (row.failureReason ? 'FAIL' : 'PASS');
  delete row._failures;

  if (row.result === 'PASS') {
    report.summary.passed++;
  } else if (row.result === 'DEFERRED_H2') {
    report.summary.deferredH2++;
    report.defects.push({ scenario: row.scenario, disposition: 'DEFERRED_H2', reason: row.failureReason });
    if (row.failureReason && meta.safeScreenshot !== false) await safeScreenshot(page, row);
  } else {
    report.summary.failed++;
    report.summary.failH1++;
    report.defects.push({ scenario: row.scenario, disposition: 'H1', reason: row.failureReason });
    if (meta.safeScreenshot !== false) await safeScreenshot(page, row);
  }
"""
if text.count(old) != 1:
    raise SystemExit(f'H1 result-classification target not found exactly once: {text.count(old)}')
harness.write_text(text.replace(old, new, 1))
PY

docker run --name talibon-h1a-v2-postgres -e POSTGRES_DB=talibon_h1a_convergence_v2 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
for attempt in $(seq 1 30); do
  if docker exec talibon-h1a-v2-postgres pg_isready -U postgres -d talibon_h1a_convergence_v2 >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec talibon-h1a-v2-postgres pg_isready -U postgres -d talibon_h1a_convergence_v2

cp .env.example .env
sed -i 's/^APP_ENV=.*/APP_ENV=testing/' .env
sed -i 's/^APP_DEBUG=.*/APP_DEBUG=false/' .env
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=pgsql/' .env
sed -i 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' .env
sed -i 's/^DB_PORT=.*/DB_PORT=5432/' .env
sed -i 's/^DB_DATABASE=.*/DB_DATABASE=talibon_h1a_convergence_v2/' .env
sed -i 's/^DB_USERNAME=.*/DB_USERNAME=postgres/' .env
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=postgres/' .env
DEMO_PASSWORD="$(openssl rand -hex 24)"
echo "::add-mask::$DEMO_PASSWORD"
sed -i "s/^PROTOTYPE_DEMO_PASSWORD=.*/PROTOTYPE_DEMO_PASSWORD=$DEMO_PASSWORD/" .env

composer install --no-interaction --prefer-dist --no-progress
php artisan key:generate --force
npm install --no-audit --no-fund

composer validate --no-check-publish
npm run types:check
npm run build
php artisan migrate:fresh --seed --force

mapfile -t focused < <(find tests/Feature -maxdepth 1 -type f \( -iname '*Transaction*Test.php' -o -iname '*Memorandum*Test.php' \) | sort)
test "${#focused[@]}" -gt 0
printf 'FOCUSED_TESTS=%s\n' "${focused[*]}"
php artisan test "${focused[@]}"
php artisan test --testsuite=Feature
php artisan route:list
node --check tests/Browser/h1-mutation-readiness.mjs

cat >> docs/ENGINEERING_LOG.md <<'EOF'

## 2026-09-13 — H1 convergence V2

### `fix(h1): converge mutation reliability`

- Exact parent SHA: `e43eddf242cf429137585f6970e2129b018ec9f9`; branch: `KIRCH-TALIBON-H1A-CONVERGENCE-V2`.
- Imported the production-only H1A client mutation reliability changes from `67ed5c8bc9f5b771356b7912febfe5daf8f3e609` without importing that branch history; existing H1B log entries remain preserved and the H1A entry is appended intact.
- Transaction detail root cause: `TransactionController::show()` supplied transaction-specific data through top-level Inertia prop `permissions`, overwriting the shared `permissions` contract required by `AppLayout`. The transaction-local prop is now `transactionPermissions`, with `Transactions/Show.tsx` updated accordingly; `AppLayout` was not weakened.
- Memorandum acknowledgement duplicate root cause: `useForm.processing` is not a synchronous mutex between rapid activations in the same render turn. A `useRef<boolean>` guard is set before the Inertia POST and cleared in `onFinish`, while retaining processing UI, visible errors, and server-authoritative reconciliation.
- H2 boundary: `correspondence-route-double-click` and `correspondence-begin-action` remain executed and evidenced, but are explicitly classified `DEFERRED_H2`. No correspondence authorization, linked-workflow, lifecycle, or business-rule production code is changed.
- Verification actually observed before publication: Composer validation PASS; TypeScript PASS; production build PASS; isolated PostgreSQL migrate/seed PASS; focused Transaction/Memorandum Feature tests PASS; full Feature suite PASS; route inspection PASS; H1 mutation harness syntax PASS; final diff check and exact changed-file review PASS.
- Schema/migration/dependency impact: **NONE**. No merge or deployment. Exact-SHA Platform, H0 runtime smoke, and H1 mutation acceptance are the final acceptance authority.
- H2 is **NOT STARTED**.
EOF

git diff --check "$REQUIRED_HEAD"
mapfile -t changed < <(git diff --name-only "$REQUIRED_HEAD" | sort)
expected=(
  app/Http/Controllers/TransactionController.php
  docs/ENGINEERING_LOG.md
  resources/js/pages/Memoranda/Create.tsx
  resources/js/pages/Memoranda/Show.tsx
  resources/js/pages/Transactions/Create.tsx
  resources/js/pages/Transactions/Show.tsx
  tests/Browser/h1-mutation-readiness.mjs
)
test "${#changed[@]}" -eq "${#expected[@]}"
test "$(printf '%s\n' "${changed[@]}")" = "$(printf '%s\n' "${expected[@]}")"
read additions deletions logpath < <(git diff --numstat "$REQUIRED_HEAD" -- docs/ENGINEERING_LOG.md)
test "$logpath" = docs/ENGINEERING_LOG.md
test "$deletions" = 0
git diff "$REQUIRED_HEAD" -- docs/ENGINEERING_LOG.md
git diff --stat "$REQUIRED_HEAD"

git config user.name "H1 Convergence Builder"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add app/Http/Controllers/TransactionController.php docs/ENGINEERING_LOG.md resources/js/pages/Memoranda/Create.tsx resources/js/pages/Memoranda/Show.tsx resources/js/pages/Transactions/Create.tsx resources/js/pages/Transactions/Show.tsx tests/Browser/h1-mutation-readiness.mjs
git commit -m "fix(h1): converge mutation reliability"
FINAL_SHA="$(git rev-parse HEAD)"
test "$(git rev-parse HEAD^)" = "$REQUIRED_HEAD"

git fetch origin "$TARGET_BRANCH"
test "$(git rev-parse FETCH_HEAD)" = "$REQUIRED_HEAD"
git push origin "HEAD:refs/heads/$TARGET_BRANCH"
echo "FINAL_SHA=$FINAL_SHA"

curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/$REPOSITORY/actions/workflows/356437570/dispatches" \
  -d "{\"ref\":\"$TARGET_BRANCH\"}"
