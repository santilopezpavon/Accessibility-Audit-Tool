/**
 * HTML template for accessibility reports.
 *
 * Separated from business logic to facilitate maintenance
 * and allow for future alternative templates.
 *
 * @module reporters/templates/report
 */

const { escapeHtml } = require('../../utils/html');

/**
 * Generates the HTML block for an individual issue.
 *
 * @param {Object} issue - pa11y issue
 * @param {number} index - Issue index (1-based)
 * @returns {string} Issue HTML
 */
function renderIssue(issue, index) {
    return `
    <div class="issue type-${issue.type}" data-type="${issue.type}">
        <div class="issue-header" onclick="toggleIssue(this)">
            <div class="issue-header-left">
                <span class="chip chip-${issue.type}">${issue.type.toUpperCase()}</span>
                <span class="issue-num">#${index}</span>
                <span class="issue-code">${escapeHtml(issue.code)}</span>
            </div>
            <span class="toggle-icon"></span>
        </div>
        <div class="issue-body">
            <div class="issue-field">
                <span class="field-label">Message</span>
                <p class="field-value">${escapeHtml(issue.message)}</p>
            </div>
            <div class="issue-field">
                <span class="field-label">Selector</span>
                <code class="selector-box">${escapeHtml(issue.selector)}</code>
            </div>
            <div class="issue-field">
                <span class="field-label">HTML Context</span>
                <pre class="code-box"><code>${issue.context ? escapeHtml(issue.context) : '<em>No context available</em>'}</code></pre>
            </div>
        </div>
    </div>`;
}

/**
 * Generates the complete HTML for an accessibility report.
 *
 * @param {Object} params
 * @param {string}   params.pageUrl       - Analyzed URL
 * @param {string}   params.documentTitle - Document title
 * @param {string}   params.standard      - WCAG Standard used
 * @param {Object[]} params.issues        - Issues found
 * @returns {string} Complete report HTML
 */
function renderReport({ pageUrl, documentTitle, standard, issues }) {
    const errors   = issues.filter(i => i.type === 'error');
    const warnings = issues.filter(i => i.type === 'warning');
    const notices  = issues.filter(i => i.type === 'notice');

    // Sort: errors first, then warnings, then notices
    const sortedIssues = [...errors, ...warnings, ...notices];
    const issuesHtml   = sortedIssues.map((issue, i) => renderIssue(issue, i + 1)).join('');

    return `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report — ${escapeHtml(documentTitle || 'Untitled')}</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #0f1117;
            color: #e2e8f0;
            min-height: 100vh;
            padding: 0 0 60px;
        }

        /* ── Hero ── */
        .hero {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-bottom: 1px solid #1e293b;
            padding: 36px 48px 30px;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #64748b;
            text-decoration: none;
            font-size: 13px;
            margin-bottom: 16px;
            transition: color .2s;
        }
        .back-link:hover { color: #93c5fd; }
        .hero-eyebrow {
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 8px;
        }
        .hero h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; }
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
        .meta { margin-top: 12px; font-size: 12px; color: #475569; }
        .meta span { margin-right: 18px; }

        /* ── Stats bar ── */
        .stats-bar {
            display: flex;
            gap: 16px;
            padding: 24px 48px;
            flex-wrap: wrap;
        }
        .stat {
            flex: 1;
            min-width: 120px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 16px 20px;
        }
        .stat-value { font-size: 28px; font-weight: 800; line-height: 1; }
        .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
        .stat-total    .stat-value { color: #f59e0b; }
        .stat-errors   .stat-value { color: #f87171; }
        .stat-warnings .stat-value { color: #fbbf24; }
        .stat-notices  .stat-value { color: #818cf8; }

        /* ── Toolbar ── */
        .toolbar {
            display: flex;
            align-items: center;
            gap: 10px;
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
        .filter-btn.active-all     { background: #1d4ed8; border-color: #1d4ed8; color: white; }
        .filter-btn.active-error   { background: #991b1b; border-color: #991b1b; color: #fca5a5; }
        .filter-btn.active-warning { background: #92400e; border-color: #92400e; color: #fde68a; }
        .filter-btn.active-notice  { background: #312e81; border-color: #312e81; color: #a5b4fc; }

        /* ── Issues list ── */
        .issues-wrap { padding: 0 48px; display: flex; flex-direction: column; gap: 12px; }

        .issue {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            overflow: hidden;
            transition: transform .1s;
        }
        .issue:hover { transform: translateY(-1px); }

        /* Borde izquierdo de color por tipo */
        .type-error   { border-left: 5px solid #f87171; }
        .type-warning { border-left: 5px solid #fbbf24; }
        .type-notice  { border-left: 5px solid #818cf8; }

        .issue-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            cursor: pointer;
            user-select: none;
            gap: 12px;
        }
        /* Fondo del header sutil según tipo */
        .type-error   .issue-header { background: #1c0f0f; }
        .type-warning .issue-header { background: #1c130a; }
        .type-notice  .issue-header { background: #0f0e1c; }

        .issue-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            min-width: 0;
        }

        /* Chip de tipo — identidad visual fuerte */
        .chip {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
            flex-shrink: 0;
        }
        .chip-error   { background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; }
        .chip-warning { background: #431407; color: #fde68a; border: 1px solid #78350f; }
        .chip-notice  { background: #1e1b4b; color: #c4b5fd; border: 1px solid #3730a3; }

        .issue-num  { font-size: 11px; color: #475569; flex-shrink: 0; }
        .issue-code {
            font-family: monospace;
            font-size: 12px;
            color: #94a3b8;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .toggle-icon {
            color: #475569;
            font-size: 14px;
            flex-shrink: 0;
            transition: transform .2s;
        }
        .issue.collapsed .toggle-icon { transform: rotate(-90deg); }

        /* Cuerpo expandible */
        .issue-body {
            padding: 18px 20px;
            border-top: 1px solid #334155;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }
        .issue.collapsed .issue-body { display: none; }

        .issue-field { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
        }
        .field-value { font-size: 14px; color: #cbd5e1; line-height: 1.55; }

        .selector-box {
            display: inline-block;
            background: #0f172a;
            border: 1px solid #334155;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            color: #93c5fd;
            word-break: break-all;
        }
        .code-box {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 14px 16px;
            overflow-x: auto;
            font-size: 12px;
            color: #94a3b8;
            font-family: 'Fira Code', 'Courier New', monospace;
            line-height: 1.6;
        }

        .issue.hidden { display: none; }

        /* ── Footer ── */
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #334155; }
    </style>
</head>
<body>

<div class="hero">
    <a href="index.html" class="back-link">Back to index</a>
    <p class="hero-eyebrow">Accessibility Report</p>
    <h1>${escapeHtml(documentTitle || 'Untitled')}</h1>
    <a href="${escapeHtml(pageUrl)}" target="_blank" class="hero-url">${escapeHtml(pageUrl)}</a>
    <p class="meta">
        <span>Standard: <strong>${escapeHtml(standard)}</strong></span>
        <span><strong>${issues.length}</strong> issues found</span>
    </p>
</div>

<div class="stats-bar">
    <div class="stat stat-total">
        <div class="stat-value">${issues.length}</div>
        <div class="stat-label">Total Issues</div>
    </div>
    <div class="stat stat-errors">
        <div class="stat-value">${errors.length}</div>
        <div class="stat-label">Errors</div>
    </div>
    <div class="stat stat-warnings">
        <div class="stat-value">${warnings.length}</div>
        <div class="stat-label">Warnings</div>
    </div>
    <div class="stat stat-notices">
        <div class="stat-value">${notices.length}</div>
        <div class="stat-label">Notices</div>
    </div>
</div>

<div class="toolbar">
    <span class="toolbar-label">Filter:</span>
    <button class="filter-btn active-all"   onclick="filterIssues('all',     this)">All (${issues.length})</button>
    <button class="filter-btn"              onclick="filterIssues('error',   this)">Errors (${errors.length})</button>
    <button class="filter-btn"              onclick="filterIssues('warning', this)">Warnings (${warnings.length})</button>
    <button class="filter-btn"              onclick="filterIssues('notice',  this)">Notices (${notices.length})</button>
</div>

<div class="issues-wrap" id="issues">
    ${issuesHtml || '<p style="color:#475569; text-align:center; padding: 60px 0; font-size:18px;">No issues found!</p>'}
</div>

<p class="footer">Automatically generated · Accessibility Audit ${escapeHtml(standard)}</p>

<script>
    function toggleIssue(header) {
        header.closest('.issue').classList.toggle('collapsed');
    }

    function filterIssues(type, btn) {
        document.querySelectorAll('.filter-btn').forEach(b => { b.className = 'filter-btn'; });
        btn.classList.add('active-' + type);
        document.querySelectorAll('.issue').forEach(card => {
            card.classList.toggle('hidden', type !== 'all' && card.dataset.type !== type);
        });
    }
</script>
</body>
</html>`;
}

module.exports = { renderReport, renderIssue };
