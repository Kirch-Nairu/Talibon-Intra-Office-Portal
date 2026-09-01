import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:8000';
const PASSWORD = process.env.QA_DEMO_PASSWORD;
if (!PASSWORD) throw new Error('QA_DEMO_PASSWORD is required');

const report = {
  generatedAt: new Date().toISOString(),
  completed: false,
  checks: [],
  accounts: [],
  diagnostics: [],
  notes: [
    'Ephemeral GitHub Actions runtime; PostgreSQL is fresh-seeded synthetic prototype data.',
    'Demo password is generated and masked at runtime and is never written to this report.',
    'budget@talibon.demo is seeded as department_head, so it is validated as that authoritative role.',
  ],
};

const sensitiveValues = new Set([PASSWORD]);
let currentStage = 'bootstrap';
let currentUrl = BASE;
let activePage = null;

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
const reportJson = () => JSON.stringify(sanitize(report), null, 2);
function safePath(value) {
  try {
    return new URL(value, BASE).pathname;
  } catch {
    return '[unavailable]';
  }
}
function safeUrl(value) {
  try {
    const url = new URL(value, BASE);
    return `${url.origin}${url.pathname}`;
  } catch {
    return '[unavailable]';
  }
}
function diagnostic(type, details, page = activePage) {
  const url = page?.url?.() || currentUrl;
  const path = safePath(url);
  const onSensitiveMfaPath = path.startsWith('/security/mfa/');
  report.diagnostics.push({
    at: new Date().toISOString(),
    stage: clean(currentStage),
    path: clean(path),
    type: clean(type),
    details: onSensitiveMfaPath ? '[redacted on sensitive MFA route]' : clean(details),
  });
  if (report.diagnostics.length > 100) report.diagnostics.shift();
}
function checkpoint(stage, page = activePage) {
  currentStage = stage;
  if (page) currentUrl = page.url();
}
function setActivePage(page, stage) {
  activePage = page;
  checkpoint(stage, page);
}
function clearActivePage(page) {
  if (activePage === page) {
    currentUrl = page.url();
    activePage = null;
  }
}
function record(name, ok, details = '', severity = null) {
  const row = { name: clean(name), ok: Boolean(ok), details: clean(details), severity };
  report.checks.push(row);
  if (!row.ok) {
    diagnostic('check-failure', `${row.name}: ${row.details}`);
    throw new Error(`${row.name}: ${row.details}`);
  }
}
const pathOf = (page) => new URL(page.url()).pathname;
const date = (days = 0) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

async function waitForPath(page, expectedPath, timeout = 15000) {
  await page.waitForFunction(
    (path) => window.location.pathname === path,
    expectedPath,
    { timeout },
  );
  currentUrl = page.url();
}
async function waitForAnyPath(page, expectedPaths, timeout = 15000) {
  await page.waitForFunction(
    (paths) => paths.includes(window.location.pathname),
    expectedPaths,
    { timeout },
  );
  currentUrl = page.url();
}

function decodeBase32(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of input.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase()) {
    const i = alphabet.indexOf(char);
    if (i < 0) throw new Error('Invalid base32 MFA secret');
    bits += i.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
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

async function text(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}
async function waitForBodyText(page, value, timeout = 10000) {
  try {
    await page.waitForFunction(
      (expected) => document.body?.innerText.includes(expected),
      value,
      { timeout },
    );
    return true;
  } catch {
    const state = await page.evaluate(() => {
      const root = document.getElementById('app');
      let inertiaComponent = null;
      try {
        inertiaComponent = root?.dataset?.page ? JSON.parse(root.dataset.page).component ?? null : null;
      } catch {}
      return {
        readyState: document.readyState,
        title: document.title,
        bodyTextLength: document.body?.innerText?.length ?? 0,
        appPresent: Boolean(root),
        appChildElementCount: root?.childElementCount ?? null,
        appTextLength: root?.innerText?.length ?? null,
        inertiaComponent,
      };
    }).catch((error) => ({ evaluationError: String(error?.message || error) }));
    diagnostic('presentation-timeout', JSON.stringify({ expected: value, ...state }), page);
    return false;
  }
}
function monitor(page, role) {
  const errors = [];
  page.on('pageerror', (error) => {
    const message = `pageerror ${error.message}`;
    errors.push(message);
    diagnostic('pageerror', message, page);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostic('console.error', message.text(), page);
  });
  page.on('response', (response) => {
    if (response.status() >= 500) {
      const message = `${response.status()} ${safePath(response.url())}`;
      errors.push(message);
      diagnostic('server-5xx', message, page);
    }
    const resourceType = response.request().resourceType();
    if (response.status() >= 400 && ['script', 'stylesheet'].includes(resourceType)) {
      diagnostic('asset-http-error', `${response.status()} ${resourceType} ${safePath(response.url())}`, page);
    }
  });
  page.on('requestfailed', (request) => {
    diagnostic(
      'requestfailed',
      `${request.resourceType()} ${safePath(request.url())} ${request.failure()?.errorText || 'request failed'}`,
      page,
    );
  });
  return () => record(`${role}: no page errors or 5xx`, errors.length === 0, errors.join(' | '), 'P1');
}
async function go(page, route, { status = 200, has, lacks = [], label = route, role = 'platform' } = {}) {
  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  currentUrl = page.url();
  record(`${role}: ${label} status`, response?.status() === status, `expected=${status} actual=${response?.status()} final=${page.url()}`, response?.status() >= 500 ? 'P1' : 'P0');
  if (status === 200) {
    if (has) {
      const present = await waitForBodyText(page, has);
      record(`${role}: ${label} presentation`, present, `missing ${has}`, 'P2');
    }
    const body = await text(page);
    for (const value of lacks) record(`${role}: ${label} excludes ${value}`, !body.includes(value), `unexpected ${value}`, 'P0');
  }
}
async function deny(page, route, role, label = route) {
  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  currentUrl = page.url();
  record(`${role}: ${label} denied`, [403, 404].includes(response?.status()), `status=${response?.status()} final=${page.url()}`, 'P0');
}
async function overflow(page, label) {
  const m = await page.evaluate(() => ({
    viewport: window.innerWidth,
    root: document.documentElement.scrollWidth,
    body: document.body?.scrollWidth || 0,
  }));
  record(`${label}: no page horizontal overflow`, m.root <= m.viewport + 1 && m.body <= m.viewport + 1, JSON.stringify(m), 'P2');
}
async function responsive(page, route, role, label) {
  for (const v of [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 1280, height: 800, name: 'laptop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 390, height: 844, name: 'mobile' },
  ]) {
    await page.setViewportSize(v);
    const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    currentUrl = page.url();
    record(`${role}: ${label} ${v.name} loads`, response?.status() === 200, `status=${response?.status()}`, 'P1');
    await overflow(page, `${role}: ${label} ${v.name}`);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
}

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await Promise.all([
    waitForAnyPath(page, ['/dashboard', '/security/mfa/enroll', '/security/mfa/challenge']),
    page.getByRole('button', { name: 'Sign In' }).click(),
  ]);
  return pathOf(page);
}
async function enroll(page) {
  const secret = (await page.locator('code').first().innerText()).trim();
  rememberSensitive(secret);
  record('MFA: setup secret available only in enrollment flow', secret.length >= 16, 'enrollment secret missing', 'P1');
  await page.getByLabel('Six-digit verification code').fill(totp(secret));
  await Promise.all([
    waitForPath(page, '/security/mfa/recovery-codes'),
    page.getByRole('button', { name: /Confirm MFA enrollment/i }).click(),
  ]);
  const codes = (await page.locator('pre').innerText()).trim().split(/\s+/).filter(Boolean);
  rememberSensitive(codes);
  record('MFA: recovery codes produced', codes.length > 0, 'no recovery codes rendered', 'P1');
  return { secret, codes };
}
async function continuePortal(page, expectedPath) {
  await Promise.all([
    waitForPath(page, expectedPath),
    page.getByRole('link', { name: /Continue to portal/i }).click(),
  ]);
  record(`MFA: continuation returns to intended ${expectedPath}`, pathOf(page) === expectedPath, `actual=${pathOf(page)}`, 'P1');
}
async function loginAndEnroll(page, email, expectedPath = '/dashboard') {
  const route = await login(page, email);
  if (route === '/security/mfa/enroll') {
    const mfa = await enroll(page);
    await continuePortal(page, expectedPath);
    return mfa;
  }
  record(`${email}: fresh privileged login requires enrollment`, route !== '/security/mfa/challenge', `unexpected ${route}`, 'P0');
  return null;
}
async function logout(page) {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' }).catch(() => null);
  const button = page.getByRole('button', { name: /Sign out/i });
  await button.first().waitFor({ state: 'visible' });
  if (await button.count()) {
    await Promise.all([waitForPath(page, '/login'), button.first().click()]);
  }
}
async function records(page, query, visible, role, expectedMarker = query) {
  await page.goto(`${BASE}/records?record_type=travel_order&search=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
  currentUrl = page.url();
  await waitForBodyText(page, 'Records Registry');
  const body = await text(page);
  const markerVisible = visible ? await waitForBodyText(page, expectedMarker) : body.includes(expectedMarker);
  record(
    `${role}: Records ${visible ? 'shows' : 'hides'} result for ${query}`,
    visible ? markerVisible : !markerVisible,
    visible ? `authorized result marker missing: ${expectedMarker}` : `hidden Travel Order marker leaked: ${expectedMarker}`,
    visible ? 'P1' : 'P0',
  );
}

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZPp8AAAAASUVORK5CYII=', 'base64');
async function createOrder(page, order) {
  await go(page, '/travel-orders/create', { has: 'Record approved Travel Order', role: 'mayor_approver', label: 'create approved Travel Order' });
  await page.getByLabel('Official reference number').fill(order.ref);
  await page.getByLabel('Issuance date').fill(date());
  await page.getByLabel('Purpose / subject').fill(order.purpose);
  await page.getByLabel('Destination / location').fill(order.destination);
  await page.getByLabel('Responsible office').selectOption({ label: order.office });
  await page.getByLabel('Inclusive travel start').fill(date(1));
  await page.getByLabel('Inclusive travel end').fill(date(2));
  await page.getByLabel('Issued-to employee numbers').fill(order.employee);
  if (order.evidence) {
    await page.locator('input[type=file]').first().setInputFiles({ name: 'synthetic-qa-evidence.png', mimeType: 'image/png', buffer: png });
  }
  await Promise.all([
    page.waitForURL(/\/travel-orders\/[0-9a-f-]+$/i),
    page.getByRole('button', { name: 'Record approved order' }).click(),
  ]);
  currentUrl = page.url();
  record(`mayor_approver: created ${order.ref}`, await waitForBodyText(page, order.ref), 'new Travel Order did not render', 'P1');
  if (order.evidence) {
    const evidenceName = 'synthetic-qa-evidence.png';
    record('mayor_approver: private evidence metadata visible', await waitForBodyText(page, evidenceName), 'uploaded evidence metadata did not render', 'P1');
    const href = await page.getByRole('link', { name: /Download/i }).first().getAttribute('href');
    record('mayor_approver: private evidence uses protected download route', Boolean(href?.startsWith('/documents/') && href.endsWith('/download')), `href=${href}`, 'P0');
    const download = href ? await page.request.get(`${BASE}${href}`) : null;
    record('mayor_approver: private evidence authorized download succeeds', download?.status() === 200, `status=${download?.status()}`, 'P1');
    order.evidenceUrl = href;
  }
  return pathOf(page);
}
async function terminate(page, route, status) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('New status').selectOption(status);
  await page.getByLabel('Remarks').fill(`Synthetic QA ${status}`);
  await page.getByRole('button', { name: 'Update status' }).click();
  await page.waitForTimeout(300);
  currentUrl = page.url();
  record(`mayor_approver: ${status} status recorded`, (await text(page)).includes(status === 'completed' ? 'Completed' : 'Cancelled'), 'terminal status not visible', 'P1');
  record('mayor_approver: terminal Travel Order cannot transition again', await page.getByRole('button', { name: 'Update status' }).count() === 0, 'terminal action form remained', 'P0');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const run = Date.now().toString(36).toUpperCase();
    const orders = {
      eng: { ref: `QA-ENG-${run}`, purpose: 'Synthetic engineering coordination visit', destination: 'Tagbilaran City, Bohol', office: 'Engineering', employee: 'DEMO-0003', evidence: true },
      mpdo: { ref: `QA-MPDO-${run}`, purpose: 'Synthetic planning coordination visit', destination: 'Tubigon, Bohol', office: 'Planning', employee: 'DEMO-0007' },
      budget: { ref: `QA-BUD-${run}`, purpose: 'Synthetic budget coordination visit', destination: 'Ubay, Bohol', office: 'Budget', employee: 'DEMO-0004' },
    };
    const paths = {};

    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage(); setActivePage(page, 'guest public'); const cleanRun = monitor(page, 'guest');
      await go(page, '/', { has: 'ONE TALIBON', lacks: [PASSWORD, 'DEMO-0001', 'admin@talibon.demo'], role: 'guest', label: 'public home' });
      await go(page, '/activate-account', { has: 'Activate', role: 'guest', label: 'activation information' });
      await go(page, '/login', { has: 'Employee Portal', lacks: [PASSWORD], role: 'guest', label: 'login' });
      checkpoint('guest responsive public', page);
      await responsive(page, '/', 'guest', 'public home'); cleanRun(); clearActivePage(page); await ctx.close();
    }

    let adminMfa;
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'admin login'); const cleanRun = monitor(page, 'system_admin');
      record('system_admin: password login reaches MFA enrollment', await login(page, 'admin@talibon.demo') === '/security/mfa/enroll', page.url(), 'P0');
      checkpoint('admin MFA bypass', page);
      await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
      record('system_admin: direct admin bypass redirects to MFA', pathOf(page).startsWith('/security/mfa/'), page.url(), 'P0');
      checkpoint('admin enrollment', page);
      await page.goto(`${BASE}/security/mfa/enroll`, { waitUntil: 'domcontentloaded' });
      adminMfa = await enroll(page);
      const recovery = adminMfa.codes[0];
      checkpoint('admin intended continuation', page);
      await continuePortal(page, '/admin');
      checkpoint('admin sensitive history', page);
      await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null);
      record('system_admin: browser back does not replay one-time recovery code', !(await text(page)).includes(recovery), 'recovery code replayed', 'P0');
      checkpoint('admin workspace', page);
      await go(page, '/admin', { has: 'System Administration', role: 'system_admin' });
      await go(page, '/departments', { has: 'Office & Routing Directory', role: 'system_admin' });
      await deny(page, '/travel-orders/create', 'system_admin');
      await responsive(page, '/admin', 'system_admin', 'admin workspace');
      await logout(page);

      checkpoint('admin recovery-code challenge', page);
      record('system_admin: subsequent password login reaches MFA challenge', await login(page, 'admin@talibon.demo') === '/security/mfa/challenge', page.url(), 'P0');
      const good = totp(adminMfa.secret);
      const wrong = good.slice(0, 5) + ((Number(good[5]) + 1) % 10);
      await page.getByLabel('Authenticator code').fill(wrong);
      await page.getByRole('button', { name: 'Verify and continue' }).click();
      await page.getByText('The verification code could not be accepted.').waitFor();
      record('system_admin: incorrect MFA code rejected', pathOf(page) === '/security/mfa/challenge', page.url(), 'P0');
      await page.getByLabel('One-time recovery code').fill(recovery);
      await Promise.all([waitForPath(page, '/dashboard'), page.getByRole('button', { name: 'Use recovery code' }).click()]);
      await logout(page);
      await login(page, 'admin@talibon.demo');
      await page.getByLabel('One-time recovery code').fill(recovery);
      await page.getByRole('button', { name: 'Use recovery code' }).click();
      await page.getByText('The verification code could not be accepted.').waitFor();
      record('system_admin: recovery code is one-time', pathOf(page) === '/security/mfa/challenge', page.url(), 'P0');
      checkpoint('admin TOTP challenge', page);
      await page.getByLabel('Authenticator code').fill(totp(adminMfa.secret));
      await Promise.all([waitForPath(page, '/dashboard'), page.getByRole('button', { name: 'Verify and continue' }).click()]);
      cleanRun(); report.accounts.push({ email: 'admin@talibon.demo', role: 'system_admin', result: 'MFA enrollment/challenge/recovery verified' });
      await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'mayor workspace'); const cleanRun = monitor(page, 'mayor_approver');
      await loginAndEnroll(page, 'mayor@talibon.demo');
      await go(page, '/dashboard', { role: 'mayor_approver', label: 'executive dashboard' });
      await go(page, '/mayor-office', { role: 'mayor_approver', label: "Mayor's Office" });
      await go(page, '/records', { has: 'Records', role: 'mayor_approver' });
      await go(page, '/reports', { role: 'mayor_approver' });
      checkpoint('mayor Travel Order mutations', page);
      paths.eng = await createOrder(page, orders.eng);
      paths.mpdo = await createOrder(page, orders.mpdo);
      paths.budget = await createOrder(page, orders.budget);
      await terminate(page, paths.eng, 'completed');
      await terminate(page, paths.budget, 'cancelled');
      await records(page, orders.eng.ref, true, 'mayor_approver');
      await records(page, orders.mpdo.destination, true, 'mayor_approver');
      await records(page, orders.budget.employee, true, 'mayor_approver', orders.budget.ref);
      await responsive(page, '/travel-orders', 'mayor_approver', 'Travel Order registry');
      cleanRun(); report.accounts.push({ email: 'mayor@talibon.demo', role: 'mayor_approver', result: 'executive/read/mutation/terminal behavior verified' });
      await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'admin post-data non-expansion'); const cleanRun = monitor(page, 'system_admin-post-data');
      await login(page, 'admin@talibon.demo');
      await page.getByLabel('Authenticator code').fill(totp(adminMfa.secret));
      await Promise.all([waitForPath(page, '/dashboard'), page.getByRole('button', { name: 'Verify and continue' }).click()]);
      await go(page, '/travel-orders', { has: 'Approved Travel Orders', role: 'system_admin' });
      const body = await text(page);
      for (const order of Object.values(orders)) record(`system_admin: registry hides ${order.ref}`, !body.includes(order.ref), 'Travel Order content leaked', 'P0');
      await records(page, orders.eng.ref, false, 'system_admin');
      await deny(page, paths.eng, 'system_admin', 'Travel Order detail');
      if (orders.eng.evidenceUrl) await deny(page, orders.eng.evidenceUrl, 'system_admin', 'private Travel Order evidence');
      cleanRun(); await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'engineering workspace'); const cleanRun = monitor(page, 'engineering department_head');
      await loginAndEnroll(page, 'engineering@talibon.demo');
      await go(page, '/dashboard', { role: 'engineering department_head' });
      await go(page, '/transactions?view=office_queue', { has: 'Office Work', role: 'engineering department_head' });
      await go(page, '/transactions?view=staff_workload', { has: 'Staff Workload', role: 'engineering department_head' });
      await go(page, '/transactions?view=escalations', { has: 'Escalations', role: 'engineering department_head' });
      await go(page, '/departments', { has: 'OWN-OFFICE OPERATIONAL WORKSPACE', role: 'engineering department_head' });
      await go(page, paths.eng, { has: orders.eng.ref, role: 'engineering department_head', label: 'own-office Travel Order' });
      await deny(page, paths.mpdo, 'engineering department_head', 'cross-office Travel Order');
      await deny(page, '/travel-orders/create', 'engineering department_head');
      await records(page, orders.eng.ref, true, 'engineering department_head');
      await records(page, orders.mpdo.ref, false, 'engineering department_head');
      await responsive(page, '/departments', 'engineering department_head', 'Department workspace');
      cleanRun(); report.accounts.push({ email: 'engineering@talibon.demo', role: 'department_head', result: 'own-office Dashboard/My Work/Department/Travel Order boundary verified' });
      await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'budget workspace'); const cleanRun = monitor(page, 'budget department_head');
      await loginAndEnroll(page, 'budget@talibon.demo');
      await go(page, '/departments', { has: 'OWN-OFFICE OPERATIONAL WORKSPACE', role: 'budget department_head' });
      await go(page, paths.budget, { has: orders.budget.ref, role: 'budget department_head' });
      await deny(page, paths.eng, 'budget department_head', 'cross-office Travel Order');
      await records(page, orders.budget.ref, true, 'budget department_head');
      await records(page, orders.mpdo.ref, false, 'budget department_head');
      cleanRun(); report.accounts.push({ email: 'budget@talibon.demo', role: 'department_head', result: 'seeded authority verified; not reclassified as Department Staff' });
      await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'HR workspace'); const cleanRun = monitor(page, 'hr_officer');
      await loginAndEnroll(page, 'hr@talibon.demo');
      await go(page, '/hris', { role: 'hr_officer', label: 'existing HR surface' });
      await go(page, '/hris/health-access', { status: 403, role: 'hr_officer', label: 'Health access grant-management boundary' });
      await deny(page, '/admin', 'hr_officer');
      await deny(page, paths.eng, 'hr_officer', 'municipal Travel Order detail');
      await deny(page, '/travel-orders/create', 'hr_officer');
      await records(page, orders.eng.ref, false, 'hr_officer');
      cleanRun(); report.accounts.push({ email: 'hr@talibon.demo', role: 'hr_officer', result: 'HR/private boundaries and Travel Order non-expansion verified' });
      await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'legislative workspace'); const cleanRun = monitor(page, 'legislative_staff');
      await loginAndEnroll(page, 'legislative@talibon.demo');
      await go(page, '/legislative-workspace', { role: 'legislative_staff', label: 'existing Legislative workspace' });
      await deny(page, '/admin', 'legislative_staff');
      await deny(page, paths.eng, 'legislative_staff', 'municipal Travel Order detail');
      await records(page, orders.eng.ref, false, 'legislative_staff');
      cleanRun(); report.accounts.push({ email: 'legislative@talibon.demo', role: 'legislative_staff', result: 'Legislative independence and Travel Order non-expansion verified' });
      await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage(); setActivePage(page, 'employee workspace'); const cleanRun = monitor(page, 'employee');
      record('employee: password login bypasses MFA by policy', await login(page, 'employee@talibon.demo') === '/dashboard', page.url(), 'P0');
      await go(page, '/transactions', { role: 'employee', label: 'personal My Work' });
      await deny(page, '/transactions?view=office_queue', 'employee', 'Department Head work view');
      await go(page, '/departments', { has: 'Office & Routing Directory', role: 'employee' });
      await deny(page, '/admin', 'employee');
      await go(page, paths.mpdo, { has: orders.mpdo.ref, role: 'employee', label: 'self Travel Order' });
      await deny(page, paths.eng, 'employee', 'coworker Travel Order');
      await records(page, orders.mpdo.ref, true, 'employee');
      await records(page, orders.eng.ref, false, 'employee');
      checkpoint('employee authenticated public isolation', page);
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
      const pub = await text(page);
      for (const value of ['employee@talibon.demo', 'Ana Flores', 'DEMO-0007', orders.mpdo.ref, orders.eng.ref]) {
        record(`employee: authenticated public home excludes ${value}`, !pub.includes(value), 'internal identity/data leaked to public page', 'P0');
      }
      await responsive(page, '/dashboard', 'employee', 'personal dashboard');
      cleanRun(); report.accounts.push({ email: 'employee@talibon.demo', role: 'employee', result: 'personal-only scope and public isolation verified' });
      await logout(page); clearActivePage(page); await ctx.close();
    }

    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage(); setActivePage(page, 'guest post-data public isolation'); const cleanRun = monitor(page, 'guest-post-data');
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
      const pub = await text(page);
      for (const order of Object.values(orders)) record(`guest: public home excludes ${order.ref}`, !pub.includes(order.ref), 'Travel Order leaked publicly', 'P0');
      record('guest: public home excludes runtime demo password', !pub.includes(PASSWORD), 'password leaked publicly', 'P0');
      await overflow(page, 'guest post-data mobile'); cleanRun(); clearActivePage(page); await ctx.close();
    }

    checkpoint('complete');
    report.completed = true;
    report.completedAt = new Date().toISOString();
  } finally {
    if (activePage) currentUrl = activePage.url();
    await Promise.all(browser.contexts().map((context) => context.close().catch(() => {})));
    await browser.close().catch(() => {});
  }

  await fs.mkdir('storage/app/qa', { recursive: true });
  await fs.writeFile('storage/app/qa/demo-readiness-report.json', reportJson());
  console.log(`DEMO_READINESS_QA_PASS checks=${report.checks.length} accounts=${report.accounts.length}`);
}

main().catch(async (error) => {
  const failure = {
    stage: currentStage,
    currentUrl: clean(safeUrl(currentUrl)),
    currentPath: clean(safePath(currentUrl)),
    error: clean(error?.message || error),
  };
  report.failure = failure;
  report.checks.push({ name: 'browser QA aborted', ok: false, details: failure.error, severity: 'P1' });
  try {
    await fs.mkdir('storage/app/qa', { recursive: true });
    await fs.writeFile('storage/app/qa/demo-readiness-report.json', reportJson());
  } catch {}
  console.error(`DEMO_READINESS_QA_FAIL stage=${clean(currentStage)} url=${clean(currentUrl)} error=${failure.error}`);
  process.exitCode = 1;
});
