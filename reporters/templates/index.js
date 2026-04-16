/**
 * HTML template for the audit index page.
 *
 * @module reporters/templates/index
 */

const { escapeHtml } = require('../../utils/html');

/**
 * Generates a summary card for an audited page.
 *
 * @param {Object} entry
 * @param {string} entry.fileName  - File name (without extension)
 * @param {string} entry.url       - Analyzed URL
 * @param {number} entry.issueCount - Total issues
 * @param {number} entry.errors    - Number of errors
 * @param {number} entry.warnings  - Number of warnings
 * @param {number} entry.notices   - Number of notices
 * @param {string} entry.reportFile - Relative path to the HTML report
 * @returns {string}
 */
function renderPageCard(entry, index) {
    const severity = entry.errors > 0 ? 'error' : entry.warnings > 0 ? 'warning' : 'ok';
    const severityLabel = { error: 'Errors', warning: 'Warnings', ok: 'OK' }[severity];

    return `
    <tr class="row-${severity}" data-severity="${severity}">
        <td class="col-num">${index + 1}</td>
        <td class="col-page">
            <a href="${escapeHtml(entry.url)}" target="_blank" class="url-link">
                ${escapeHtml(entry.fileName)}
            </a>
        </td>
        <td class="col-total ${entry.issueCount === 0 ? 'count-ok' : 'count-bad'}">${entry.issueCount}</td>
        <td class="col-errors">${entry.errors > 0 ? `<span class="badge badge-error">${entry.errors}</span>` : '<span class="badge badge-zero">0</span>'}</td>
        <td class="col-warnings">${entry.warnings > 0 ? `<span class="badge badge-warning">${entry.warnings}</span>` : '<span class="badge badge-zero">0</span>'}</td>
        <td class="col-notices">${entry.notices > 0 ? `<span class="badge badge-notice">${entry.notices}</span>` : '<span class="badge badge-zero">0</span>'}</td>
        <td class="col-status"><span class="status-chip status-${severity}">${severityLabel}</span></td>
        <td class="col-report"><a href="${escapeHtml(entry.reportFile)}" class="btn-report">View report -></a></td>
    </tr>`;
}

/**
 * Generates the complete HTML for the index page.
 *
 * @param {Object} params
 * @param {string}   params.baseUrl     - Base URL of the site
 * @param {string}   params.standard    - WCAG Standard
 * @param {string}   params.generatedAt - Generation Date/Time
 * @param {Object[]} params.entries     - Array of page entries
 * @returns {string}
 */
function renderIndexPage({ baseUrl, standard, generatedAt, entries }) {
    const totalIssues  = entries.reduce((s, e) => s + e.issueCount, 0);
    const totalErrors  = entries.reduce((s, e) => s + e.errors, 0);
    const totalWarnings= entries.reduce((s, e) => s + e.warnings, 0);
    const totalNotices = entries.reduce((s, e) => s + e.notices, 0);
    const pagesWithErrors = entries.filter(e => e.errors > 0).length;

    const rows = entries.map((entry, i) => renderPageCard(entry, i)).join('');

    return `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Index — ${escapeHtml(baseUrl)}</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #0f1117;
            color: #e2e8f0;
            min-height: 100vh;
            padding: 0 0 60px;
        }

        /* ── Header ── */
        .hero {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-bottom: 1px solid #1e293b;
            padding: 40px 48px 36px;
        }
        .hero-eyebrow {
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 10px;
        }
        .hero h1 {
            font-size: 28px;
            font-weight: 700;
            color: #f1f5f9;
            margin-bottom: 8px;
        }
        .hero-url {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 6px 14px;
            font-family: monospace;
            font-size: 13px;
            color: #94a3b8;
            text-decoration: none;
            transition: color .2s;
        }
        .hero-url:hover { color: #e2e8f0; }
        .meta {
            margin-top: 14px;
            font-size: 12px;
            color: #475569;
        }
        .meta span { margin-right: 20px; }

        /* ── Stats Bar ── */
        .stats-bar {
            display: flex;
            gap: 16px;
            padding: 28px 48px;
            flex-wrap: wrap;
        }
        .stat {
            flex: 1;
            min-width: 140px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 18px 22px;
        }
        .stat-value {
            font-size: 32px;
            font-weight: 800;
            line-height: 1;
        }
        .stat-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 6px;
        }
        .stat-pages .stat-value  { color: #60a5fa; }
        .stat-issues .stat-value { color: #f59e0b; }
        .stat-errors .stat-value { color: #f87171; }
        .stat-warnings .stat-value { color: #fbbf24; }
        .stat-notices .stat-value  { color: #818cf8; }

        /* ── Toolbar ── */
        .toolbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 48px 20px;
            flex-wrap: wrap;
        }
        .toolbar-label { font-size: 12px; color: #64748b; margin-right: 4px; }
        .filter-btn {
            padding: 7px 16px;
            border: 1px solid #334155;
            border-radius: 20px;
            background: transparent;
            color: #94a3b8;
            font-size: 12px;
            cursor: pointer;
            transition: all .2s;
        }
        .filter-btn:hover { border-color: #60a5fa; color: #60a5fa; }
        .filter-btn.active { background: #1d4ed8; border-color: #1d4ed8; color: white; }

        /* ── Table ── */
        .table-wrap {
            margin: 0 48px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 14px;
            overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #0f172a; }
        th {
            padding: 14px 16px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #64748b;
            text-align: left;
            border-bottom: 1px solid #334155;
        }
        td { padding: 14px 16px; border-bottom: 1px solid #1e3a5f20; font-size: 14px; }
        tr:last-child td { border-bottom: none; }
        tbody tr { transition: background .15s; }
        tbody tr:hover { background: #ffffff08; }

        .col-num   { color: #475569; font-size: 12px; width: 40px; }
        .col-page  { min-width: 160px; }
        .col-total, .col-errors, .col-warnings, .col-notices { text-align: center; width: 90px; }

        .url-link {
            color: #93c5fd;
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .url-link:hover { color: #60a5fa; text-decoration: underline; }
        .ext-icon { font-size: 11px; opacity: .6; }

        .count-bad { color: #fbbf24; font-weight: 700; }
        .count-ok  { color: #4ade80; }

        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-error   { background: #7f1d1d; color: #fca5a5; }
        .badge-warning { background: #78350f; color: #fde68a; }
        .badge-notice  { background: #1e1b4b; color: #a5b4fc; }
        .badge-zero    { background: #1e293b; color: #475569; }

        .status-chip {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .5px;
        }
        .status-error   { background: #450a0a; color: #f87171; border: 1px solid #7f1d1d; }
        .status-warning { background: #431407; color: #fb923c; border: 1px solid #7c2d12; }
        .status-ok      { background: #052e16; color: #4ade80; border: 1px solid #14532d; }

        .btn-report {
            display: inline-block;
            padding: 6px 14px;
            background: #1d4ed8;
            color: white;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            transition: background .2s;
            white-space: nowrap;
        }
        .btn-report:hover { background: #2563eb; }

        /* ── Row hidden state ── */
        tr.hidden { display: none; }

        /* ── Footer ── */
        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #334155;
        }
    </style>
</head>
<body>

<div class="hero">
    <p class="hero-eyebrow">Accessibility Report</p>
    <h1>Index of audited pages</h1>
    <a href="${escapeHtml(baseUrl)}" target="_blank" class="hero-url">${escapeHtml(baseUrl)}</a>
    <p class="meta">
        <span>Standard: <strong>${escapeHtml(standard)}</strong></span>
        <span>Generated: <strong>${escapeHtml(generatedAt)}</strong></span>
    </p>
</div>

<div class="stats-bar">
    <div class="stat stat-pages">
        <div class="stat-value">${entries.length}</div>
        <div class="stat-label">Pages analyzed</div>
    </div>
    <div class="stat stat-errors">
        <div class="stat-value">${pagesWithErrors}</div>
        <div class="stat-label">Pages with errors</div>
    </div>
    <div class="stat stat-issues">
        <div class="stat-value">${totalIssues}</div>
        <div class="stat-label">Total issues</div>
    </div>
    <div class="stat stat-errors">
        <div class="stat-value">${totalErrors}</div>
        <div class="stat-label">Errors</div>
    </div>
    <div class="stat stat-warnings">
        <div class="stat-value">${totalWarnings}</div>
        <div class="stat-label">Warnings</div>
    </div>
    <div class="stat stat-notices">
        <div class="stat-value">${totalNotices}</div>
        <div class="stat-label">Notices</div>
    </div>
</div>

<div class="toolbar">
    <span class="toolbar-label">Filter:</span>
    <button class="filter-btn active" onclick="filterRows('all')">All (${entries.length})</button>
    <button class="filter-btn" onclick="filterRows('error')">With errors (${pagesWithErrors})</button>
    <button class="filter-btn" onclick="filterRows('warning')">Only warnings (${entries.filter(e => e.errors === 0 && e.warnings > 0).length})</button>
    <button class="filter-btn" onclick="filterRows('ok')">Success (${entries.filter(e => e.issueCount === 0).length})</button>
</div>

<div class="table-wrap">
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Page</th>
                <th>Total</th>
                <th>Errors</th>
                <th>Warnings</th>
                <th>Notices</th>
                <th>Status</th>
                <th>Report</th>
            </tr>
        </thead>
        <tbody id="tbody">
            ${rows}
        </tbody>
    </table>
</div>

<p class="footer">Automatically generated · Accessibility Audit ${escapeHtml(standard)}</p>

<script>
    function filterRows(severity) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        document.querySelectorAll('#tbody tr').forEach(tr => {
            const matches = severity === 'all' || tr.dataset.severity === severity;
            tr.classList.toggle('hidden', !matches);
        });
    }
</script>
</body>
</html>`;
}

module.exports = { renderIndexPage };
