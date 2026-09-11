import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:8000';
const PASSWORD = process.env.QA_DEMO_PASSWORD;
if (!PASSWORD) throw new Error('QA_DEMO_PASSWORD is required');

const STORAGE_KEY = 'talibon.sidebar.collapsed';
const OUT = 'storage/app/qa/s1-sidebar-readiness-report.json';
const SHOTS = 'storage/app/qa/s1-sidebar-screenshots';
const report = {
  generatedAt: new Date().toISOString(),
  completed: false,
  checks: [],
  screenshots: [],
  diagnostics: [],
  failure: null,
};
let stage = 'bootstrap';
let pageRef = null;
const runtime = [];

function safePath(value) {
  try { return new URL(value, BASE).pathname; } catch { return '[unavailable]'; }
}
function check(name, ok, details = '') {
  const row = { name: `S1: ${name}`, ok: Boolean(ok), details: String(details ?? '') };
  report.checks.push(row);
  if (!row.ok) throw new Error(`${row.name}: ${row.details}`);
}
function checkpoint(value, page = pageRef) {
  stage = value;
  if (page) pageRef = page;
}
function monitor(page) {
  page.on('pageerror', (error) => runtime.push({ type: 'pageerror', path: safePath(page.url()), details: error.message }));
  page.on('response', (response) => {
    if (response.status() >= 500) runtime.push({ type: 'server-5xx', path: safePath(response.url()), details: String(response.status()) });
  });
}
async function write() {
  await fs.mkdir('storage/app/qa', { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(report, null, 2));
}
async function shot(page, name) {
  await fs.mkdir(SHOTS, { recursive: true });
  const path = `${SHOTS}/${name}`;
  await page.screenshot({ path, animations: 'disabled', fullPage: false });
  report.screenshots.push(path);
}
async function shellMetrics(page) {
  return page.locator('aside:visible').first().evaluate((aside) => {
    const shell = aside.parentElement;
    const main = shell?.querySelector(':scope > main');
    const asideRect = aside.getBoundingClientRect();
    const mainRect = main?.getBoundingClientRect();
    return {
      sidebarWidth: Math.round(asideRect.width),
      mainWidth: mainRect ? Math.round(mainRect.width) : null,
      viewport: window.innerWidth,
    };
  });
}
async function waitForSidebarWidth(page, min, max) {
  await page.waitForFunction(({ min, max }) => {
    const aside = Array.from(document.querySelectorAll('aside')).find((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && rect.width > 0 && rect.height > 0;
    });
    if (!aside) return false;
    const width = aside.getBoundingClientRect().width;
    return width >= min && width <= max;
  }, { min, max });
}
async function loginEmployee(page) {
  checkpoint('employee login', page);
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
  await page.getByLabel('Email').fill('employee@talibon.demo');
  await page.getByLabel('Password').fill(PASSWORD);
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/dashboard'),
    page.getByRole('button', { name: 'Sign In' }).click(),
  ]);
  check('ordinary employee login reaches dashboard without privileged MFA flow', safePath(page.url()) === '/dashboard', safePath(page.url()));
}

await write();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  pageRef = page;
  monitor(page);

  await loginEmployee(page);

  checkpoint('expanded desktop shell', page);
  await waitForSidebarWidth(page, 235, 260);
  const expanded = await shellMetrics(page);
  check('desktop defaults to expanded sidebar', expanded.sidebarWidth >= 235 && expanded.sidebarWidth <= 260, JSON.stringify(expanded));
  check('expanded desktop shows Collapse navigation control', await page.getByRole('button', { name: 'Collapse navigation', exact: true }).isVisible(), 'Collapse navigation not visible');
  check('expanded desktop toggle exposes expanded state', await page.getByRole('button', { name: 'Collapse navigation', exact: true }).getAttribute('aria-expanded') === 'true');
  check('expanded desktop municipal identity is visible', await page.locator('aside:visible').getByText('ONE TALIBON', { exact: true }).isVisible(), 'ONE TALIBON not visible');
  check('expanded desktop preference starts unset', await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY) === null, 'storage key unexpectedly preset');
  await shot(page, 's1-expanded-desktop.png');

  checkpoint('collapsed desktop shell', page);
  await page.getByRole('button', { name: 'Collapse navigation', exact: true }).click();
  await page.waitForFunction((key) => window.localStorage.getItem(key) === 'true', STORAGE_KEY);
  await waitForSidebarWidth(page, 60, 84);
  const collapsed = await shellMetrics(page);
  check('desktop collapses to compact sidebar', collapsed.sidebarWidth >= 60 && collapsed.sidebarWidth <= 84, JSON.stringify(collapsed));
  check('collapsed desktop reclaims workspace width', expanded.mainWidth !== null && collapsed.mainWidth !== null && collapsed.mainWidth - expanded.mainWidth >= 150, JSON.stringify({ expanded, collapsed }));
  const expandButton = page.getByRole('button', { name: 'Expand navigation', exact: true });
  check('collapsed desktop shows Expand navigation control', await expandButton.isVisible(), 'Expand navigation not visible');
  check('collapsed desktop toggle exposes collapsed state', await expandButton.getAttribute('aria-expanded') === 'false');

  const desktopNav = page.locator('aside:visible nav[aria-label="Primary navigation"]').first();
  const dashboardLink = desktopNav.locator('a[href="/dashboard"]').first();
  const myWorkLink = desktopNav.locator('a[href="/transactions"]').first();
  check('collapsed active destination remains marked current', await dashboardLink.getAttribute('aria-current') === 'page', await dashboardLink.getAttribute('aria-current'));
  check('collapsed navigation retains accessible My Work name', await myWorkLink.getAttribute('aria-label') === 'My Work', await myWorkLink.getAttribute('aria-label'));
  check('collapsed My Work label is visually removed from compact composition', (await myWorkLink.innerText()).trim() === '', JSON.stringify({ text: (await myWorkLink.innerText()).trim() }));
  const memoLink = desktopNav.locator('a[href="/memoranda"]').first();
  if (await memoLink.count()) {
    const memoLabel = await memoLink.getAttribute('aria-label');
    check('collapsed Memoranda keeps an accessible label', Boolean(memoLabel?.startsWith('Memoranda')), memoLabel);
    const badge = memoLink.locator('span[aria-hidden="true"]');
    if (memoLabel?.includes('unread')) check('collapsed unread Memoranda badge remains visible', await badge.isVisible(), memoLabel);
  }

  const identity = page.locator('aside:visible [role="img"][aria-label^="Signed in as "]').first();
  check('collapsed desktop exposes compact authenticated identity', await identity.isVisible(), await identity.getAttribute('aria-label'));
  const appearance = page.locator('aside:visible [role="group"][aria-label="Appearance"]').first();
  check('collapsed desktop keeps compact Appearance control', await appearance.isVisible(), 'Appearance control hidden');
  for (const label of ['System', 'Light', 'Dark']) {
    check(`collapsed Appearance ${label} control retains accessible name`, await appearance.getByRole('button', { name: label, exact: true }).isVisible(), label);
  }
  check('collapsed desktop keeps icon-only Sign out accessible', await page.locator('aside:visible').getByRole('button', { name: 'Sign out', exact: true }).isVisible(), 'Sign out not visible');
  await appearance.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.waitForFunction(() => document.documentElement.classList.contains('dark') && document.documentElement.dataset.appearance === 'dark');
  check('compact Appearance control still changes theme', await page.evaluate(() => document.documentElement.classList.contains('dark')) === true, 'dark mode not applied');
  await appearance.getByRole('button', { name: 'Light', exact: true }).click();
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark') && document.documentElement.dataset.appearance === 'light');
  await shot(page, 's1-collapsed-desktop.png');

  checkpoint('collapsed state across Inertia navigation', page);
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/transactions'),
    myWorkLink.click(),
  ]);
  await waitForSidebarWidth(page, 60, 84);
  check('collapsed preference survives Inertia navigation', await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY) === 'true');
  check('collapsed composition survives Inertia navigation', await page.getByRole('button', { name: 'Expand navigation', exact: true }).isVisible(), safePath(page.url()));

  checkpoint('collapsed state across hard reload', page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForSidebarWidth(page, 60, 84);
  check('collapsed preference survives hard reload', await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY) === 'true');
  check('collapsed composition restores after hard reload', await page.getByRole('button', { name: 'Expand navigation', exact: true }).isVisible(), safePath(page.url()));

  checkpoint('mobile independence', page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  check('desktop collapsed preference remains stored on mobile', await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY) === 'true');
  const openMobile = page.getByRole('button', { name: 'Open navigation', exact: true });
  check('mobile Open navigation control remains available', await openMobile.isVisible(), 'Open navigation hidden');
  await openMobile.click();
  const mobileNav = page.locator('nav[aria-label="Primary navigation"]:visible').first();
  await mobileNav.waitFor({ state: 'visible' });
  check('mobile drawer renders full My Work label despite desktop collapse preference', await mobileNav.getByText('My Work', { exact: true }).isVisible(), 'My Work text hidden');
  check('mobile drawer renders full municipal identity', await page.getByText('ONE TALIBON', { exact: true }).last().isVisible(), 'ONE TALIBON text hidden in mobile drawer');
  check('mobile drawer does not expose desktop collapse control', await page.locator('button[aria-label="Collapse navigation"]:visible, button[aria-label="Expand navigation"]:visible').count() === 0, 'desktop collapse control leaked into mobile drawer');
  const mobileMetrics = await page.evaluate(() => ({ viewport: innerWidth, root: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  check('mobile drawer has no root horizontal overflow', mobileMetrics.root <= mobileMetrics.viewport + 1 && mobileMetrics.body <= mobileMetrics.viewport + 1, JSON.stringify(mobileMetrics));
  await shot(page, 's1-mobile-drawer-desktop-pref-collapsed.png');
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click();

  checkpoint('desktop expand restore', page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForSidebarWidth(page, 60, 84);
  await page.getByRole('button', { name: 'Expand navigation', exact: true }).click();
  await page.waitForFunction((key) => window.localStorage.getItem(key) === 'false', STORAGE_KEY);
  await waitForSidebarWidth(page, 235, 260);
  const restored = await shellMetrics(page);
  check('desktop expands back to full sidebar', restored.sidebarWidth >= 235 && restored.sidebarWidth <= 260, JSON.stringify(restored));
  check('expanded preference is persisted as false', await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY) === 'false');
  check('Collapse navigation control returns after expansion', await page.getByRole('button', { name: 'Collapse navigation', exact: true }).isVisible(), 'Collapse navigation not restored');

  report.diagnostics = runtime;
  check('S1 shell runtime has no page errors or server 5xx', runtime.length === 0, JSON.stringify(runtime));
  check('exact S1 screenshot set captured', report.screenshots.length === 3, JSON.stringify(report.screenshots));
  report.completed = true;
  report.failure = null;
  await write();
  console.log(`S1_BROWSER_QA_PASS checks=${report.checks.length} screenshots=${report.screenshots.length} failures=0`);
  await context.close();
} catch (error) {
  report.completed = false;
  report.failure = {
    stage,
    path: pageRef ? safePath(pageRef.url()) : null,
    error: String(error?.stack || error),
  };
  report.diagnostics = runtime;
  await write();
  console.error(`S1_BROWSER_QA_FAIL stage=${stage} path=${report.failure.path || '[none]'} error=${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
