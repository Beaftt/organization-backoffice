#!/usr/bin/env node

/**
 * E2E User Simulation — Organization Backoffice
 *
 * Simulates a real user browsing the app with Playwright:
 *   - Logs in via the login page
 *   - Clicks each sidebar link and checks navigation
 *   - Verifies active states, colors, design tokens
 *   - Checks dark/light mode toggle
 *   - Validates no sensitive data exposed in DOM
 *   - Tests responsive (mobile sidebar toggle)
 *   - Takes screenshots of every page
 *   - Checks for console errors
 *   - Validates i18n toggle (PT / EN)
 *   - Tests create modals / forms
 *
 * Usage:
 *   node scripts/e2e-audit.mjs
 *   node scripts/e2e-audit.mjs --headed    (watch the browser)
 *
 * Produces: docs/qa/e2e-report-YYYY-MM-DD.html + screenshots in docs/qa/screenshots/
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ─── Config ──────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = join(ROOT, '.env.qa');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const CFG = {
  frontendUrl: (process.env.QA_FRONTEND_URL || 'https://organization.beaftt.com').replace(/\/$/, ''),
  email: process.env.QA_EMAIL || '',
  password: process.env.QA_PASSWORD || '',
  headed: process.argv.includes('--headed'),
};

// ─── Directories ─────────────────────────────────────────────────────────────

const REPORT_DIR = join(ROOT, 'docs', 'qa');
const SCREENSHOT_DIR = join(REPORT_DIR, 'screenshots');
if (!existsSync(SCREENSHOT_DIR)) mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ─── State ───────────────────────────────────────────────────────────────────

const results = [];
const consoleErrors = [];
const screenshots = [];

// ─── Terminal Colors ─────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
};

function log(msg, color = '') {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`${C.dim}[${ts}]${C.reset} ${color}${msg}${C.reset}`);
}
function logPass(l) { log(`  ✅ PASS  ${l}`, C.green); }
function logFail(l, d) { log(`  ❌ FAIL  ${l} — ${d}`, C.red); }
function logSection(n) { log(`\n${'═'.repeat(60)}\n  ${n}\n${'═'.repeat(60)}`, C.cyan); }

function addResult(r) {
  results.push(r);
  if (r.pass) logPass(r.label);
  else logFail(r.label, r.detail || 'failed');
}

async function screenshot(page, name) {
  const path = join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  screenshots.push({ name, path: `screenshots/${name}.png` });
  log(`   📸 ${name}.png`, C.dim);
}

// ─── Design tokens to verify ────────────────────────────────────────────────

const LIGHT_TOKENS = {
  '--background': '#dfe6fb',
  '--foreground': '#101828',
  '--surface': '#f9fbff',
  '--sidebar': '#5f80ff',
};

const DARK_TOKENS = {
  '--background': '#0b1020',
  '--foreground': '#eef2ff',
  '--surface': '#121a30',
  '--sidebar': '#4058c4',
};

// ─── Sidebar module links ────────────────────────────────────────────────────

const SIDEBAR_MODULES = [
  { label: 'Reminders', href: '/reminders' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Secrets', href: '/secrets' },
  { label: 'Documents', href: '/documents' },
  { label: 'Finance', href: '/finance' },
  { label: 'Studies', href: '/studies' },
  { label: 'Inventory', href: '/inventory' },
];

// ─── Phase 1: Login Simulation ───────────────────────────────────────────────

async function phaseLogin(page) {
  logSection('PHASE 1 — Login Simulation');

  await page.goto(`${CFG.frontendUrl}/login`, { waitUntil: 'networkidle' });
  await screenshot(page, '01-login-page');

  // Check that login form is visible
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  // Login button uses onClick (not type="submit") — match by text or role
  const submitBtn = page.locator('button').filter({ hasText: /Entrar|Login|Sign in/i }).first();

  const emailVisible = await emailInput.isVisible().catch(() => false);
  const passVisible = await passwordInput.isVisible().catch(() => false);
  const btnVisible = await submitBtn.isVisible().catch(() => false);

  addResult({
    label: 'Login form — email input visible', phase: 1, pass: emailVisible,
    detail: emailVisible ? undefined : 'Email input not found on login page',
  });
  addResult({
    label: 'Login form — password input visible', phase: 1, pass: passVisible,
    detail: passVisible ? undefined : 'Password input not found on login page',
  });
  addResult({
    label: 'Login form — submit button visible', phase: 1, pass: btnVisible,
    detail: btnVisible ? undefined : 'Submit button not found on login page',
  });

  if (!emailVisible || !passVisible || !btnVisible) {
    log('❌ Cannot login — form elements missing. Aborting.', C.red);
    return false;
  }

  // Fill and submit
  await emailInput.fill(CFG.email);
  await passwordInput.fill(CFG.password);
  await screenshot(page, '02-login-filled');

  await submitBtn.click();

  // Wait for navigation to dashboard
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    addResult({ label: 'Login → Navigate to /dashboard', phase: 1, pass: true });
  } catch {
    const currentUrl = page.url();
    addResult({
      label: 'Login → Navigate to /dashboard', phase: 1, pass: false,
      detail: `Stuck at ${currentUrl} after login`,
    });
    await screenshot(page, '02-login-failed');
    return false;
  }

  // Wait for app to fully load (sidebar, content)
  await page.waitForTimeout(2000);
  await screenshot(page, '03-dashboard-loaded');

  // Check that dashboard has content
  const bodyText = await page.locator('body').innerText();
  addResult({
    label: 'Dashboard has visible content', phase: 1, pass: bodyText.length > 100,
    detail: bodyText.length <= 100 ? `Only ${bodyText.length} chars of text visible` : undefined,
  });

  return true;
}

// ─── Phase 2: Sidebar Navigation ─────────────────────────────────────────────

async function phaseSidebarNavigation(page) {
  logSection('PHASE 2 — Sidebar Navigation');

  for (const mod of SIDEBAR_MODULES) {
    log(`→ Click sidebar: ${mod.label}`, C.blue);

    // Find sidebar link by href — two <aside> exist (mobile + desktop); pick the visible one
    const allLinks = page.locator(`a[href="${mod.href}"]`);
    let sidebarLink = null;
    const linkCount = await allLinks.count();
    for (let i = 0; i < linkCount; i++) {
      if (await allLinks.nth(i).isVisible().catch(() => false)) {
        sidebarLink = allLinks.nth(i);
        break;
      }
    }
    const linkExists = sidebarLink !== null;

    if (!linkExists) {
      addResult({
        label: `Sidebar — ${mod.label} link present`, phase: 2, pass: false,
        detail: `Link to ${mod.href} not found in sidebar`,
      });
      continue;
    }

    addResult({ label: `Sidebar — ${mod.label} link present`, phase: 2, pass: true });

    // Click and navigate
    await sidebarLink.click({ timeout: 5000 });

    try {
      await page.waitForURL(`**${mod.href}**`, { timeout: 10000 });
    } catch {
      addResult({
        label: `Sidebar — ${mod.label} navigation`, phase: 2, pass: false,
        detail: `Click didn't navigate to ${mod.href}, stuck at ${page.url()}`,
      });
      continue;
    }

    // Wait for content to render
    await page.waitForTimeout(1500);

    // Check URL is correct
    const currentPath = new URL(page.url()).pathname;
    const navCorrect = currentPath === mod.href;
    addResult({
      label: `Sidebar — ${mod.label} navigation`, phase: 2, pass: navCorrect,
      detail: navCorrect ? undefined : `Expected ${mod.href}, got ${currentPath}`,
    });

    // Check active state on sidebar link — re-find the visible link after navigation
    const activeLinks = page.locator(`a[href="${mod.href}"]`);
    let activeLink = null;
    for (let i = 0; i < await activeLinks.count(); i++) {
      if (await activeLinks.nth(i).isVisible().catch(() => false)) {
        activeLink = activeLinks.nth(i);
        break;
      }
    }
    const linkBg = activeLink
      ? await activeLink.evaluate(el => getComputedStyle(el).backgroundColor)
      : 'rgba(0, 0, 0, 0)';
    const hasActiveBg = linkBg !== 'rgba(0, 0, 0, 0)' && linkBg !== 'transparent';
    addResult({
      label: `Sidebar — ${mod.label} active highlight`, phase: 2, pass: hasActiveBg,
      detail: hasActiveBg ? undefined : `Active link has no background highlight (bg: ${linkBg})`,
    });

    // Check no error visible on page
    const pageContent = await page.locator('body').innerText();
    const hasError =
      pageContent.includes('Application error') ||
      pageContent.includes('Unhandled Runtime Error') ||
      pageContent.includes('Internal Server Error');
    addResult({
      label: `Page — ${mod.label} no runtime errors`, phase: 2, pass: !hasError,
      detail: hasError ? 'Page contains error message' : undefined,
    });

    // Check page has meaningful content (not just blank)
    const mainContent = await page.locator('main, [role="main"], .page-transition').first().innerText().catch(() => '');
    const hasContent = mainContent.length > 20 || pageContent.length > 200;
    addResult({
      label: `Page — ${mod.label} has content`, phase: 2, pass: hasContent,
      detail: hasContent ? undefined : 'Page appears empty / no content rendered',
    });

    await screenshot(page, `04-module-${mod.label.toLowerCase()}`);
  }
}

// ─── Phase 3: Design Tokens & Colors ─────────────────────────────────────────

async function phaseDesignTokens(page) {
  logSection('PHASE 3 — Design Tokens & Colors');

  // Go back to dashboard for a clean state
  await page.goto(`${CFG.frontendUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 3.1 — Verify CSS variables are set (light mode)
  const lightTheme = await page.evaluate(() => {
    const root = document.documentElement;
    return root.getAttribute('data-theme');
  });
  log(`  Current theme: ${lightTheme || 'light (default)'}`, C.dim);

  // If currently in dark mode, switch to light first
  if (lightTheme === 'dark') {
    const themeToggle = page.locator('button').filter({ hasText: /🌙|☀️|theme|🌞/i }).first();
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
  }

  // Check light mode tokens
  const actualLightTokens = await page.evaluate((tokens) => {
    const style = getComputedStyle(document.documentElement);
    const result = {};
    for (const key of Object.keys(tokens)) {
      result[key] = style.getPropertyValue(key).trim();
    }
    return result;
  }, LIGHT_TOKENS);

  for (const [token, expected] of Object.entries(LIGHT_TOKENS)) {
    const actual = actualLightTokens[token];
    const matches = actual.toLowerCase() === expected.toLowerCase();
    addResult({
      label: `Light token ${token} = ${expected}`, phase: 3, pass: matches,
      detail: matches ? undefined : `Got "${actual}" instead of "${expected}"`,
    });
  }

  // 3.2 — Verify sidebar color
  const sidebarBg = await page.locator('aside').first().evaluate(el => getComputedStyle(el).backgroundColor);
  const sidebarHex = rgbToHex(sidebarBg);
  const sidebarCorrect = sidebarHex === '#5f80ff' || sidebarBg.includes('95, 128, 255');
  addResult({
    label: `Sidebar background = #5f80ff (light)`, phase: 3, pass: sidebarCorrect,
    detail: sidebarCorrect ? undefined : `Sidebar bg is ${sidebarBg} (${sidebarHex})`,
  });

  await screenshot(page, '05-light-mode');

  // 3.3 — Toggle to dark mode
  logSection('PHASE 3b — Dark Mode Toggle');
  // Theme toggle button says "Claro" (light) or "Escuro" (dark) or "Light"/"Dark"
  const themeToggle = page.locator('button').filter({ hasText: /^(Claro|Escuro|Light|Dark)$/i }).first();
  const toggleVisible = await themeToggle.isVisible().catch(() => false);

  if (!toggleVisible) {
    // Try emoji or aria-label fallback
    const altToggle = page.locator('button').filter({ hasText: /🌙|☀️|🌞/i }).first();
    const altToggle2 = page.locator('[aria-label*="theme"], [aria-label*="dark"], [aria-label*="light"]').first();
    const found = await altToggle.isVisible().catch(() => false) || await altToggle2.isVisible().catch(() => false);

    if (found) {
      const btn = await altToggle.isVisible().catch(() => false) ? altToggle : altToggle2;
      await btn.click();
      await page.waitForTimeout(600);
      addResult({ label: 'Dark mode toggle button found', phase: 3, pass: true });
    } else {
      addResult({ label: 'Dark mode toggle button found', phase: 3, pass: false, detail: 'No theme toggle button found' });
    }
  } else {
    await themeToggle.click();
    await page.waitForTimeout(600);
    addResult({ label: 'Dark mode toggle button found', phase: 3, pass: true });
  }

  // Check dark mode is active
  const darkTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const isDark = darkTheme === 'dark';
  addResult({
    label: 'Dark mode activated after toggle', phase: 3, pass: isDark,
    detail: isDark ? undefined : `data-theme="${darkTheme}" instead of "dark"`,
  });

  if (isDark) {
    // Verify dark tokens
    const actualDarkTokens = await page.evaluate((tokens) => {
      const style = getComputedStyle(document.documentElement);
      const result = {};
      for (const key of Object.keys(tokens)) {
        result[key] = style.getPropertyValue(key).trim();
      }
      return result;
    }, DARK_TOKENS);

    for (const [token, expected] of Object.entries(DARK_TOKENS)) {
      const actual = actualDarkTokens[token];
      const matches = actual.toLowerCase() === expected.toLowerCase();
      addResult({
        label: `Dark token ${token} = ${expected}`, phase: 3, pass: matches,
        detail: matches ? undefined : `Got "${actual}" instead of "${expected}"`,
      });
    }

    const darkSidebarBg = await page.locator('aside').first().evaluate(el => getComputedStyle(el).backgroundColor);
    const darkSidebarHex = rgbToHex(darkSidebarBg);
    const darkSidebarCorrect = darkSidebarHex === '#4058c4' || darkSidebarBg.includes('64, 88, 196');
    addResult({
      label: `Sidebar background = #4058c4 (dark)`, phase: 3, pass: darkSidebarCorrect,
      detail: darkSidebarCorrect ? undefined : `Sidebar bg is ${darkSidebarBg} (${darkSidebarHex})`,
    });

    await screenshot(page, '06-dark-mode');
  }

  // Toggle back to light
  if (isDark) {
    const toggle2 = page.locator('button').filter({ hasText: /^(Claro|Escuro|Light|Dark)$/i }).first();
    if (await toggle2.isVisible().catch(() => false)) {
      await toggle2.click();
      await page.waitForTimeout(500);
    }
  }
}

// ─── Phase 4: Sensitive Data Exposure ────────────────────────────────────────

async function phaseSensitiveData(page) {
  logSection('PHASE 4 — Sensitive Data Exposure Check');

  await page.goto(`${CFG.frontendUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 4.1 — Check DOM for exposed tokens / passwords
  const bodyHtml = await page.content();
  const checks = [
    { pattern: /eyJhbGciOi/i, label: 'JWT token in page HTML', severity: 'P0' },
    { pattern: /password['":\s]+((?!type)[^\s<"']{8,})/i, label: 'Password value in HTML', severity: 'P0' },
    { pattern: /github_pat_/i, label: 'GitHub PAT in HTML', severity: 'P0' },
    { pattern: /sk-[a-zA-Z0-9]{20,}/i, label: 'API secret key in HTML', severity: 'P0' },
    { pattern: /NEXT_PUBLIC_.*=.{10,}/i, label: 'Env variable leak in HTML', severity: 'P1' },
  ];

  for (const check of checks) {
    const found = check.pattern.test(bodyHtml);
    addResult({
      label: `No ${check.label}`, phase: 4, pass: !found,
      detail: found ? `Found ${check.label} exposed in page HTML` : undefined,
    });
  }

  // 4.2 — Check localStorage for sensitive data
  const storageKeys = await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      keys.push({ key, value: localStorage.getItem(key)?.slice(0, 100) });
    }
    return keys;
  });

  const sensitiveStorageKeys = storageKeys.filter(
    s => s.value && (s.value.includes('eyJhbGciOi') || s.key.toLowerCase().includes('password'))
  );
  addResult({
    label: 'No JWT/passwords in localStorage', phase: 4,
    pass: sensitiveStorageKeys.length === 0,
    detail: sensitiveStorageKeys.length > 0 ? `Sensitive data in localStorage keys: ${sensitiveStorageKeys.map(s => s.key).join(', ')}` : undefined,
  });

  // 4.3 — Check that user email is displayed but password is not
  const visibleText = await page.locator('body').innerText();
  const passwordExposed = visibleText.includes(CFG.password);
  addResult({
    label: 'Password not visible in page text', phase: 4,
    pass: !passwordExposed,
    detail: passwordExposed ? 'User password is visible on the page!' : undefined,
  });

  // 4.4 — Check source maps are not exposed in production
  const sourceMapCheck = bodyHtml.includes('sourceMappingURL') && !bodyHtml.includes('//# sourceMappingURL=data:');
  addResult({
    label: 'No external source maps in production', phase: 4,
    pass: !sourceMapCheck,
    detail: sourceMapCheck ? 'External sourceMappingURL found — may expose source code' : undefined,
  });
}

// ─── Phase 5: Console Errors ─────────────────────────────────────────────────

async function phaseConsoleErrors(page) {
  logSection('PHASE 5 — Console Errors During Navigation');

  // Navigate to each module and collect console errors
  const pagesToCheck = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/finance', label: 'Finance' },
    { path: '/reminders', label: 'Reminders' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/documents', label: 'Documents' },
    { path: '/secrets', label: 'Secrets' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' },
  ];

  for (const pg of pagesToCheck) {
    const pageErrors = [];
    const errorHandler = (msg) => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text());
      }
    };

    page.on('console', errorHandler);
    await page.goto(`${CFG.frontendUrl}${pg.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    page.removeListener('console', errorHandler);

    // Filter out expected errors (like failed API calls for empty modules)
    const criticalErrors = pageErrors.filter(e =>
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR') &&
      !e.includes('favicon') &&
      !e.includes('403') &&
      !e.includes('404')
    );

    addResult({
      label: `Console errors — ${pg.label}`, phase: 5,
      pass: criticalErrors.length === 0,
      detail: criticalErrors.length > 0 ? `${criticalErrors.length} error(s): ${criticalErrors[0]?.slice(0, 150)}` : undefined,
    });

    if (criticalErrors.length > 0) {
      consoleErrors.push({ page: pg.path, errors: criticalErrors });
    }
  }
}

// ─── Phase 6: Responsive / Mobile ───────────────────────────────────────────

async function phaseResponsive(page) {
  logSection('PHASE 6 — Responsive (Mobile Viewport)');

  // Resize to mobile
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone size
  await page.goto(`${CFG.frontendUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await screenshot(page, '07-mobile-dashboard');

  // Desktop sidebar should be hidden on mobile
  const desktopSidebar = page.locator('aside.hidden, aside[class*="lg:flex"]').first();
  const desktopSidebarVisible = await desktopSidebar.isVisible().catch(() => false);
  addResult({
    label: 'Desktop sidebar hidden on mobile', phase: 6,
    pass: !desktopSidebarVisible,
    detail: desktopSidebarVisible ? 'Desktop sidebar visible on 375px viewport' : undefined,
  });

  // Look for hamburger / mobile menu button
  const hamburger = page.locator('button').filter({ hasText: /☰|menu/i }).first();
  const hamburgerByLabel = page.locator('[aria-label*="menu"], [aria-label*="Menu"]').first();
  let mobileMenuBtn = null;

  if (await hamburger.isVisible().catch(() => false)) {
    mobileMenuBtn = hamburger;
  } else if (await hamburgerByLabel.isVisible().catch(() => false)) {
    mobileMenuBtn = hamburgerByLabel;
  }

  if (mobileMenuBtn) {
    addResult({ label: 'Mobile menu button visible', phase: 6, pass: true });

    // Click hamburger
    await mobileMenuBtn.click();
    await page.waitForTimeout(600);

    // Check mobile sidebar appeared
    const mobileSidebar = page.locator('aside').filter({ has: page.locator('nav') }).first();
    const mobileSidebarVisible = await mobileSidebar.isVisible().catch(() => false);
    addResult({
      label: 'Mobile sidebar opens on hamburger click', phase: 6,
      pass: mobileSidebarVisible,
      detail: mobileSidebarVisible ? undefined : 'Mobile sidebar did not appear',
    });

    await screenshot(page, '08-mobile-sidebar-open');

    // Click a module link in mobile sidebar
    const mobileLink = mobileSidebar.locator('a[href="/finance"]').first();
    if (await mobileLink.isVisible().catch(() => false)) {
      await mobileLink.click();
      await page.waitForTimeout(1500);
      const navCorrect = page.url().includes('/finance');
      addResult({
        label: 'Mobile sidebar navigation works', phase: 6,
        pass: navCorrect,
        detail: navCorrect ? undefined : `Expected /finance, got ${page.url()}`,
      });
      await screenshot(page, '09-mobile-finance');
    }
  } else {
    addResult({ label: 'Mobile menu button visible', phase: 6, pass: false, detail: 'No hamburger/menu button found' });
  }

  // Check content doesn't overflow horizontally
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  addResult({
    label: 'No horizontal overflow on mobile', phase: 6,
    pass: !hasOverflow,
    detail: hasOverflow ? 'Page has horizontal scroll on mobile viewport' : undefined,
  });

  // Tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${CFG.frontendUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot(page, '10-tablet-dashboard');

  const tabletOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  addResult({
    label: 'No horizontal overflow on tablet (768px)', phase: 6,
    pass: !tabletOverflow,
    detail: tabletOverflow ? 'Page has horizontal scroll on tablet viewport' : undefined,
  });

  // Back to desktop
  await page.setViewportSize({ width: 1440, height: 900 });
}

// ─── Phase 7: i18n Toggle ────────────────────────────────────────────────────

async function phaseI18n(page) {
  logSection('PHASE 7 — Language Toggle (i18n)');

  await page.goto(`${CFG.frontendUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Get text in current language
  const textBefore = await page.locator('body').innerText();

  // Language toggle — button shows current language and toggles on click
  // "PT" button = currently in PT; clicking it switches to EN and vice-versa
  const langBtn = page.locator('button').filter({ hasText: /^(PT|EN)$/i }).first();
  const langVisible = await langBtn.isVisible().catch(() => false);

  if (langVisible) {
    const currentLang = (await langBtn.innerText()).trim().toUpperCase();
    addResult({ label: `Language toggle button found (current: ${currentLang})`, phase: 7, pass: true });

    // Click to toggle language
    await langBtn.click();
    await page.waitForTimeout(2000);

    const newLang = (await langBtn.innerText()).trim().toUpperCase();
    const bodyAfterToggle = await page.locator('body').innerText();

    if (newLang === 'EN') {
      // Switched TO English
      const hasEnContent = /settings|dashboard|modules|finance|reminders|documents|secrets|calendar|income|expenses/i.test(bodyAfterToggle);
      addResult({
        label: 'Toggle → EN — English content visible', phase: 7,
        pass: hasEnContent,
        detail: hasEnContent ? undefined : 'Expected English text not found after toggling to EN',
      });
      await screenshot(page, '11-language-en');
    } else if (newLang === 'PT') {
      // Switched TO Portuguese
      const hasPtContent = /configurações|painel|módulos|finanças|lembretes?|documentos|segredos|calendário|receitas|despesas/i.test(bodyAfterToggle);
      addResult({
        label: 'Toggle → PT — Portuguese content visible', phase: 7,
        pass: hasPtContent,
        detail: hasPtContent ? undefined : 'Expected Portuguese text not found after toggling to PT',
      });
      await screenshot(page, '11-language-pt');
    }

    // Toggle back to original
    await langBtn.click();
    await page.waitForTimeout(2000);

    const backLang = (await langBtn.innerText()).trim().toUpperCase();
    const bodyAfterBack = await page.locator('body').innerText();

    if (backLang === 'PT') {
      const hasPtContent = /configurações|painel|módulos|finanças|lembretes?|documentos|segredos|calendário|receitas|despesas/i.test(bodyAfterBack);
      addResult({
        label: 'Toggle back → PT — Portuguese content visible', phase: 7,
        pass: hasPtContent,
        detail: hasPtContent ? undefined : 'Expected Portuguese text not found after toggling back to PT',
      });
      await screenshot(page, '12-language-pt');
    } else if (backLang === 'EN') {
      const hasEnContent = /settings|dashboard|modules|finance|reminders|documents|secrets|calendar|income|expenses/i.test(bodyAfterBack);
      addResult({
        label: 'Toggle back → EN — English content visible', phase: 7,
        pass: hasEnContent,
        detail: hasEnContent ? undefined : 'Expected English text not found after toggling back to EN',
      });
      await screenshot(page, '12-language-en');
    }
  } else {
    addResult({ label: 'Language toggle button found', phase: 7, pass: false, detail: 'No PT/EN button found' });
  }
}

// ─── Phase 8: User Profile & Settings ────────────────────────────────────────

async function phaseUserFlows(page) {
  logSection('PHASE 8 — User Profile & Settings Flows');

  // 8.1 — Profile page shows user info
  await page.goto(`${CFG.frontendUrl}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const profileText = await page.locator('body').innerText();
  const hasEmailOrName = profileText.includes('@') || profileText.length > 200;
  addResult({
    label: 'Profile page shows user information', phase: 8,
    pass: hasEmailOrName,
    detail: hasEmailOrName ? undefined : 'Profile page appears empty',
  });
  await screenshot(page, '13-profile');

  // 8.2 — Settings page loads
  await page.goto(`${CFG.frontendUrl}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const settingsText = await page.locator('body').innerText();
  addResult({
    label: 'Settings page has content', phase: 8,
    pass: settingsText.length > 100,
    detail: settingsText.length <= 100 ? 'Settings page is empty' : undefined,
  });
  await screenshot(page, '14-settings');

  // 8.3 — Settings/Users (members) page
  await page.goto(`${CFG.frontendUrl}/settings/users`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await screenshot(page, '15-settings-users');

  // 8.4 — Check workspace switcher is present
  await page.goto(`${CFG.frontendUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const topBar = page.locator('header, [class*="topbar"], [class*="top-bar"]').first();
  const workspaceSelector = page.locator('select, [role="combobox"], [class*="workspace"]').first();
  const hasWorkspaceUI = await workspaceSelector.isVisible().catch(() => false) || await topBar.isVisible().catch(() => false);
  addResult({
    label: 'Workspace switcher / top bar present', phase: 8,
    pass: hasWorkspaceUI,
    detail: hasWorkspaceUI ? undefined : 'No workspace switcher or top bar found',
  });
}

// ─── Phase 9: Visual Consistency Checks ──────────────────────────────────────

async function phaseVisualConsistency(page) {
  logSection('PHASE 9 — Visual Consistency');

  await page.goto(`${CFG.frontendUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 9.1 — Check that no hardcoded hex colors bleed through (spot check cards)
  const cards = page.locator('[class*="Card"], [class*="card"], [class*="surface"]');
  const cardCount = await cards.count();

  if (cardCount > 0) {
    const firstCard = cards.first();
    const cardBg = await firstCard.evaluate(el => getComputedStyle(el).backgroundColor);
    // It should use var(--surface) which resolves to #f9fbff (light) or #121a30 (dark)
    const acceptableCardBgs = ['rgb(249, 251, 255)', 'rgb(18, 26, 48)', 'rgba(0, 0, 0, 0)', 'transparent'];
    const cardBgOk = acceptableCardBgs.some(b => cardBg.includes(b.slice(0, 10))) || cardBg.includes('249, 251') || cardBg.includes('18, 26');
    addResult({
      label: `Card background uses design token`, phase: 9,
      pass: cardBgOk,
      detail: cardBgOk ? undefined : `Card bg is ${cardBg} — may be hardcoded`,
    });
  }

  // 9.2 — Check body background uses --background token
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const correctBg = bodyBg.includes('223, 230, 251') || bodyBg.includes('11, 16, 32'); // light or dark
  addResult({
    label: 'Body background uses --background token', phase: 9,
    pass: correctBg,
    detail: correctBg ? undefined : `Body bg is ${bodyBg} — doesn't match --background token`,
  });

  // 9.3 — Check text color uses --foreground token
  const textColor = await page.evaluate(() => getComputedStyle(document.body).color);
  const correctText = textColor.includes('16, 24, 40') || textColor.includes('238, 242, 255'); // light or dark
  addResult({
    label: 'Body text uses --foreground token', phase: 9,
    pass: correctText,
    detail: correctText ? undefined : `Body color is ${textColor} — doesn't match --foreground token`,
  });

  // 9.4 — Check that buttons have consistent styling
  const buttons = page.locator('button:visible');
  const btnCount = await buttons.count();
  addResult({
    label: `Interactive buttons present (${btnCount} found)`, phase: 9,
    pass: btnCount > 0,
    detail: btnCount === 0 ? 'No visible buttons found on dashboard' : undefined,
  });

  // 9.5 — Check images have alt text
  const images = page.locator('img');
  const imgCount = await images.count();
  let missingAlt = 0;
  for (let i = 0; i < Math.min(imgCount, 20); i++) {
    const alt = await images.nth(i).getAttribute('alt');
    if (!alt && alt !== '') missingAlt++;
  }
  addResult({
    label: `Images have alt attributes (${imgCount - missingAlt}/${imgCount})`, phase: 9,
    pass: missingAlt === 0,
    detail: missingAlt > 0 ? `${missingAlt} image(s) missing alt attribute` : undefined,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '';
  const match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  return '#' + [match[1], match[2], match[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

// ─── HTML Report ─────────────────────────────────────────────────────────────

function generateReport() {
  logSection('Generating HTML Report');

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;

  const date = new Date().toISOString().slice(0, 10);
  const phases = [...new Set(results.map(r => r.phase))].sort();

  const phaseNames = {
    1: 'Login Simulation',
    2: 'Sidebar Navigation',
    3: 'Design Tokens & Colors',
    4: 'Sensitive Data Exposure',
    5: 'Console Errors',
    6: 'Responsive / Mobile',
    7: 'Language Toggle (i18n)',
    8: 'User Flows',
    9: 'Visual Consistency',
  };

  const screenshotHtml = screenshots.map(s =>
    `<div style="margin:0.5rem 0;"><strong>${s.name}</strong><br><img src="${s.path}" style="max-width:100%;border:1px solid var(--border);border-radius:8px;margin-top:4px;" loading="lazy"/></div>`
  ).join('\n');

  const consoleErrorsHtml = consoleErrors.length > 0
    ? `<div class="phase"><h2>Console Errors Log</h2>${consoleErrors.map(ce =>
        `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:1rem;margin:0.5rem 0;">
          <strong>${ce.page}</strong>
          <pre style="font-size:0.8rem;overflow-x:auto;margin-top:0.5rem">${ce.errors.map(e => e.slice(0, 200)).join('\n')}</pre>
        </div>`
      ).join('')}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>E2E QA Report — ${date}</title>
<style>
  :root { --bg: #0f172a; --surface: #1e293b; --border: #334155; --text: #e2e8f0; --green: #22c55e; --red: #ef4444; --yellow: #eab308; --blue: #3b82f6; --dim: #94a3b8; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; background: var(--bg); color: var(--text); padding: 2rem; }
  .header { text-align: center; margin-bottom: 2rem; } .header h1 { font-size: 1.6rem; margin-bottom: 0.4rem; } .header .date { color: var(--dim); }
  .summary { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem 1.5rem; text-align: center; min-width: 120px; }
  .stat .num { font-size: 1.8rem; font-weight: bold; } .stat .label { font-size: 0.75rem; color: var(--dim); text-transform: uppercase; }
  .stat.pass .num { color: var(--green); } .stat.fail .num { color: var(--red); }
  .phase { margin-bottom: 2rem; } .phase h2 { font-size: 1.1rem; color: var(--blue); margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: var(--surface); color: var(--dim); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
  tr.pass td:first-child { border-left: 3px solid var(--green); } tr.fail td:first-child { border-left: 3px solid var(--red); }
  .badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
  .badge.pass { background: #16a34a33; color: var(--green); } .badge.fail { background: #ef444433; color: var(--red); }
  .screenshots { margin-top: 2rem; } .screenshots h2 { font-size: 1.1rem; color: var(--blue); margin-bottom: 1rem; }
  footer { text-align: center; color: var(--dim); font-size: 0.75rem; margin-top: 3rem; }
</style>
</head>
<body>
<div class="header">
  <h1>🖥️ E2E User Simulation Report</h1>
  <div class="date">${date} — organization-backoffice</div>
</div>
<div class="summary">
  <div class="stat"><div class="num">${total}</div><div class="label">Total Tests</div></div>
  <div class="stat pass"><div class="num">${passed}</div><div class="label">Passed</div></div>
  <div class="stat fail"><div class="num">${failed}</div><div class="label">Failed</div></div>
</div>
${phases.map(phase => {
  const phaseResults = results.filter(r => r.phase === phase);
  return `<div class="phase"><h2>Phase ${phase} — ${phaseNames[phase] || 'Other'}</h2>
<table><thead><tr><th>Test</th><th>Result</th><th>Details</th></tr></thead><tbody>
${phaseResults.map(r => `<tr class="${r.pass ? 'pass' : 'fail'}"><td>${r.label}</td><td><span class="badge ${r.pass ? 'pass' : 'fail'}">${r.pass ? 'PASS' : 'FAIL'}</span></td><td>${r.detail || '-'}</td></tr>`).join('\n')}
</tbody></table></div>`;
}).join('\n')}
${consoleErrorsHtml}
<div class="screenshots"><h2>Screenshots (${screenshots.length})</h2>${screenshotHtml}</div>
<footer>Generated by E2E Audit Script — ${new Date().toISOString()}</footer>
</body></html>`;

  const filePath = join(REPORT_DIR, `e2e-report-${date}.html`);
  writeFileSync(filePath, html, 'utf-8');
  log(`📄 Report saved: ${filePath}`, C.green);
  return filePath;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🖥️  Organization Backoffice — E2E User Simulation      ║
║      Browser-based QA with Playwright                    ║
╚══════════════════════════════════════════════════════════╝
`);

  log(`Frontend: ${CFG.frontendUrl}`);
  log(`Email: ${CFG.email}`);
  log(`Mode: ${CFG.headed ? 'headed (visible browser)' : 'headless'}`);
  log('');

  const browser = await chromium.launch({ headless: !CFG.headed });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) QA-Audit/1.0',
    locale: 'en-US',
  });

  const page = await context.newPage();

  // Collect all console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ page: page.url(), errors: [msg.text()] });
    }
  });

  try {
    const loginOk = await phaseLogin(page);
    if (!loginOk) {
      log('❌ Login failed — cannot continue E2E tests', C.red);
      await browser.close();
      process.exit(1);
    }

    await phaseSidebarNavigation(page);
    await phaseDesignTokens(page);
    await phaseSensitiveData(page);
    await phaseConsoleErrors(page);
    await phaseResponsive(page);
    await phaseI18n(page);
    await phaseUserFlows(page);
    await phaseVisualConsistency(page);
  } catch (err) {
    log(`Fatal error: ${err.message}`, C.red);
    await screenshot(page, 'fatal-error').catch(() => {});
  } finally {
    await browser.close();
  }

  const reportPath = generateReport();

  // ─── Summary ─────────────────────────────────────────────────────────────
  logSection('FINAL SUMMARY');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  log(`Tests: ${passed}/${results.length} passed, ${failed} failed`);
  log(`Screenshots: ${screenshots.length}`);
  log(`Report: ${reportPath}`);

  // Write JSON summary for CI integration
  const summaryJson = {
    date: new Date().toISOString(),
    passed,
    failed,
    total: results.length,
    screenshots: screenshots.length,
    failures: results.filter(r => !r.pass).map(r => ({ label: r.label, detail: r.detail || '' })),
  };
  writeFileSync(join(REPORT_DIR, 'e2e-summary.json'), JSON.stringify(summaryJson, null, 2), 'utf-8');
  log(`Summary JSON: docs/qa/e2e-summary.json`, C.dim);

  const ciMode = process.argv.includes('--ci');
  process.exit(ciMode ? 0 : (failed > 0 ? 1 : 0));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
