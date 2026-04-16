/**
 * HTML template for the Meta-Index page (Audit Dashboard).
 *
 * @module reporters/templates/metaIndex
 */

const { escapeHtml } = require('../../utils/html');

/**
 * Generates the complete HTML for the Meta-Index page.
 *
 * @param {Object} params
 * @param {Object[]} params.audits - Array of audit entries { name, path, lastModified }
 * @returns {string}
 */
function renderMetaIndexPage({ audits }) {
    const auditCards = audits.map(audit => `
        <div class="audit-card">
            <div class="audit-info">
                <div class="audit-name">${escapeHtml(audit.name)}</div>
                <div class="audit-meta">Last updated: ${escapeHtml(audit.lastModified)}</div>
            </div>
            <a href="${escapeHtml(audit.path)}/index.html" class="btn-view">
                Open Analysis ->
            </a>
        </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Dashboard</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #0f1117;
            color: #e2e8f0;
            min-height: 100vh;
            padding: 0 0 60px;
        }

        .hero {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-bottom: 1px solid #1e293b;
            padding: 60px 48px;
            text-align: center;
        }
        .hero h1 {
            font-size: 36px;
            font-weight: 800;
            color: #f1f5f9;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
        }
        .hero p {
            font-size: 16px;
            color: #94a3b8;
            max-width: 600px;
            margin: 0 auto;
        }

        .container {
            max-width: 900px;
            margin: 40px auto;
            padding: 0 24px;
        }

        .grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .audit-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 24px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s ease;
        }
        .audit-card:hover {
            border-color: #60a5fa;
            background: #243147;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5);
        }

        .audit-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .audit-name {
            font-size: 20px;
            font-weight: 700;
            color: #f8fafc;
        }
        .audit-meta {
            font-size: 13px;
            color: #64748b;
        }

        .btn-view {
            display: inline-block;
            padding: 10px 20px;
            background: #1d4ed8;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            transition: background .2s;
        }
        .btn-view:hover {
            background: #2563eb;
        }

        .empty-state {
            text-align: center;
            padding: 60px;
            color: #475569;
        }
    </style>
</head>
<body>

<div class="hero">
    <h1>Accessibility Dashboard</h1>
    <p>Select an analysis to view detailed accessibility reports and find opportunities for improvement.</p>
</div>

<div class="container">
    <div class="grid">
        ${audits.length > 0 ? auditCards : '<div class="empty-state">No audits found. Run an audit to start.</div>'}
    </div>
</div>

</body>
</html>`;
}

module.exports = { renderMetaIndexPage };
