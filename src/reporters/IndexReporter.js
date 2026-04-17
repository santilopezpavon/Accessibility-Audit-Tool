/**
 * Reporter that generates the index page for the reports directory.
 *
 * Receives the complete list of audit results and produces
 * a single index.html file summarizing all pages.
 *
 * Follows the Strategy pattern: same interface as HtmlReporter but
 * operates on the full collection instead of a single result.
 *
 * @module reporters/IndexReporter
 */

const { renderIndexPage } = require('./templates/index');

class IndexReporter {
    /**
     * @param {Object} config - Audit configuration
     * @param {string} config.baseUrl  - Base URL of the site
     * @param {string} config.standard - WCAG standard
     */
    constructor(config) {
        this._baseUrl = config.baseUrl;
        this._standard = config.standard;
    }

    /**
     * Generates the HTML index from all audit results.
     *
     * @param {Array<{analysisPath: import('../core/AnalysisPath'), pa11yResult: Object}|null>} auditResults
     *   Array of results as returned by AuditRunner.auditAll()
     * @returns {{ content: string, extension: string }}
     */
    generate(auditResults) {
        const entries = auditResults
            .filter(Boolean)
            .map(({ analysisPath, pa11yResult }) => {
                const issues = pa11yResult.issues || [];
                const errors = issues.filter(i => i.type === 'error').length;
                const warnings = issues.filter(i => i.type === 'warning').length;
                const notices = issues.filter(i => i.type === 'notice').length;

                return {
                    fileName: analysisPath.fileName,
                    url: analysisPath.url,
                    issueCount: issues.length,
                    errors,
                    warnings,
                    notices,
                    reportFile: `${analysisPath.fileName}.html`,
                };
            });

        const generatedAt = new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const content = renderIndexPage({
            baseUrl: this._baseUrl,
            standard: this._standard,
            generatedAt,
            entries,
        });

        return { content, extension: '.html' };
    }
}

module.exports = IndexReporter;
