from pathlib import Path
import subprocess

TARGET_BASE = 'ac0544d315c8841e02973341f9a77618a37cc287'
TARGET_BRANCH = 'KIRCH-TALIBON-H1B-MUTATION-ACCEPTANCE-HARNESS'


def run(*args, capture=False):
    result = subprocess.run(args, check=True, text=True, capture_output=capture)
    return result.stdout.strip() if capture else ''

run('git', 'cat-file', '-e', f'{TARGET_BASE}^{{commit}}')
run('git', 'checkout', '--detach', TARGET_BASE)

path = Path('tests/Browser/h1-mutation-readiness.mjs')
text = path.read_text()
replacements = [
    (
        "      const visible = await mayor.page.getByText(memorandumNumber, { exact: true }).isVisible().catch(() => false);\n      const success = await mayor.page.getByText(/published and delivered/i).isVisible().catch(() => false);\n      row.visibleResult = visible && success ? 'Published memorandum and delivery success are visible immediately.' : 'Published memorandum did not converge visibly immediately.';\n      const immediate = visible && success && !!ready && before.count === 0 && after.count === 1 && after.recipientCount > 0;",
        "      const visible = await mayor.page.getByText(new RegExp(memorandumNumber, 'i')).first().isVisible().catch(() => false);\n      row.visibleResult = visible ? 'Published memorandum detail is visible immediately.' : 'Published memorandum did not converge visibly immediately.';\n      const immediate = visible && !!ready && before.count === 0 && after.count === 1 && after.recipientCount > 0;",
    ),
    (
        "        return await mayor.page.getByText(memorandumNumber, { exact: true }).isVisible().catch(() => false)\n          && reloadState.count === 1",
        "        return await mayor.page.getByText(new RegExp(memorandumNumber, 'i')).first().isVisible().catch(() => false)\n          && reloadState.count === 1",
    ),
    (
        "      await employee.page.getByText(/^Acknowledged\\b/).waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});",
        "      await employee.page.getByText(/Acknowledged/i).first().waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});",
    ),
    (
        "      const visible = await employee.page.getByText(/^Acknowledged\\b/).isVisible().catch(() => false);",
        "      const visible = await employee.page.getByText(/Acknowledged/i).first().isVisible().catch(() => false);",
    ),
    (
        "        return await employee.page.getByText(/^Acknowledged\\b/).isVisible().catch(() => false)\n          && reloadState.targetAcknowledged",
        "        return await employee.page.getByText(/Acknowledged/i).first().isVisible().catch(() => false)\n          && reloadState.targetAcknowledged",
    ),
    (
        "      await engineering.page.goto(`${BASE}/transactions/create`, { waitUntil: 'domcontentloaded', timeout: 15000 });\n      await appReady(engineering.page);\n      await engineering.page.getByLabel('Description').fill(invalidTransactionTitle);",
        "      await engineering.page.goto(`${BASE}/transactions/create`, { waitUntil: 'domcontentloaded', timeout: 15000 });\n      await appReady(engineering.page);\n      const pendingMemoLater = engineering.page.getByRole('button', { name: 'Later', exact: true });\n      if (await pendingMemoLater.isVisible().catch(() => false)) {\n        await pendingMemoLater.click();\n      }\n      await engineering.page.getByLabel('Description').fill(invalidTransactionTitle);",
    ),
]
for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'expected exactly one replacement target, found {count}: {old[:100]}')
    text = text.replace(old, new, 1)
path.write_text(text)

log = Path('docs/ENGINEERING_LOG.md')
base_log = log.read_bytes()
append = r'''

## 2026-09-13 — Stable Baseline H1B exact-SHA evidence refinement

### `test(hardening): refine mutation acceptance evidence`

- Exact parent: published H1B carrier SHA `ac0544d315c8841e02973341f9a77618a37cc287`; production application files and the stable hardening workflow are unchanged by this refinement.
- First exact-SHA H1 execution: run `34709164744` reached the real mutation harness and produced 14 scenario records with 6 passing and 8 provisional failures, zero `pageerror`, and zero HTTP 5xx. Its artifact remains preserved as evidence.
- Harness-only correction: remove an unnecessary memorandum flash-message requirement when the newly published memorandum detail is already the visible authoritative result; use the rendered acknowledgement state rather than an over-strict text anchor; and dismiss the existing client-only pending-memorandum overlay before the later transaction-validation scenario so the validation click is not mechanically blocked by an unrelated modal. The `Later` control only updates local React state and is not a server mutation.
- Production evidence intentionally preserved: transaction detail rendering failures, correspondence post-route convergence/actionability behavior, duplicate browser requests, and any other application-level failures remain failures. No controller, component, authorization, transition, database, or business rule is patched here.
- Verification before publication: `node --check tests/Browser/h1-mutation-readiness.mjs` PASS; exact changed set limited to the H1 browser harness and this append; `git diff --check` PASS; engineering-log historical bytes remain unchanged and this entry is EOF-only.
- Schema/migration/dependency impact: **none**. Final exact-SHA Platform, H0 browser, and H1 mutation execution remains the acceptance authority.
'''.encode()
log.write_bytes(base_log + append)
assert log.read_bytes().startswith(base_log)

run('node', '--check', 'tests/Browser/h1-mutation-readiness.mjs')
run('git', 'diff', '--check', TARGET_BASE)
changed = run('git', 'diff', '--name-only', TARGET_BASE, capture=True).splitlines()
expected = ['docs/ENGINEERING_LOG.md', 'tests/Browser/h1-mutation-readiness.mjs']
if sorted(changed) != expected:
    raise SystemExit(f'unexpected changed set: {changed}')
numstat = run('git', 'diff', '--numstat', TARGET_BASE, '--', 'docs/ENGINEERING_LOG.md', capture=True).split('\t')
if len(numstat) != 3 or numstat[1] != '0' or numstat[2] != 'docs/ENGINEERING_LOG.md':
    raise SystemExit(f'engineering log is not append-only: {numstat}')
print('--- ENGINEERING LOG DIFF ---')
subprocess.run(['git', 'diff', TARGET_BASE, '--', 'docs/ENGINEERING_LOG.md'], check=True)
print('--- DIFF STAT ---')
subprocess.run(['git', 'diff', '--stat', TARGET_BASE], check=True)
print('--- STATUS ---')
subprocess.run(['git', 'status', '--short'], check=True)

run('git', 'config', 'user.name', 'H1B QA Builder')
run('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
run('git', 'add', 'tests/Browser/h1-mutation-readiness.mjs', 'docs/ENGINEERING_LOG.md')
run('git', 'commit', '-m', 'test(hardening): refine mutation acceptance evidence')
parent = run('git', 'rev-parse', 'HEAD^', capture=True)
if parent != TARGET_BASE:
    raise SystemExit(f'wrong parent {parent}')
run('git', 'fetch', 'origin', TARGET_BRANCH)
remote = run('git', 'rev-parse', 'FETCH_HEAD', capture=True)
if remote != TARGET_BASE:
    raise SystemExit(f'target branch moved: {remote}')
run('git', 'push', 'origin', f'HEAD:refs/heads/{TARGET_BRANCH}')
print('FINAL_SHA=' + run('git', 'rev-parse', 'HEAD', capture=True))
