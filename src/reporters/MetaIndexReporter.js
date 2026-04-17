/**
 * Reporter that generates a Global Dashboard (Meta-Index) for all analyses.
 *
 * Scans the 'reports' directory for subdirectories containing an index.html
 * and generates a central navigation page.
 *
 * @module reporters/MetaIndexReporter
 */

const fs = require('fs');
const path = require('path');
const { renderMetaIndexPage } = require('./templates/metaIndex');

class MetaIndexReporter {
    /**
     * @param {string} reportsDir - Path to the root 'reports' directory
     */
    constructor(reportsDir) {
        this._reportsDir = reportsDir;
    }

    /**
     * Scans the directory and generates the Meta-Index HTML.
     *
     * @returns {string} The HTML content
     */
    generate() {
        if (!fs.existsSync(this._reportsDir)) {
            return renderMetaIndexPage({ audits: [] });
        }

        const entries = fs.readdirSync(this._reportsDir, { withFileTypes: true });
        const audits = entries
            .filter(entry => entry.isDirectory())
            .filter(entry => fs.existsSync(path.join(this._reportsDir, entry.name, 'index.html')))
            .map(entry => {
                const stats = fs.statSync(path.join(this._reportsDir, entry.name, 'index.html'));
                return {
                    name: entry.name,
                    path: entry.name,
                    lastModified: stats.mtime.toLocaleString('en-GB')
                };
            })
            // Sort by most recent first
            .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        return renderMetaIndexPage({ audits });
    }
}

module.exports = MetaIndexReporter;
