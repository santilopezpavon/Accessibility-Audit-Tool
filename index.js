/**
 * Entry point for the accessibility audit tool.
 * 
 * This module acts as the Composition Root: it instantiates and connects all
 * collaborators (configuration, runner, reporter, writer) and
 * launches the execution.
 * 
 * Usage:
 *   node index.js
 * 
 * Optional environment variables:
 *   AUDIT_NAME           - Name of the configuration (default: from config)
 *   AUDIT_BASE_URL       - Base URL of the site (default: from config)
 *   AUDIT_STANDARD       - WCAG Standard (default: WCAG2AA)
 *   AUDIT_REPORT_DIR     - Report output directory override (default: reports/<name>)
 *   AUDIT_TIMEOUT        - Timeout in ms (default: 90000)
 *   AUDIT_HEADLESS       - 'true' for Chrome headless
 *   DRUPAL_COOKIE_NAME   - Drupal session cookie name
 *   DRUPAL_COOKIE_VALUE  - Drupal session cookie value
 * 
 * @module index
 */

const { buildConfig } = require('./config');
const AnalysisPath = require('./core/AnalysisPath');
const AuditRunner = require('./core/AuditRunner');
const Pa11yRunner = require('./runners/Pa11yRunner');
const HtmlReporter = require('./reporters/HtmlReporter');
const IndexReporter = require('./reporters/IndexReporter');
const FileSystemWriter = require('./output/FileSystemWriter');
const MetaIndexReporter = require('./reporters/MetaIndexReporter');
const fs = require('fs');

async function main() {
    // 1. Build configuration
    const config = buildConfig();

    // 2. Create analysis paths (Factory Method)
    const analysisPaths = AnalysisPath.fromEntries(config.paths, config.baseUrl);

    // 3. Instantiate collaborators (Dependency Injection)
    const runner = new Pa11yRunner(config);
    const reporter = new HtmlReporter(config);
    const indexReporter = new IndexReporter(config);
    const writer = new FileSystemWriter(config.reportDir);

    // 4. Compose and execute (Composition Root)
    const auditRunner = new AuditRunner({ runner, reporter, writer });

    console.log(`\nAccessibility Audit — ${config.standard}`);
    console.log(`Configuration: ${config.name}`);
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`Report directory: ${config.reportDir}`);
    console.log(`${analysisPaths.length} paths to analyze\n`);

    const results = await auditRunner.auditAll(analysisPaths);

    // 5. Generate HTML index with the summary of all audits
    const successful = results.filter(Boolean);
    const { content, extension } = indexReporter.generate(successful);
    const indexPath = writer.write('index', content, extension);
    console.log(`Index generated at: ${indexPath}`);

    // 6. Generate Global Meta-Index (Dashboard)
    const metaReporter = new MetaIndexReporter('reports');
    const metaContent = metaReporter.generate();
    fs.writeFileSync('reports/index.html', metaContent, 'utf-8');
    console.log(`Global Dashboard updated at: reports/index.html`);

    // 7. Final summary in console
    const totalIssues = successful.reduce((sum, r) => sum + r.issueCount, 0);

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`Audit finished`);
    console.log(`   ${successful.length}/${analysisPaths.length} pages analyzed`);
    console.log(`   ${totalIssues} total issues found`);
    console.log(`   Dashboard: reports/index.html`);
    console.log(`   Current Report: ${indexPath}`);
    console.log(`${'═'.repeat(50)}\n`);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
