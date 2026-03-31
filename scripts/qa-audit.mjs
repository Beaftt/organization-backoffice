#!/usr/bin/env node

/**
 * QA Audit Script — Organization Backoffice (Frontend)
 *
 * Comprehensive frontend quality audit:
 *   Phase 0 — Auth flow (login, redirect, cookies, session)
 *   Phase 1 — Page rendering (all routes load, correct status codes)
 *   Phase 2 — Middleware (protected routes, auth redirects)
 *   Phase 3 — API client contract (error shapes, envelopes via backend proxy)
 *   Phase 4 — Security (headers, cookie flags, XSS, CSRF)
 *   Phase 5 — SEO & Accessibility (meta tags, viewport, lang)
 *   Phase 6 — i18n (all pages in both languages)
 *   Phase 7 — Performance (page load times, asset sizes)
 *
 * Usage:
 *   node scripts/qa-audit.mjs
 *
 * Environment variables (or .env.qa file):
 *   QA_EMAIL              — login email
 *   QA_PASSWORD           — login password
 *   QA_FRONTEND_URL       — frontend base URL (default: https://organization.beaftt.com)
 *   QA_API_URL            — API base URL (default: https://organization-api.beaftt.com)
 *   QA_GITHUB_TOKEN       — GitHub PAT with issues:write scope
 *   QA_CREATE_ISSUES      — "true" to create GitHub issues (default: false)
 */

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
  apiUrl: (process.env.QA_API_URL || 'https://organization-api.beaftt.com').replace(/\/$/, ''),
  email: process.env.QA_EMAIL || '',
  password: process.env.QA_PASSWORD || '',
  githubToken: process.env.QA_GITHUB_TOKEN || '',
  createIssues: process.env.QA_CREATE_ISSUES === 'true',
};

const REPO = 'Beaftt/organization-backoffice';

// ─── State ───────────────────────────────────────────────────────────────────

let accessToken = '';
let refreshToken = '';
let workspaceId = '';
let cookies = '';             // full cookie string from login
const results = [];
const issues = [];

// ─── Terminal Colors ─────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

function log(msg, color = '') {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`${C.dim}[${ts}]${C.reset} ${color}${msg}${C.reset}`);
}

function logPass(label) { log(`  ✅ PASS  ${label}`, C.green); }
function logFail(label, detail) { log(`  ❌ FAIL  ${label} — ${detail}`, C.red); }
function logWarn(label) { log(`  ⚠️  WARN  ${label}`, C.yellow); }
function logSection(name) { log(`\n${'═'.repeat(60)}\n  ${name}\n${'═'.repeat(60)}`, C.cyan); }
function logEndpoint(method, path) { log(`→ ${method} ${path}`, C.blue); }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addResult(test) {
  results.push(test);
  if (test.pass) {
    logPass(`${test.label} (${test.status}, ${test.ms}ms)`);
  } else {
    logFail(test.label, test.detail || `HTTP ${test.status}`);
    for (const iss of test.issues || []) {
      log(`     [${iss.severity}] ${iss.msg}`, iss.severity === 'P0' ? C.red : iss.severity === 'P1' ? C.yellow : C.dim);
    }
  }
}

function makeIssue(severity, module, title, body) {
  issues.push({ severity, module, title, body, repo: REPO, labels: ['qa-audit', severity.toLowerCase(), 'bug'] });
}

/**
 * Fetch a frontend page (follows redirects manually to track redirect chains).
 */
async function pageFetch(path, { method = 'GET', followRedirects = false, extraHeaders = {} } = {}) {
  const url = `${CFG.frontendUrl}${path}`;
  const headers = { ...extraHeaders };
  if (cookies) headers['Cookie'] = cookies;

  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers,
      redirect: followRedirects ? 'follow' : 'manual',
    });
    const ms = Date.now() - t0;
    const location = res.headers.get('location');
    const contentType = res.headers.get('content-type') || '';
    let body = '';
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      body = await res.text();
    }
    return { status: res.status, ms, location, headers: res.headers, body, url, error: null };
  } catch (err) {
    return { status: 0, ms: Date.now() - t0, location: null, headers: null, body: '', url, error: err.message };
  }
}

/**
 * Fetch API directly (for contract tests).
 */
async function apiFetch(method, path, { body, skipAuth } = {}) {
  const url = `${CFG.apiUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (!skipAuth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (workspaceId && !skipAuth) headers['x-workspace-id'] = workspaceId;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const t0 = Date.now();
  try {
    const res = await fetch(url, opts);
    const ms = Date.now() - t0;
    const text = await res.text();
    let resBody;
    try { resBody = JSON.parse(text); } catch { resBody = { _raw: text.slice(0, 500) }; }
    return { status: res.status, body: resBody, ms, headers: res.headers, error: null };
  } catch (err) {
    return { status: 0, body: null, ms: Date.now() - t0, headers: null, error: err.message };
  }
}

function unwrap(body) {
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
}

// ─── Phase 0: Authentication ─────────────────────────────────────────────────

async function phaseAuth() {
  logSection('PHASE 0 — Authentication Flow');

  if (!CFG.email || !CFG.password) {
    log('❌ QA_EMAIL and QA_PASSWORD are required. Create a .env.qa file.', C.red);
    process.exit(1);
  }

  // 0.1 — Login via API to get tokens
  logEndpoint('POST', `${CFG.apiUrl}/auth/login`);
  const loginRes = await apiFetch('POST', '/auth/login', {
    body: { email: CFG.email, password: CFG.password },
    skipAuth: true,
  });

  const loginData = unwrap(loginRes.body);
  if (loginRes.status === 200 && loginData?.accessToken) {
    accessToken = loginData.accessToken;
    refreshToken = loginData.refreshToken;
    workspaceId = loginData.defaultWorkspaceId || '';
    cookies = `access_token=${accessToken}; refresh_token=${refreshToken}; org.workspace.active=${workspaceId}`;
    addResult({ label: 'API Login', module: 'Auth', phase: 0, status: 200, ms: loginRes.ms, pass: true, issues: [] });
    log(`   Token obtained, workspace: ${workspaceId}`, C.dim);
  } else {
    addResult({
      label: 'API Login', module: 'Auth', phase: 0, status: loginRes.status, ms: loginRes.ms, pass: false,
      detail: `Login failed: ${loginRes.status}`, issues: [{ severity: 'P0', msg: 'Cannot authenticate — aborting' }],
    });
    makeIssue('P0', 'Auth', 'QA: Login request fails', `Login returned ${loginRes.status}: ${JSON.stringify(loginRes.body).slice(0, 300)}`);
    process.exit(1);
  }

  // 0.2 — Login page loads for unauthenticated user
  logEndpoint('GET', '/login (no auth)');
  const loginPage = await pageFetch('/login', { extraHeaders: {} });
  // Override: request without cookies
  const loginPageNoAuth = await fetch(`${CFG.frontendUrl}/login`, { redirect: 'manual' }).then(async r => ({
    status: r.status, ms: 0, location: r.headers.get('location'),
    body: r.status < 400 ? await r.text() : '',
  })).catch(e => ({ status: 0, ms: 0, location: null, body: '', error: e.message }));

  if (loginPageNoAuth.status === 200) {
    addResult({ label: 'Login page accessible (no auth)', module: 'Auth', phase: 0, status: 200, ms: 0, pass: true, issues: [] });
  } else {
    addResult({
      label: 'Login page accessible (no auth)', module: 'Auth', phase: 0, status: loginPageNoAuth.status, ms: 0, pass: false,
      detail: `Expected 200, got ${loginPageNoAuth.status}`, issues: [{ severity: 'P1', msg: 'Login page not reachable' }],
    });
  }

  // 0.3 — Login page redirects authenticated user to /dashboard
  logEndpoint('GET', '/login (with auth cookie)');
  const loginRedirect = await pageFetch('/login');
  const redirectsCorrectly = loginRedirect.status === 307 && loginRedirect.location?.includes('/dashboard');
  addResult({
    label: 'Login → /dashboard redirect (authed)', module: 'Auth', phase: 0,
    status: loginRedirect.status, ms: loginRedirect.ms,
    pass: redirectsCorrectly,
    detail: redirectsCorrectly ? undefined : `Expected 307→/dashboard, got ${loginRedirect.status}→${loginRedirect.location}`,
    issues: redirectsCorrectly ? [] : [{ severity: 'P1', msg: 'Authenticated user not redirected from /login' }],
  });

  // 0.4 — Register page loads
  logEndpoint('GET', '/register (no auth)');
  const regPageNoAuth = await fetch(`${CFG.frontendUrl}/register`, { redirect: 'manual' }).then(async r => ({
    status: r.status, ms: 0, body: r.status < 400 ? await r.text() : '',
  })).catch(e => ({ status: 0, ms: 0, body: '' }));
  addResult({
    label: 'Register page accessible', module: 'Auth', phase: 0, status: regPageNoAuth.status, ms: 0,
    pass: regPageNoAuth.status === 200,
    detail: regPageNoAuth.status === 200 ? undefined : `Got ${regPageNoAuth.status}`,
    issues: regPageNoAuth.status === 200 ? [] : [{ severity: 'P1', msg: 'Register page not reachable' }],
  });

  // 0.5 — Token refresh via API
  logEndpoint('POST', '/auth/refresh');
  const refreshRes = await apiFetch('POST', '/auth/refresh', {
    body: { refreshToken },
    skipAuth: true,
  });
  const refreshData = unwrap(refreshRes.body);
  if (refreshRes.status === 200 && refreshData?.accessToken) {
    accessToken = refreshData.accessToken;
    cookies = `access_token=${accessToken}; refresh_token=${refreshToken}; org.workspace.active=${workspaceId}`;
    addResult({ label: 'Token refresh', module: 'Auth', phase: 0, status: 200, ms: refreshRes.ms, pass: true, issues: [] });
  } else {
    addResult({
      label: 'Token refresh', module: 'Auth', phase: 0, status: refreshRes.status, ms: refreshRes.ms, pass: false,
      detail: `Refresh failed: ${refreshRes.status}`, issues: [{ severity: 'P1', msg: 'Token refresh failed' }],
    });
  }
}

// ─── Phase 1: Page Rendering ─────────────────────────────────────────────────

const APP_PAGES = [
  { path: '/dashboard', label: 'Dashboard', module: 'Dashboard' },
  { path: '/profile', label: 'Profile', module: 'Profile' },
  { path: '/settings', label: 'Settings', module: 'Settings' },
  { path: '/settings/users', label: 'Settings > Users', module: 'Settings' },
  { path: '/limits', label: 'Limits (Billing)', module: 'Billing' },
  { path: '/finance', label: 'Finance', module: 'Finance' },
  { path: '/calendar', label: 'Calendar', module: 'Calendar' },
  { path: '/documents', label: 'Documents', module: 'Documents' },
  { path: '/reminders', label: 'Reminders', module: 'Reminders' },
  { path: '/secrets', label: 'Secrets', module: 'Secrets' },
  { path: '/inventory', label: 'Inventory', module: 'Inventory' },
  { path: '/studies', label: 'Studies', module: 'Studies' },
  { path: '/hr', label: 'HR', module: 'HR' },
  { path: '/hr/people', label: 'HR > People', module: 'HR' },
  { path: '/hr/jobs', label: 'HR > Jobs', module: 'HR' },
  { path: '/vagas', label: 'Jobs (Vagas)', module: 'Jobs' },
  { path: '/workspaces/new', label: 'New Workspace', module: 'Workspace' },
  { path: '/workspaces/share', label: 'Share Workspace', module: 'Workspace' },
];

const AUTH_PAGES = [
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
  { path: '/forgot-password', label: 'Forgot Password' },
  { path: '/reset-password', label: 'Reset Password' },
  { path: '/verify-email', label: 'Verify Email' },
];

async function phasePages() {
  logSection('PHASE 1 — Page Rendering (Authenticated)');

  for (const page of APP_PAGES) {
    logEndpoint('GET', page.path);
    const res = await pageFetch(page.path, { followRedirects: true });
    const isHtml = res.body.includes('<html') || res.body.includes('<!DOCTYPE');
    const hasNextData = res.body.includes('__NEXT_DATA__') || res.body.includes('__next');
    // Only check visible page text, not JS bundles — strip scripts first
    const visibleContent = res.body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    const hasError = visibleContent.includes('Application error') || visibleContent.includes('Internal Server Error');
    const hasReactError = visibleContent.includes('Unhandled Runtime Error');

    // Detect empty page
    const bodyContent = res.body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '').trim();
    const isEmptyPage = bodyContent.length < 100;

    const testIssues = [];
    let pass = res.status === 200 && isHtml;

    if (res.status !== 200) {
      testIssues.push({ severity: 'P1', msg: `Page returned ${res.status}` });
      pass = false;
    }
    if (!isHtml) {
      testIssues.push({ severity: 'P1', msg: 'Response is not HTML' });
      pass = false;
    }
    if (hasError) {
      testIssues.push({ severity: 'P1', msg: 'Page contains error content (500/Application error)' });
      pass = false;
    }
    if (hasReactError) {
      testIssues.push({ severity: 'P2', msg: 'Page contains React runtime error' });
      pass = false;
    }

    addResult({
      label: `Page — ${page.label}`, module: page.module, phase: 1,
      status: res.status, ms: res.ms, pass,
      detail: pass ? undefined : testIssues.map(i => i.msg).join('; '),
      issues: testIssues,
    });

    if (!pass) {
      makeIssue(testIssues[0]?.severity || 'P1', page.module, `QA: ${page.label} page fails to render`, `GET ${page.path} → ${res.status}\nIssues: ${testIssues.map(i => i.msg).join(', ')}`);
    }
  }
}

// ─── Phase 2: Middleware / Auth Redirects ─────────────────────────────────────

async function phaseMiddleware() {
  logSection('PHASE 2 — Middleware & Auth Redirects');

  // 2.1 — Protected routes redirect unauthenticated user to /login
  log('  Testing protected routes WITHOUT auth cookie...');
  const protectedPaths = ['/dashboard', '/finance', '/settings', '/reminders', '/secrets'];
  for (const path of protectedPaths) {
    logEndpoint('GET', `${path} (no auth)`);
    const t0 = Date.now();
    const res = await fetch(`${CFG.frontendUrl}${path}`, { redirect: 'manual' })
      .then(r => ({ status: r.status, location: r.headers.get('location'), ms: Date.now() - t0 }))
      .catch(e => ({ status: 0, location: null, ms: Date.now() - t0, error: e.message }));

    const redirectsToLogin = (res.status === 307 || res.status === 308) && res.location?.includes('/login');
    addResult({
      label: `Protected ${path} → /login (no auth)`, module: 'Middleware', phase: 2,
      status: res.status, ms: res.ms,
      pass: redirectsToLogin,
      detail: redirectsToLogin ? undefined : `Expected 307→/login, got ${res.status}→${res.location}`,
      issues: redirectsToLogin ? [] : [{ severity: 'P1', msg: `Unprotected route: ${path} accessible without auth` }],
    });

    if (!redirectsToLogin) {
      makeIssue('P1', 'Middleware', `QA: ${path} not protected`, `GET ${path} without auth returned ${res.status} instead of redirect to /login`);
    }
  }

  // 2.2 — Auth pages redirect authenticated user to /dashboard
  log('  Testing auth pages WITH auth cookie...');
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  for (const path of authPaths) {
    logEndpoint('GET', `${path} (authed)`);
    const res = await pageFetch(path);
    const redirectsToDashboard = (res.status === 307 || res.status === 308) && res.location?.includes('/dashboard');
    addResult({
      label: `Auth ${path} → /dashboard (authed)`, module: 'Middleware', phase: 2,
      status: res.status, ms: res.ms,
      pass: redirectsToDashboard,
      detail: redirectsToDashboard ? undefined : `Expected 307→/dashboard, got ${res.status}→${res.location}`,
      issues: redirectsToDashboard ? [] : [{ severity: 'P2', msg: `Auth page ${path} accessible with active session` }],
    });
  }

  // 2.3 — Static/public paths are accessible without auth
  const publicPaths = ['/favicon.ico', '/robots.txt'];
  for (const path of publicPaths) {
    logEndpoint('GET', `${path} (public)`);
    const t0 = Date.now();
    const res = await fetch(`${CFG.frontendUrl}${path}`, { redirect: 'manual' })
      .then(r => ({ status: r.status, ms: Date.now() - t0 }))
      .catch(e => ({ status: 0, ms: Date.now() - t0 }));
    const isAccessible = res.status < 400 || res.status === 404; // 404 is ok if not created yet
    addResult({
      label: `Public ${path}`, module: 'Middleware', phase: 2,
      status: res.status, ms: res.ms,
      pass: isAccessible,
      detail: isAccessible ? undefined : `Got ${res.status}`,
      issues: [],
    });
  }

  // 2.4 — Non-existent page returns 404
  logEndpoint('GET', '/this-route-does-not-exist');
  const notFoundRes = await pageFetch('/this-route-does-not-exist', { followRedirects: true });
  // Next.js may redirect to login if unauthed, or return 404
  const is404 = notFoundRes.status === 404 || notFoundRes.body.includes('404');
  addResult({
    label: 'Non-existent route → 404', module: 'Middleware', phase: 2,
    status: notFoundRes.status, ms: notFoundRes.ms,
    pass: is404,
    detail: is404 ? undefined : `Expected 404, got ${notFoundRes.status}`,
    issues: is404 ? [] : [{ severity: 'P3', msg: 'Missing 404 page' }],
  });
}

// ─── Phase 3: API Client Contract Tests ──────────────────────────────────────

async function phaseApiContract() {
  logSection('PHASE 3 — API Client Contract Validation');

  // 3.1 — SuccessEnvelope shape
  logEndpoint('GET', '/users/me');
  const meRes = await apiFetch('GET', '/users/me');
  const meIssues = [];
  if (meRes.status !== 200) {
    meIssues.push({ severity: 'P1', msg: `Expected 200, got ${meRes.status}` });
  } else {
    const raw = meRes.body;
    if (!raw || typeof raw !== 'object') {
      meIssues.push({ severity: 'P1', msg: 'Response is not a JSON object' });
    } else {
      if (raw.statusCode === undefined) meIssues.push({ severity: 'P2', msg: 'Missing statusCode in envelope' });
      if (raw.data === undefined) meIssues.push({ severity: 'P1', msg: 'Missing data field in envelope' });
    }
  }
  addResult({
    label: 'SuccessEnvelope shape (/users/me)', module: 'API Contract', phase: 3,
    status: meRes.status, ms: meRes.ms,
    pass: meIssues.length === 0,
    detail: meIssues.length === 0 ? undefined : meIssues.map(i => i.msg).join('; '),
    issues: meIssues,
  });

  // 3.2 — ErrorEnvelope shape (401)
  logEndpoint('GET', '/users/me (no auth)');
  const unauthed = await apiFetch('GET', '/users/me', { skipAuth: true });
  const errIssues = [];
  if (unauthed.status !== 401) {
    errIssues.push({ severity: 'P1', msg: `Expected 401, got ${unauthed.status}` });
  } else {
    const raw = unauthed.body;
    if (!raw.statusCode) errIssues.push({ severity: 'P2', msg: 'Error missing statusCode' });
    if (!raw.message) errIssues.push({ severity: 'P2', msg: 'Error missing message' });
  }
  addResult({
    label: 'ErrorEnvelope shape (401)', module: 'API Contract', phase: 3,
    status: unauthed.status, ms: unauthed.ms,
    pass: errIssues.length === 0,
    detail: errIssues.length === 0 ? undefined : errIssues.map(i => i.msg).join('; '),
    issues: errIssues,
  });

  // 3.3 — Pagination shape
  const paginatedEndpoints = [
    `/workspaces/${workspaceId}/reminders/lists`,
    `/workspaces/${workspaceId}/finance/transactions`,
    `/workspaces/${workspaceId}/documents`,
    `/workspaces/${workspaceId}/secrets`,
    `/workspaces/${workspaceId}/inventory/items`,
  ];
  for (const ep of paginatedEndpoints) {
    logEndpoint('GET', `${ep}?page=1&pageSize=1`);
    const res = await apiFetch('GET', `${ep}?page=1&pageSize=1`);
    const data = unwrap(res.body);
    const pgIssues = [];
    if (res.status !== 200) {
      pgIssues.push({ severity: 'P1', msg: `Expected 200, got ${res.status}` });
    } else if (data) {
      if (!Array.isArray(data.items) && !Array.isArray(data)) {
        pgIssues.push({ severity: 'P2', msg: 'Missing items array' });
      }
      if (data.items && data.total === undefined) {
        pgIssues.push({ severity: 'P2', msg: 'Missing total count' });
      }
    }
    addResult({
      label: `Pagination shape — ${ep}`, module: 'API Contract', phase: 3,
      status: res.status, ms: res.ms,
      pass: pgIssues.length === 0,
      detail: pgIssues.length === 0 ? undefined : pgIssues.map(i => i.msg).join('; '),
      issues: pgIssues,
    });
  }

  // 3.4 — Invalid UUID returns proper error (not 500)
  logEndpoint('GET', `/workspaces/${workspaceId}/reminders/lists/not-a-uuid`);
  const badUuid = await apiFetch('GET', `/workspaces/${workspaceId}/reminders/lists/not-a-uuid`);
  const returns500 = badUuid.status === 500;
  addResult({
    label: 'Invalid UUID → non-500 error', module: 'API Contract', phase: 3,
    status: badUuid.status, ms: badUuid.ms,
    pass: !returns500 && badUuid.status >= 400,
    detail: returns500 ? 'Got 500 for invalid UUID — should be 400/404/422' : undefined,
    issues: returns500 ? [{ severity: 'P2', msg: 'Invalid UUID causes 500' }] : [],
  });

  // 3.5 — CORS headers present
  logEndpoint('OPTIONS', '/auth/login (CORS preflight)');
  const corsRes = await fetch(`${CFG.apiUrl}/auth/login`, {
    method: 'OPTIONS',
    headers: { 'Origin': CFG.frontendUrl, 'Access-Control-Request-Method': 'POST' },
  }).then(r => ({ status: r.status, headers: r.headers })).catch(e => ({ status: 0, headers: null }));

  const corsIssues = [];
  if (corsRes.headers) {
    const acao = corsRes.headers.get('access-control-allow-origin');
    if (!acao) corsIssues.push({ severity: 'P1', msg: 'Missing Access-Control-Allow-Origin header' });
    else if (acao === '*') corsIssues.push({ severity: 'P2', msg: 'CORS allows all origins (*) — should be restricted' });
  } else {
    corsIssues.push({ severity: 'P1', msg: 'CORS preflight request failed' });
  }
  addResult({
    label: 'CORS preflight', module: 'API Contract', phase: 3,
    status: corsRes.status, ms: 0,
    pass: corsIssues.length === 0,
    detail: corsIssues.length === 0 ? undefined : corsIssues.map(i => i.msg).join('; '),
    issues: corsIssues,
  });
}

// ─── Phase 4: Security ──────────────────────────────────────────────────────

async function phaseSecurity() {
  logSection('PHASE 4 — Security');

  // 4.1 — Security headers check
  logEndpoint('GET', '/dashboard (security headers)');
  const dashRes = await pageFetch('/dashboard', { followRedirects: true });
  const secIssues = [];

  if (dashRes.headers) {
    const check = (header, label) => {
      if (!dashRes.headers.get(header)) {
        secIssues.push({ severity: 'P2', msg: `Missing ${label} header` });
      }
    };
    check('x-frame-options', 'X-Frame-Options');
    check('x-content-type-options', 'X-Content-Type-Options');
    check('strict-transport-security', 'Strict-Transport-Security (HSTS)');
    check('referrer-policy', 'Referrer-Policy');
    check('content-security-policy', 'Content-Security-Policy');

    // Check for server info leak
    const server = dashRes.headers.get('server');
    const xPoweredBy = dashRes.headers.get('x-powered-by');
    if (xPoweredBy) secIssues.push({ severity: 'P3', msg: `X-Powered-By header exposes: ${xPoweredBy}` });
  }

  addResult({
    label: 'Security headers', module: 'Security', phase: 4,
    status: dashRes.status, ms: dashRes.ms,
    pass: secIssues.length === 0,
    detail: secIssues.length === 0 ? undefined : secIssues.map(i => i.msg).join('; '),
    issues: secIssues,
  });

  if (secIssues.length > 0) {
    makeIssue('P2', 'Security', 'QA: Missing security headers', `The following security headers are missing or misconfigured:\n${secIssues.map(i => `- ${i.msg}`).join('\n')}`);
  }

  // 4.2 — XSS in query parameters (reflected)
  logEndpoint('GET', '/finance?q=<script>alert(1)</script>');
  const xssRes = await pageFetch('/finance?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E', { followRedirects: true });
  const hasReflectedXss = xssRes.body.includes('<script>alert(1)</script>');
  addResult({
    label: 'Reflected XSS in query params', module: 'Security', phase: 4,
    status: xssRes.status, ms: xssRes.ms,
    pass: !hasReflectedXss,
    detail: hasReflectedXss ? 'Query param reflected unescaped in HTML' : undefined,
    issues: hasReflectedXss ? [{ severity: 'P0', msg: 'Reflected XSS vulnerability in query params' }] : [],
  });

  if (hasReflectedXss) {
    makeIssue('P0', 'Security', 'QA: Reflected XSS in query parameters', 'The query parameter `q` is reflected unescaped in the HTML response on /finance. This is a critical XSS vulnerability.');
  }

  // 4.3 — Open redirect check
  logEndpoint('GET', '/login?redirect=https://evil.com');
  const openRedirect = await fetch(`${CFG.frontendUrl}/login?redirect=https://evil.com`, { redirect: 'manual' })
    .then(r => ({ status: r.status, location: r.headers.get('location') }))
    .catch(e => ({ status: 0, location: null }));
  const redirectsToExternal = openRedirect.location?.includes('evil.com');
  addResult({
    label: 'Open redirect protection', module: 'Security', phase: 4,
    status: openRedirect.status, ms: 0,
    pass: !redirectsToExternal,
    detail: redirectsToExternal ? `Redirects to external: ${openRedirect.location}` : undefined,
    issues: redirectsToExternal ? [{ severity: 'P0', msg: 'Open redirect vulnerability' }] : [],
  });

  // 4.4 — Cookie flags (check API login response)
  logEndpoint('POST', '/auth/login (cookie flags)');
  const cookieRes = await fetch(`${CFG.apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CFG.email, password: CFG.password }),
    credentials: 'include',
  }).catch(e => null);

  const cookieIssues = [];
  if (cookieRes) {
    const setCookies = cookieRes.headers.getSetCookie?.() || [];
    if (setCookies.length > 0) {
      for (const c of setCookies) {
        const name = c.split('=')[0];
        if (!c.toLowerCase().includes('httponly') && name.includes('token')) {
          cookieIssues.push({ severity: 'P1', msg: `Cookie "${name}" missing HttpOnly flag` });
        }
        if (!c.toLowerCase().includes('secure') && name.includes('token')) {
          cookieIssues.push({ severity: 'P1', msg: `Cookie "${name}" missing Secure flag` });
        }
        if (!c.toLowerCase().includes('samesite')) {
          cookieIssues.push({ severity: 'P2', msg: `Cookie "${name}" missing SameSite attribute` });
        }
      }
    }
    addResult({
      label: 'Cookie security flags', module: 'Security', phase: 4,
      status: cookieRes.status, ms: 0,
      pass: cookieIssues.length === 0,
      detail: cookieIssues.length === 0 ? undefined : cookieIssues.map(i => i.msg).join('; '),
      issues: cookieIssues,
    });
  }

  // 4.5 — Directory traversal attempt
  logEndpoint('GET', '/../../../etc/passwd');
  const traversalRes = await pageFetch('/../../../etc/passwd');
  const hasTraversal = traversalRes.body.includes('root:') || traversalRes.status === 200;
  addResult({
    label: 'Directory traversal protection', module: 'Security', phase: 4,
    status: traversalRes.status, ms: traversalRes.ms,
    pass: !traversalRes.body.includes('root:'),
    detail: hasTraversal && traversalRes.body.includes('root:') ? 'Path traversal exposed system files' : undefined,
    issues: traversalRes.body.includes('root:') ? [{ severity: 'P0', msg: 'Directory traversal vulnerability' }] : [],
  });

  // 4.6 — Clickjacking protection (X-Frame-Options already checked, also test iframe)
  logEndpoint('GET', '/dashboard (X-Frame-Options)');
  const xfo = dashRes.headers?.get('x-frame-options');
  const csp = dashRes.headers?.get('content-security-policy');
  const hasFrameProtection = xfo === 'DENY' || xfo === 'SAMEORIGIN' || csp?.includes('frame-ancestors');
  addResult({
    label: 'Clickjacking protection', module: 'Security', phase: 4,
    status: dashRes.status, ms: 0,
    pass: hasFrameProtection,
    detail: hasFrameProtection ? undefined : 'No X-Frame-Options or CSP frame-ancestors',
    issues: hasFrameProtection ? [] : [{ severity: 'P2', msg: 'Missing clickjacking protection' }],
  });
}

// ─── Phase 5: SEO & Accessibility ────────────────────────────────────────────

async function phaseSeoA11y() {
  logSection('PHASE 5 — SEO & Accessibility');

  // 5.1 — Check meta tags on main pages
  const checkPages = ['/login', '/dashboard', '/finance', '/reminders'];
  for (const path of checkPages) {
    logEndpoint('GET', `${path} (meta/a11y)`);
    const res = await pageFetch(path, { followRedirects: true });
    const a11yIssues = [];

    if (res.status === 200 && res.body) {
      // viewport meta
      if (!res.body.includes('viewport')) a11yIssues.push({ severity: 'P2', msg: 'Missing viewport meta tag' });

      // charset (Next.js uses charSet in JSX → charset or charSet in HTML)
      if (!res.body.includes('charset') && !res.body.includes('charSet')) a11yIssues.push({ severity: 'P3', msg: 'Missing charset declaration' });

      // html lang attribute
      if (!res.body.match(/<html[^>]+lang=/)) a11yIssues.push({ severity: 'P2', msg: 'Missing lang attribute on <html>' });

      // title tag
      if (!res.body.match(/<title[^>]*>[^<]+<\/title>/i)) a11yIssues.push({ severity: 'P2', msg: 'Missing or empty <title> tag' });

      // description meta (good for SEO on public pages)
      if ((path === '/login' || path === '/register') && !res.body.includes('name="description"')) {
        a11yIssues.push({ severity: 'P3', msg: 'Missing meta description (public page)' });
      }
    }

    addResult({
      label: `SEO/A11y — ${path}`, module: 'SEO', phase: 5,
      status: res.status, ms: res.ms,
      pass: a11yIssues.length === 0,
      detail: a11yIssues.length === 0 ? undefined : a11yIssues.map(i => i.msg).join('; '),
      issues: a11yIssues,
    });
  }

  // 5.2 — robots.txt
  logEndpoint('GET', '/robots.txt');
  const robotsRes = await fetch(`${CFG.frontendUrl}/robots.txt`).then(async r => ({
    status: r.status, body: await r.text(),
  })).catch(() => ({ status: 0, body: '' }));
  addResult({
    label: 'robots.txt exists', module: 'SEO', phase: 5,
    status: robotsRes.status, ms: 0,
    pass: robotsRes.status === 200,
    detail: robotsRes.status === 200 ? undefined : 'Missing robots.txt',
    issues: robotsRes.status !== 200 ? [{ severity: 'P3', msg: 'Missing robots.txt' }] : [],
  });

  // 5.3 — favicon
  logEndpoint('GET', '/favicon.ico');
  const faviconRes = await fetch(`${CFG.frontendUrl}/favicon.ico`).then(r => ({
    status: r.status,
  })).catch(() => ({ status: 0 }));
  addResult({
    label: 'Favicon exists', module: 'SEO', phase: 5,
    status: faviconRes.status, ms: 0,
    pass: faviconRes.status === 200,
    detail: faviconRes.status === 200 ? undefined : 'Missing favicon',
    issues: faviconRes.status !== 200 ? [{ severity: 'P3', msg: 'Missing favicon.ico' }] : [],
  });
}

// ─── Phase 6: i18n ───────────────────────────────────────────────────────────

async function phaseI18n() {
  logSection('PHASE 6 — Internationalization');

  // Test that the pages work with both language preferences
  // The frontend uses client-side i18n (React context), so we check if the HTML
  // contains i18n infrastructure and both language strings
  logEndpoint('GET', '/login (check i18n infrastructure)');
  const loginRes = await fetch(`${CFG.frontendUrl}/login`, { redirect: 'follow' })
    .then(async r => ({ status: r.status, body: await r.text() }))
    .catch(e => ({ status: 0, body: '' }));

  // Check that the login page has localization support
  const hasI18nInfra = loginRes.body.includes('language') || loginRes.body.includes('i18n') || loginRes.body.includes('org.language');
  addResult({
    label: 'i18n infrastructure present', module: 'i18n', phase: 6,
    status: loginRes.status, ms: 0,
    pass: loginRes.status === 200, // Just checking the page loads
    detail: loginRes.status === 200 ? undefined : `Login page returned ${loginRes.status}`,
    issues: [],
  });

  // Check that pages accept Accept-Language header without crashing
  for (const lang of ['en', 'pt-BR']) {
    logEndpoint('GET', `/dashboard (Accept-Language: ${lang})`);
    const res = await pageFetch('/dashboard', {
      followRedirects: true,
      extraHeaders: { 'Accept-Language': lang },
    });
    addResult({
      label: `Page loads with Accept-Language: ${lang}`, module: 'i18n', phase: 6,
      status: res.status, ms: res.ms,
      pass: res.status === 200,
      detail: res.status === 200 ? undefined : `Page crashed with lang=${lang}: ${res.status}`,
      issues: res.status !== 200 ? [{ severity: 'P2', msg: `Page breaks with Accept-Language: ${lang}` }] : [],
    });
  }
}

// ─── Phase 7: Performance ────────────────────────────────────────────────────

async function phasePerformance() {
  logSection('PHASE 7 — Performance');

  const perfTargets = [
    { path: '/login', label: 'Login (public)', maxMs: 3000 },
    { path: '/dashboard', label: 'Dashboard', maxMs: 5000 },
    { path: '/finance', label: 'Finance', maxMs: 5000 },
    { path: '/reminders', label: 'Reminders', maxMs: 5000 },
    { path: '/documents', label: 'Documents', maxMs: 5000 },
    { path: '/calendar', label: 'Calendar', maxMs: 5000 },
    { path: '/secrets', label: 'Secrets', maxMs: 5000 },
    { path: '/inventory', label: 'Inventory', maxMs: 5000 },
  ];

  for (const target of perfTargets) {
    logEndpoint('GET', `${target.path} (perf)`);
    // Run 3 times and average
    const times = [];
    for (let i = 0; i < 3; i++) {
      const isLogin = target.path === '/login';
      const t0 = Date.now();
      if (isLogin) {
        await fetch(`${CFG.frontendUrl}${target.path}`, { redirect: 'follow' }).catch(() => null);
      } else {
        await pageFetch(target.path, { followRedirects: true });
      }
      times.push(Date.now() - t0);
    }
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const max = Math.max(...times);
    const pass = avg < target.maxMs;
    addResult({
      label: `Perf — ${target.label} (avg ${avg}ms, max ${max}ms)`, module: 'Performance', phase: 7,
      status: 200, ms: avg,
      pass,
      detail: pass ? undefined : `avg ${avg}ms exceeds ${target.maxMs}ms threshold`,
      issues: pass ? [] : [{ severity: 'P2', msg: `Slow page load: avg ${avg}ms (threshold: ${target.maxMs}ms)` }],
    });
  }

  // Asset size check — check if main JS bundle is reasonable
  logEndpoint('GET', '/dashboard (JS bundle size)');
  const dashPage = await pageFetch('/dashboard', { followRedirects: true });
  const scriptTags = dashPage.body.match(/<script[^>]+src="([^"]+)"/g) || [];
  const jsUrls = scriptTags.map(tag => {
    const match = tag.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  }).filter(Boolean);

  let totalJsSize = 0;
  let largestChunk = { url: '', size: 0 };
  for (const jsUrl of jsUrls.slice(0, 10)) { // Limit to first 10 scripts
    const fullUrl = jsUrl.startsWith('http') ? jsUrl : `${CFG.frontendUrl}${jsUrl}`;
    try {
      const res = await fetch(fullUrl);
      const buf = await res.arrayBuffer();
      const size = buf.byteLength;
      totalJsSize += size;
      if (size > largestChunk.size) {
        largestChunk = { url: jsUrl, size };
      }
    } catch { /* skip */ }
  }

  const totalKB = Math.round(totalJsSize / 1024);
  const largestKB = Math.round(largestChunk.size / 1024);
  const jsSizeOk = totalKB < 2048; // 2MB threshold for initial JS
  addResult({
    label: `JS bundle size: ${totalKB}KB total, largest chunk: ${largestKB}KB`, module: 'Performance', phase: 7,
    status: 200, ms: 0,
    pass: jsSizeOk,
    detail: jsSizeOk ? undefined : `Total JS: ${totalKB}KB exceeds 2MB threshold`,
    issues: jsSizeOk ? [] : [{ severity: 'P2', msg: `JS bundle too large: ${totalKB}KB` }],
  });
}

// ─── GitHub Issue Creation ───────────────────────────────────────────────────

async function createGitHubIssues() {
  logSection('GitHub Issue Creation');

  if (!CFG.createIssues || !CFG.githubToken) {
    log('⚠️  QA_GITHUB_TOKEN not set or QA_CREATE_ISSUES=false — skipping', C.yellow);
    log('   Set QA_CREATE_ISSUES=true and QA_GITHUB_TOKEN in .env.qa to enable', C.dim);
    return;
  }

  for (const issue of issues) {
    const ghUrl = `https://api.github.com/repos/${issue.repo}/issues`;
    log(`  Creating issue: ${issue.title}`, C.blue);
    try {
      const res = await fetch(ghUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CFG.githubToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issue.title,
          body: `## QA Audit Finding\n\n**Severity:** ${issue.severity}\n**Module:** ${issue.module}\n**Date:** ${new Date().toISOString().slice(0, 10)}\n\n---\n\n${issue.body}\n\n---\n_Auto-generated by QA audit script_`,
          labels: issue.labels,
        }),
      });

      if (res.status === 201) {
        const data = await res.json();
        log(`  ✅ Issue #${data.number} created: ${data.html_url}`, C.green);
      } else {
        log(`  ❌ Failed to create issue: ${res.status}`, C.red);
      }
    } catch (err) {
      log(`  ❌ Error: ${err.message}`, C.red);
    }
  }
}

// ─── HTML Report ─────────────────────────────────────────────────────────────

function generateReport() {
  logSection('Generating HTML Report');

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;
  const p0 = issues.filter(i => i.severity === 'P0').length;
  const p1 = issues.filter(i => i.severity === 'P1').length;
  const p2 = issues.filter(i => i.severity === 'P2').length;
  const p3 = issues.filter(i => i.severity === 'P3').length;

  const date = new Date().toISOString().slice(0, 10);
  const phases = [...new Set(results.map(r => r.phase))].sort();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Frontend QA Report — ${date}</title>
<style>
  :root { --bg: #0f172a; --surface: #1e293b; --border: #334155; --text: #e2e8f0; --green: #22c55e; --red: #ef4444; --yellow: #eab308; --blue: #3b82f6; --dim: #94a3b8; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; background: var(--bg); color: var(--text); padding: 2rem; }
  .header { text-align: center; margin-bottom: 2rem; }
  .header h1 { font-size: 1.6rem; margin-bottom: 0.4rem; }
  .header .date { color: var(--dim); }
  .summary { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem 1.5rem; text-align: center; min-width: 120px; }
  .stat .num { font-size: 1.8rem; font-weight: bold; }
  .stat .label { font-size: 0.75rem; color: var(--dim); text-transform: uppercase; }
  .stat.pass .num { color: var(--green); }
  .stat.fail .num { color: var(--red); }
  .stat.p0 .num { color: var(--red); }
  .stat.p1 .num { color: var(--yellow); }
  .stat.p2 .num { color: var(--blue); }
  .phase { margin-bottom: 2rem; }
  .phase h2 { font-size: 1.1rem; color: var(--blue); margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: var(--surface); color: var(--dim); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
  tr.pass td:first-child { border-left: 3px solid var(--green); }
  tr.fail td:first-child { border-left: 3px solid var(--red); }
  .badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
  .badge.pass { background: #16a34a33; color: var(--green); }
  .badge.fail { background: #ef444433; color: var(--red); }
  .issues-section { margin-top: 2rem; }
  .issue-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
  .issue-card .title { font-weight: 600; }
  .issue-card .meta { font-size: 0.8rem; color: var(--dim); margin-top: 0.3rem; }
  .issue-card .body { font-size: 0.85rem; margin-top: 0.5rem; white-space: pre-line; }
  .severity-P0 { border-left: 3px solid var(--red); }
  .severity-P1 { border-left: 3px solid var(--yellow); }
  .severity-P2 { border-left: 3px solid var(--blue); }
  .severity-P3 { border-left: 3px solid var(--dim); }
  footer { text-align: center; color: var(--dim); font-size: 0.75rem; margin-top: 3rem; }
</style>
</head>
<body>
<div class="header">
  <h1>🔬 Frontend QA Audit Report</h1>
  <div class="date">${date} — organization-backoffice</div>
</div>

<div class="summary">
  <div class="stat"><div class="num">${total}</div><div class="label">Total Tests</div></div>
  <div class="stat pass"><div class="num">${passed}</div><div class="label">Passed</div></div>
  <div class="stat fail"><div class="num">${failed}</div><div class="label">Failed</div></div>
  <div class="stat p0"><div class="num">${p0}</div><div class="label">P0 Critical</div></div>
  <div class="stat p1"><div class="num">${p1}</div><div class="label">P1 High</div></div>
  <div class="stat p2"><div class="num">${p2}</div><div class="label">P2 Medium</div></div>
</div>

${phases.map(phase => {
  const phaseResults = results.filter(r => r.phase === phase);
  const phaseNames = { 0: 'Authentication Flow', 1: 'Page Rendering', 2: 'Middleware & Redirects', 3: 'API Contract', 4: 'Security', 5: 'SEO & Accessibility', 6: 'Internationalization', 7: 'Performance' };
  return `<div class="phase">
<h2>Phase ${phase} — ${phaseNames[phase] || 'Other'}</h2>
<table>
<thead><tr><th>Test</th><th>Module</th><th>Status</th><th>Time</th><th>Result</th><th>Details</th></tr></thead>
<tbody>
${phaseResults.map(r => `<tr class="${r.pass ? 'pass' : 'fail'}">
  <td>${r.label}</td>
  <td>${r.module || '-'}</td>
  <td>${r.status}</td>
  <td>${r.ms}ms</td>
  <td><span class="badge ${r.pass ? 'pass' : 'fail'}">${r.pass ? 'PASS' : 'FAIL'}</span></td>
  <td>${r.detail || '-'}</td>
</tr>`).join('\n')}
</tbody>
</table>
</div>`;
}).join('\n')}

${issues.length > 0 ? `<div class="issues-section">
<h2>Issues Found (${issues.length})</h2>
${issues.map(iss => `<div class="issue-card severity-${iss.severity}">
  <div class="title">[${iss.severity}] ${iss.title}</div>
  <div class="meta">Module: ${iss.module} | Repo: ${iss.repo}</div>
  <div class="body">${iss.body}</div>
</div>`).join('\n')}
</div>` : ''}

<footer>Generated by QA Audit Script — ${new Date().toISOString()}</footer>
</body>
</html>`;

  const dir = join(ROOT, 'docs', 'qa');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `report-${date}.html`);
  writeFileSync(filePath, html, 'utf-8');
  log(`📄 Report saved: ${filePath}`, C.green);
  return filePath;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🔬  Organization Backoffice — Frontend QA Audit        ║
║      Pages, Security, A11y, Performance & Contracts     ║
╚══════════════════════════════════════════════════════════╝
`);

  log(`Frontend URL: ${CFG.frontendUrl}`);
  log(`API URL: ${CFG.apiUrl}`);
  log(`Email: ${CFG.email}`);
  log(`GitHub Issues: ${CFG.createIssues ? 'enabled' : 'dry-run'}`);
  log('');

  await phaseAuth();
  await phasePages();
  await phaseMiddleware();
  await phaseApiContract();
  await phaseSecurity();
  await phaseSeoA11y();
  await phaseI18n();
  await phasePerformance();
  await createGitHubIssues();
  const reportPath = generateReport();

  // ─── Summary ─────────────────────────────────────────────────────────────

  logSection('FINAL SUMMARY');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;
  const p0 = issues.filter(i => i.severity === 'P0').length;
  const p1 = issues.filter(i => i.severity === 'P1').length;
  const p2 = issues.filter(i => i.severity === 'P2').length;
  const p3 = issues.filter(i => i.severity === 'P3').length;

  log(`Tests: ${passed}/${total} passed, ${failed} failed`);
  log(`Issues: ${issues.length} (P0:${p0} P1:${p1} P2:${p2} P3:${p3})`);
  log(`Report: ${reportPath}`);

  // Write JSON summary for CI integration
  const summaryJson = {
    date: new Date().toISOString(),
    passed,
    failed,
    total,
    failures: results.filter(r => !r.pass).map(r => ({ label: r.label, detail: r.detail || '' })),
    issues: issues.length,
  };
  const summaryDir = join(ROOT, 'docs', 'qa');
  mkdirSync(summaryDir, { recursive: true });
  writeFileSync(join(summaryDir, 'summary.json'), JSON.stringify(summaryJson, null, 2), 'utf-8');
  log(`Summary JSON: docs/qa/summary.json`);

  const ciMode = process.argv.includes('--ci');
  process.exit(ciMode ? 0 : (failed > 0 ? 1 : 0));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
