/**
 * HTML manipulation and sanitization utilities.
 * @module utils/html
 */

/**
 * Escapes special HTML characters to prevent XSS injection in reports.
 *
 * @param {string} str - String to escape
 * @returns {string} String with escaped HTML entities
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = { escapeHtml };
