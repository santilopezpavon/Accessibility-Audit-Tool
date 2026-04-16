/**
 * Value Object that represents a path to be analyzed.
 *
 * Encapsulates the logic for normalizing paths and generating
 * file names for reports.
 *
 * @module core/AnalysisPath
 */

class AnalysisPath {
    /**
     * @param {string} path - Relative path (e.g. '/about', '/user/123')
     * @param {string} baseUrl - Base URL of the site
     * @param {string|null} [alias=null] - Optional alias for the output file name
     */
    constructor(path, baseUrl, alias = null) {
        this._rawPath = path;
        this._cleanPath = this._normalizePath(path);
        this._baseUrl = baseUrl;
        this._alias = alias;
    }

    /**
     * Full URL for analysis.
     * @returns {string}
     */
    get url() {
        return this._cleanPath === '/'
            ? this._baseUrl
            : `${this._baseUrl}${this._cleanPath}`;
    }

    /**
     * Report file name (without extension).
     * @returns {string}
     */
    get fileName() {
        if (this._alias) return this._alias;
        if (this._cleanPath === '/') return 'home';

        return this._cleanPath
            .split('?')[0]            // Remove query string
            .replace(/^\/|\/$/g, '')  // Remove leading and trailing slashes
            .replace(/\//g, '-');     // Replace internal slashes with hyphens
    }

    /**
     * Normalizes a path ensuring it starts with a slash.
     *
     * @param {string} inputPath
     * @returns {string}
     * @private
     */
    _normalizePath(inputPath) {
        const trimmed = inputPath.trim();
        return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    }

    /**
     * Factory method to create multiple AnalysisPath instances
     * from the path configuration entries.
     *
     * @param {Array<Array<string>>} pathEntries - Array of [path, alias?]
     * @param {string} baseUrl - Base URL of the site
     * @returns {AnalysisPath[]}
     */
    static fromEntries(pathEntries, baseUrl) {
        return pathEntries.map(
            ([path, alias]) => new AnalysisPath(path, baseUrl, alias || null)
        );
    }
}

module.exports = AnalysisPath;
