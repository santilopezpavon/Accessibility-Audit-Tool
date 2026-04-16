/**
 * Audit runner that uses pa11y as the analysis engine.
 *
 * Implements the Strategy pattern: it can be replaced by other runners
 * (Lighthouse, custom axe-core, etc.) without modifying the main flow.
 *
 * @module runners/Pa11yRunner
 */

const pa11y = require('pa11y');

class Pa11yRunner {
    /**
     * @param {Object} config - Audit configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Executes the accessibility audit on a URL.
     *
     * @param {string} url - URL to analyze
     * @returns {Promise<Object>} pa11y results
     */
    async run(url) {
        const { auth, standard, includeWarnings, includeNotices, runners, waitUntil, timeout, chromeLaunchConfig } = this._config;

        return pa11y(url, {
            chromeLaunchConfig,
            headers: {
                Cookie: `${auth.cookieName}=${auth.cookieValue}`,
            },
            standard,
            includeWarnings,
            includeNotices,
            runners,
            waitUntil,
            timeout,
        });
    }
}

module.exports = Pa11yRunner;
