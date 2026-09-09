import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:8000';
const PASSWORD = process.env.QA_DEMO_PASSWORD;
if (!PASSWORD) throw new Error('QA_DEMO_PASSWORD is required');

const TARGET_REF = process.env.QA_TARGET_REF || 'KIRCH-TALIBON-FRONTEND-DESIGN-V2';
const TARGET_SHA = process.env.QA_TARGET_SHA || 'unknown';
const OUT = 'storage/app/qa/v2-visual';
const SCREENSHOTS = `${OUT}/screenshots`;
const BASE_ORIGIN = new URL(BASE).origin;
const PUBLIC_VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];
const ROLES = [
  {
    slug: 'system-admin', email: 'admin@talibon.demo', experience: 'system_administration',
    headings: ['Accounts and security', 'Office identities', 'Security activity', 'Quick Access'],
  },
  {
    slug: 'executive', email: 'mayor@talibon.demo', experience: 'executive_oversight',
    headings: ['Municipal workload', 'Municipal attention', 'Oldest unresolved work', 'Quick Access'],
  },
  {
    slug: 'department-head', email: 'engineering@talibon.demo', experience: 'department_head',
    headings: ['Office workload', 'Staff and follow-up', 'Correspondence workspace', 'Quick Access'],
  },
  {
    slug: 'employee', email: 'employee@talibon.demo', experience: 'employee',
    headings: ['My work', 'Correspondence workspace', 'Recent work', 'Quick Access'],
  },
];

const sensitiveValues = new Set([PASSWORD]);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  targetRef: TARGET_REF,
  targetSha: TARGET_SHA,
  automatedState: 'AUTOMATED_CHECKS_PENDING',
  visualState: 'VISUAL_REVIEW_REQUIRED',
  scope: 'V2-QA1 dedicated visual evidence harness only',
  checks: [],
  diagnostics: [],
  screenshots: [],
  notes: [
    'Mechanical browser checks are not design acceptance, UAT, production acceptance, or production readiness.',
    'Historical F1-F8 verdicts are not reused by this harness.',
    'Synthetic fresh-seeded PostgreSQL data only.',
    'Runtime demo credentials and MFA material are never written to reports.',
  ],
};

function rememberSensitive(...values) {
  for (const value of values.flat()) {
    if (typeof value === 'string' && value.length > 0) sensitiveValues.add(value);
  }
}
function clean(value) {
  let output = String(value ?? '');
  for (const secret of sensitiveValues) output = output.replaceAll(secret, '[MASKED]');
  return output;
}
function sanitize(value) {
  if (typeof value === 'string') return clean(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitize(item)]));
  }
  return value;
}
function record(scope, name, ok, details = '', severity = 'P1') {
  report.checks.push({ scope, name, ok: Boolean(ok), details: clean(details), severity });
}
function safePath(value) {
  try { return new URL(value, BASE).pathname; } catch { return '[unavailable]'; }
}
function diagnostic(scope, type, details, page = null) {
  const currentPath = page ? safePath(page.url()) : '[runtime]';
  report.diagnostics.push({
    at: new Date().toISOString(), scope, path: currentPath, type,
    details: currentPath.startsWith('/security/mfa/') ? '[redacted on sensitive MFA route]' : clean(details),
  });
}
function isApplicationUrl(value) {
  try { return new URL(value, BASE).origin === BASE_ORIGIN; } catch { return false; }
}
function monitor(page, scope) {
  const failures = [];
  page.on('pageerror', (error) => {
    failures.push(`pageerror: ${error.message}`);
    diagnostic(scope, 'pageerror', error.message, page);
  });
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    failures.push(`console.error: ${message.text()}`);
    diagnostic(scope, 'console.error', message.text(), page);
  });
  page.on('requestfailed', (request) => {
    if (!isApplicationUrl(request.url())) return;
    const detail = `${request.resourceType()} ${safePath(request.url())} ${request.failure()?.errorText || 'request failed'}`;
    failures.push(`requestfailed: ${detail}`);
    diagnostic(scope, 'requestfailed', detail, page);
  });
  page.on('response', (response) => {
    if (!isApplicationUrl(response.url()) || response.status() < 400) return;
    const detail = `${response.status()} ${response.request().resourceType()} ${safePath(response.url())}`;
    failures.push(`http-error: ${detail}`);
    diagnostic(scope, response.status() >= 500 ? 'server-5xx' : 'application-http-error', detail, page);
  });
  return () => record(scope, 'no page/console/application-request errors or server 5xx', failures.length === 0, failures.join(' | '));
}

function decodeBase32(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of input.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error('Invalid base32 MFA secret');
    bits += index.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(bytes);
}
function totp(secret) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = crypto.createHmac('sha1', decodeBase32(secret)).update(counter).digest();
  const offset = digest.at(-1) & 0x0f;
  const value = ((digest[offset] & 0x7f) << 24)
    | (digest[offset + 1] << 16)
    | (digest[offset + 2] << 8)
    | digest[offset + 3];
  return String(value % 1_000_000).padStart(6, '0');
}
async function waitForAnyPath(page, paths, timeout = 15000) {
  await page.waitForFunction((expected) => expected.includes(window.location.pathname), paths, { timeout });
}
async function loginAndReachDashboard(page, role) {
  const response = await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  record(role.slug, 'login route loads', response?.status() === 200, `status=${response?.status()}`);
  await page.getByLabel('Email').fill(role.email);
  await page.getByLabel('Password').fill(PASSWORD);
  await Promise.all([
    waitForAnyPath(page, ['/dashboard', '/security/mfa/enroll', '/security/mfa/challenge']),
    page.getByRole('button', { name: 'Sign In' }).click(),
  ]);

  if (safePath(page.url()) === '/security/mfa/challenge') {
    throw new Error('Fresh synthetic account unexpectedly required an existing MFA challenge');
  }
  if (safePath(page.url()) === '/security/mfa/enroll') {
    const secret = (await page.locator('code').first().innerText()).trim();
    rememberSensitive(secret);
    await page.getByLabel('Six-digit verification code').fill(totp(secret));
    await Promise.all([
      waitForAnyPath(page, ['/security/mfa/recovery-codes']),
      page.getByRole('button', { name: /Confirm MFA enrollment/i }).click(),
    ]);
    const codes = (await page.locator('pre').innerText()).trim().split(/\s+/).filter(Boolean);
    rememberSensitive(codes);
    await Promise.all([
      waitForAnyPath(page, ['/dashboard']),
      page.getByRole('link', { name: /Continue to portal/i }).click(),
    ]);
  }
  record(role.slug, 'authentication reaches dashboard', safePath(page.url()) === '/dashboard', safePath(page.url()));
}

async function readWorkspaceExperience(page, response) {
  if (!response) return null;
  const html = await response.text();
  return page.evaluate((markup) => {
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    const bootstrap = parsed.querySelector('script[type="application/json"][data-page="app"]');
    if (!bootstrap?.textContent) return null;
    try { return JSON.parse(bootstrap.textContent)?.props?.workspaceExperience ?? null; } catch { return null; }
  }, html);
}
async function assertNoOverflow(page, scope, label) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    root: document.documentElement.scrollWidth,
    body: document.body?.scrollWidth || 0,
  }));
  record(scope, `${label} has no horizontal overflow`, metrics.root <= metrics.viewport + 1 && metrics.body <= metrics.viewport + 1, JSON.stringify(metrics), 'P2');
}
async function assertVisibleNavFits(page, scope, label) {
  const nav = page.locator('nav[aria-label="Primary navigation"]:visible').first();
  const visible = await nav.isVisible().catch(() => false);
  record(scope, `${label} primary navigation is visible`, visible, '', 'P2');
  if (!visible) return;
  const fit = await nav.locator('a').evaluateAll((links) => links.map((link) => {
    const rect = link.getBoundingClientRect();
    const labelNode = link.querySelector('span');
    return {
      href: link.getAttribute('href'),
      horizontal: rect.left >= -1 && rect.right <= window.innerWidth + 1,
      labelFits: !labelNode || labelNode.scrollWidth <= labelNode.clientWidth + 1,
    };
  }));
  record(scope, `${label} critical navigation is not horizontally clipped`, fit.every((item) => item.horizontal && item.labelFits), JSON.stringify(fit), 'P2');
}
async function chooseAppearance(page, label, expected) {
  const group = page.locator('[role="group"][aria-label="Appearance"]:visible').first();
  await group.waitFor({ state: 'visible', timeout: 10000 });
  await group.getByRole('button', { name: label, exact: true }).click();
  await page.waitForFunction(({ preference, dark }) => {
    const root = document.documentElement;
    return window.localStorage.getItem('talibon.appearance') === preference
      && root.dataset.appearance === preference
      && root.classList.contains('dark') === dark;
  }, { preference: expected, dark: expected === 'dark' });
}
async function saveShot(page, scope, fileName, fullPage) {
  const relative = `screenshots/${fileName}`;
  await page.screenshot({ path: path.join(OUT, relative), fullPage, animations: 'disabled' });
  report.screenshots.push({ scope, file: relative, fullPage });
  record(scope, `screenshot generated: ${fileName}`, true, relative, 'P2');
}

async function capturePublic(browser) {
  const scope = 'public';
  const context = await browser.newContext({ colorScheme: 'light' });
  await context.addInitScript(() => window.localStorage.setItem('talibon.appearance', 'light'));
  const page = await context.newPage();
  const finishMonitor = monitor(page, scope);
  try {
    for (const viewport of PUBLIC_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const response = await page.goto(BASE, { waitUntil: 'networkidle' });
      record(scope, `${viewport.name} public route loads`, response?.status() === 200, `status=${response?.status()}`);
      for (const heading of ['Municipal Services', 'About Talibon', 'News & Notices', 'Public Documents', 'Projects & Programs']) {
        record(scope, `${viewport.name} renders ${heading}`, await page.getByRole('heading', { name: heading, exact: true }).isVisible(), heading, 'P2');
      }
      record(scope, `${viewport.name} hero landscape remains visible`, await page.locator('.public-hero-landscape').isVisible(), '', 'P2');
      record(scope, `${viewport.name} employee portal entry is visible`, await page.locator('a[href="/login"]').first().isVisible(), '', 'P2');
      await assertNoOverflow(page, scope, viewport.name);

      if (viewport.width < 1024) {
        const open = page.getByRole('button', { name: 'Open menu' });
        record(scope, `${viewport.name} public mobile menu control is visible`, await open.isVisible(), '', 'P2');
        await open.click();
        const nav = page.locator('nav[aria-label="Public navigation"]:visible');
        record(scope, `${viewport.name} public menu opens`, await nav.isVisible(), '', 'P2');
        const fits = await nav.locator('a').evaluateAll((links) => links.every((link) => link.scrollWidth <= link.clientWidth + 1));
        record(scope, `${viewport.name} public menu labels fit`, fits, '', 'P2');
        await page.getByRole('button', { name: 'Close menu' }).click();
        await page.getByRole('button', { name: 'Open menu' }).waitFor({ state: 'visible', timeout: 5000 });
        record(scope, `${viewport.name} public menu closes`, await page.locator('nav[aria-label="Public navigation"]:visible').count() === 0, '', 'P2');
      }

      await saveShot(page, scope, `public-${viewport.name}-viewport.png`, false);
      await saveShot(page, scope, `public-${viewport.name}-full.png`, true);
    }
  } catch (error) {
    record(scope, 'public evidence run completes', false, error?.stack || error?.message || String(error));
  } finally {
    finishMonitor();
    await context.close();
  }
}

async function captureRole(browser, role) {
  const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const finishMonitor = monitor(page, role.slug);
  try {
    await loginAndReachDashboard(page, role);
    const hardLoad = await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    record(role.slug, 'dashboard hard-load returns 200', hardLoad?.status() === 200, `status=${hardLoad?.status()}`);
    const experience = await readWorkspaceExperience(page, hardLoad);
    record(role.slug, `workspace identity is ${role.experience}`, experience === role.experience, `actual=${experience}`);
    for (const heading of role.headings) {
      record(role.slug, `V2 surface renders ${heading}`, await page.getByRole('heading', { name: heading, exact: true }).first().isVisible(), heading, 'P2');
    }

    for (const mode of ['light', 'dark']) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await chooseAppearance(page, mode === 'light' ? 'Light' : 'Dark', mode);
      await assertNoOverflow(page, role.slug, `desktop ${mode}`);
      await assertVisibleNavFits(page, role.slug, `desktop ${mode}`);
      await saveShot(page, role.slug, `${role.slug}-desktop-${mode}-viewport.png`, false);
      await saveShot(page, role.slug, `${role.slug}-desktop-${mode}-full.png`, true);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    for (const mode of ['light', 'dark']) {
      const open = page.getByRole('button', { name: 'Open navigation' });
      record(role.slug, `mobile ${mode} Open navigation control is visible`, await open.isVisible(), '', 'P2');
      await open.click();
      const nav = page.locator('nav[aria-label="Primary navigation"]:visible').first();
      await nav.waitFor({ state: 'visible', timeout: 10000 });
      record(role.slug, `mobile ${mode} drawer opens`, await nav.isVisible(), '', 'P2');
      await chooseAppearance(page, mode === 'light' ? 'Light' : 'Dark', mode);
      await assertVisibleNavFits(page, role.slug, `mobile ${mode} drawer`);
      await saveShot(page, role.slug, `${role.slug}-mobile-${mode}-drawer.png`, false);
      const close = page.locator('button[aria-label="Close navigation"]:visible').last();
      record(role.slug, `mobile ${mode} Close navigation control is visible`, await close.isVisible(), '', 'P2');
      await close.click();
      await open.waitFor({ state: 'visible', timeout: 5000 });
      record(role.slug, `mobile ${mode} drawer closes`, await page.locator('nav[aria-label="Primary navigation"]:visible').count() === 0, '', 'P2');
      await assertNoOverflow(page, role.slug, `mobile ${mode}`);
      await saveShot(page, role.slug, `${role.slug}-mobile-${mode}-viewport.png`, false);
      await saveShot(page, role.slug, `${role.slug}-mobile-${mode}-full.png`, true);
    }
  } catch (error) {
    record(role.slug, 'authenticated visual evidence run completes', false, error?.stack || error?.message || String(error));
  } finally {
    finishMonitor();
    await context.close();
  }
}

function escapeHtml(value) {
  return clean(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}
function htmlReport(snapshot) {
  const checks = snapshot.checks.map((check) => `<tr><td>${escapeHtml(check.ok ? 'PASS' : 'FAIL')}</td><td>${escapeHtml(check.scope)}</td><td>${escapeHtml(check.name)}</td><td>${escapeHtml(check.details)}</td></tr>`).join('');
  const shots = snapshot.screenshots.map((shot) => `<figure><img src="${escapeHtml(shot.file)}" alt="${escapeHtml(shot.scope)}"><figcaption>${escapeHtml(shot.file)}</figcaption></figure>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Talibon V2 Visual Acceptance Evidence</title><style>body{font:14px/1.5 system-ui;margin:28px;color:#172033}code{word-break:break-all}table{border-collapse:collapse;width:100%;margin:20px 0}th,td{border:1px solid #ccd5e0;padding:8px;text-align:left;vertical-align:top}th{background:#f3f6fa}figure{margin:0 0 24px}img{max-width:100%;border:1px solid #ccd5e0}figcaption{margin-top:6px;color:#526170}.state{font-weight:700}</style></head><body><h1>Talibon V2 Visual Acceptance Evidence</h1><p><strong>Target ref:</strong> <code>${escapeHtml(snapshot.targetRef)}</code><br><strong>Target SHA:</strong> <code>${escapeHtml(snapshot.targetSha)}</code></p><p class="state">${escapeHtml(snapshot.automatedState)} · ${escapeHtml(snapshot.visualState)}</p><p>Automated checks cover objective browser conditions only. Human review of the captured screenshots is required before any visual/design acceptance decision.</p><h2>Checks</h2><table><thead><tr><th>State</th><th>Scope</th><th>Check</th><th>Details</th></tr></thead><tbody>${checks}</tbody></table><h2>Screenshots</h2>${shots}</body></html>`;
}
async function finalizeReport() {
  const failuresBeforeSecretCheck = report.checks.filter((check) => !check.ok).length;
  report.automatedState = failuresBeforeSecretCheck === 0 ? 'AUTOMATED_CHECKS_PASS' : 'AUTOMATED_CHECKS_FAIL';
  report.completedAt = new Date().toISOString();
  report.summary = {
    passed: report.checks.filter((check) => check.ok).length,
    failed: failuresBeforeSecretCheck,
    diagnostics: report.diagnostics.length,
    screenshots: report.screenshots.length,
  };

  let snapshot = sanitize(report);
  let json = JSON.stringify(snapshot, null, 2);
  let html = htmlReport(snapshot);
  const secretLeak = [...sensitiveValues].some((secret) => secret && (json.includes(secret) || html.includes(secret)));
  record('report', 'known runtime secrets are absent from JSON/HTML reports', !secretLeak, secretLeak ? 'known secret value detected' : '', 'P0');

  const failures = report.checks.filter((check) => !check.ok).length;
  report.automatedState = failures === 0 ? 'AUTOMATED_CHECKS_PASS' : 'AUTOMATED_CHECKS_FAIL';
  report.summary = {
    passed: report.checks.filter((check) => check.ok).length,
    failed: failures,
    diagnostics: report.diagnostics.length,
    screenshots: report.screenshots.length,
  };
  snapshot = sanitize(report);
  json = JSON.stringify(snapshot, null, 2);
  html = htmlReport(snapshot);
  await fs.writeFile(`${OUT}/v2-visual-report.json`, json, 'utf8');
  await fs.writeFile(`${OUT}/v2-visual-report.html`, html, 'utf8');
  console.log(`${report.automatedState} ${report.visualState} checks=${report.checks.length} failures=${failures} screenshots=${report.screenshots.length}`);
  if (failures > 0) process.exitCode = 1;
}

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(SCREENSHOTS, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ headless: true });
  await capturePublic(browser);
  for (const role of ROLES) await captureRole(browser, role);
} catch (error) {
  record('runtime', 'browser harness completes', false, error?.stack || error?.message || String(error));
  diagnostic('runtime', 'fatal', error?.message || String(error));
} finally {
  await browser?.close().catch(() => {});
  await finalizeReport();
}
