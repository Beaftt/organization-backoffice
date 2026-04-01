#!/usr/bin/env node

/**
 * QA Dashboard Generator — Organization Backoffice
 *
 * Combines HTTP audit and E2E browser reports into a single dashboard page.
 * Used by GitHub Actions to produce the final QA report hosted on GitHub Pages.
 *
 * Usage:
 *   node scripts/qa-dashboard.mjs --http-dir=report/http --e2e-dir=report/e2e --out=report/combined/index.html
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse CLI args
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v || 'true']; })
);

const httpDir = args['http-dir'] || 'report/http';
const e2eDir = args['e2e-dir'] || 'report/e2e';
const outFile = args['out'] || 'report/combined/index.html';

mkdirSync(dirname(outFile), { recursive: true });

// ─── Load summaries ──────────────────────────────────────────────────────────

function loadJson(dir, filename) {
  const path = join(dir, filename);
  if (existsSync(path)) {
    try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
  }
  return null;
}

function findHtmlReport(dir, prefix) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.html')).sort();
  return files.length > 0 ? files[files.length - 1] : null;
}

const httpSummary = loadJson(httpDir, 'summary.json');
const e2eSummary = loadJson(e2eDir, 'e2e-summary.json');
const httpReport = findHtmlReport(httpDir, 'report-');
const e2eReport = findHtmlReport(e2eDir, 'e2e-report-');

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const date = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

// ─── Generate Dashboard ──────────────────────────────────────────────────────

const httpPassed = httpSummary?.passed ?? '?';
const httpFailed = httpSummary?.failed ?? '?';
const httpTotal = httpSummary?.total ?? '?';
const e2ePassed = e2eSummary?.passed ?? '?';
const e2eFailed = e2eSummary?.failed ?? '?';
const e2eTotal = e2eSummary?.total ?? '?';

const totalPassed = (httpSummary?.passed || 0) + (e2eSummary?.passed || 0);
const totalFailed = (httpSummary?.failed || 0) + (e2eSummary?.failed || 0);
const totalTests = totalPassed + totalFailed;
const healthScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

const httpFailures = httpSummary?.failures || [];
const e2eFailures = e2eSummary?.failures || [];
const allFailures = [
  ...httpFailures.map(f => ({ ...f, source: 'HTTP Audit' })),
  ...e2eFailures.map(f => ({ ...f, source: 'E2E Browser' })),
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QA Dashboard — ${date}</title>
<style>
  :root { --bg: #0f172a; --surface: #1e293b; --border: #334155; --text: #e2e8f0; --green: #22c55e; --red: #ef4444; --yellow: #eab308; --blue: #3b82f6; --dim: #94a3b8; --purple: #a78bfa; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); }
  .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
  header { text-align: center; margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
  header h1 { font-size: 2rem; margin-bottom: 0.3rem; }
  header .sub { color: var(--dim); font-size: 0.9rem; }
  .health { text-align: center; margin-bottom: 2rem; }
  .health .score { font-size: 4rem; font-weight: 800; }
  .health .score.good { color: var(--green); }
  .health .score.warn { color: var(--yellow); }
  .health .score.bad { color: var(--red); }
  .health .label { color: var(--dim); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
  .card h2 { font-size: 1rem; color: var(--blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
  .card h2 .icon { font-size: 1.2rem; }
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
  .stat-row .label { color: var(--dim); font-size: 0.85rem; } .stat-row .value { font-weight: 600; font-size: 1.1rem; }
  .stat-row .value.pass { color: var(--green); } .stat-row .value.fail { color: var(--red); } .stat-row .value.total { color: var(--text); }
  .failures { margin-bottom: 2rem; }
  .failures h2 { font-size: 1.1rem; margin-bottom: 1rem; color: var(--red); }
  .failure-item { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--red); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; }
  .failure-item .source { font-size: 0.7rem; background: #334155; color: var(--dim); padding: 2px 6px; border-radius: 4px; margin-right: 0.5rem; }
  .failure-item .detail { color: var(--dim); font-size: 0.8rem; margin-top: 0.3rem; }
  .links { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
  .links a { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 1.2rem; color: var(--blue); text-decoration: none; font-size: 0.85rem; transition: border-color 0.2s; }
  .links a:hover { border-color: var(--blue); }
  footer { text-align: center; color: var(--dim); font-size: 0.75rem; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); }
  @media (max-width: 640px) { .container { padding: 1rem; } .health .score { font-size: 3rem; } }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>🛡️ QA Dashboard</h1>
    <div class="sub">Organization Platform — ${date} — Run #${process.env.GITHUB_RUN_NUMBER || 'local'}</div>
  </header>

  <div class="health">
    <div class="score ${healthScore >= 95 ? 'good' : healthScore >= 80 ? 'warn' : 'bad'}">${healthScore}%</div>
    <div class="label">Health Score (${totalPassed}/${totalTests} passed)</div>
  </div>

  <div class="grid">
    <div class="card">
      <h2><span class="icon">🔌</span> HTTP Audit</h2>
      <div class="stat-row"><span class="label">Total</span><span class="value total">${httpTotal}</span></div>
      <div class="stat-row"><span class="label">Passed</span><span class="value pass">${httpPassed}</span></div>
      <div class="stat-row"><span class="label">Failed</span><span class="value fail">${httpFailed}</span></div>
    </div>
    <div class="card">
      <h2><span class="icon">🖥️</span> E2E Browser</h2>
      <div class="stat-row"><span class="label">Total</span><span class="value total">${e2eTotal}</span></div>
      <div class="stat-row"><span class="label">Passed</span><span class="value pass">${e2ePassed}</span></div>
      <div class="stat-row"><span class="label">Failed</span><span class="value fail">${e2eFailed}</span></div>
    </div>
    <div class="card">
      <h2><span class="icon">📊</span> Overall</h2>
      <div class="stat-row"><span class="label">Total Tests</span><span class="value total">${totalTests}</span></div>
      <div class="stat-row"><span class="label">Pass Rate</span><span class="value ${healthScore >= 95 ? 'pass' : 'fail'}">${healthScore}%</span></div>
      <div class="stat-row"><span class="label">Failures</span><span class="value fail">${totalFailed}</span></div>
    </div>
  </div>

  <div class="links">
    ${httpReport ? `<a href="${escapeHtml(httpReport)}">📄 HTTP Audit Report</a>` : ''}
    ${e2eReport ? `<a href="${escapeHtml(e2eReport)}">🖥️ E2E Report</a>` : ''}
    <a href="screenshots/">📸 Screenshots</a>
  </div>

  ${allFailures.length > 0 ? `
  <div class="failures">
    <h2>❌ Failures (${allFailures.length})</h2>
    ${allFailures.map(f => `
    <div class="failure-item">
      <span class="source">${escapeHtml(f.source)}</span>
      <strong>${escapeHtml(f.label)}</strong>
      ${f.detail ? `<div class="detail">${escapeHtml(f.detail)}</div>` : ''}
    </div>`).join('')}
  </div>` : '<div style="text-align:center;color:var(--green);font-size:1.2rem;margin:2rem 0;">✅ All tests passed!</div>'}

  <footer>
    Generated ${now} — Organization QA Pipeline<br>
    Commit: ${process.env.GITHUB_SHA?.slice(0, 7) || 'local'} | Branch: ${process.env.GITHUB_REF_NAME || 'local'}
  </footer>
</div>
</body>
</html>`;

writeFileSync(outFile, html, 'utf-8');
console.log(`Dashboard generated: ${outFile}`);
console.log(`  HTTP: ${httpPassed}/${httpTotal} | E2E: ${e2ePassed}/${e2eTotal} | Health: ${healthScore}%`);
