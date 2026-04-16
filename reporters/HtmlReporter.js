/**
 * Reporter that generates HTML accessibility reports.
 *
 * Implements the Strategy pattern: it can be replaced by other reporters
 * (JSON, CSV, Console) without modifying the audit flow.
 *
 * @module reporters/HtmlReporter
 */

const { renderReport } = require('./templates/report');

class HtmlReporter {
    /**
     * @param {Object} config - Audit configuration
     */
    constructor(config) {
        this._standard = config.standard;
    }

    /**
     * Generates the report content from pa11y results.
     *
     * @param {Object} results - Raw pa11y results
     * @returns {{ content: string, extension: string }} Report content and file extension
     */
    generate(results) {
        const content = renderReport({
            pageUrl: results.pageUrl,
            documentTitle: results.documentTitle || 'Untitled',
            standard: this._standard,
            issues: results.issues || [],
        });

        return {
            content,
            extension: '.html',
        };
    }
}

module.exports = HtmlReporter;
