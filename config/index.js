/**
 * Central configuration module.
 *
 * Loads configuration from config.yml and merges it with environment variables.
 * Exports the final immutable configuration.
 *
 * Supported environment variables:
 *   - AUDIT_NAME:       Name of the configuration (used for report subdirectory)
 *   - AUDIT_BASE_URL:     Base URL of the site
 *   - AUDIT_STANDARD:     WCAG standard (WCAG2A, WCAG2AA, WCAG2AAA)
 *   - AUDIT_REPORT_DIR:   Full output directory path (overrides reports/<name>)
 *   - AUDIT_TIMEOUT:      Timeout in milliseconds
 *   - AUDIT_HEADLESS:     true to run Chrome in headless mode
 *   - DRUPAL_COOKIE_NAME: Drupal session cookie name
 *   - DRUPAL_COOKIE_VALUE: Drupal session cookie value
 *
 * @module config
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Builds the final configuration by combining YAML, environment variables, and overrides.
 *
 * @param {Object} [overrides={}] - Values that override the configuration
 * @returns {Object} Immutable configuration
 */
function buildConfig(overrides) {
    overrides = overrides || {};
    var env = process.env;

    // Load configuration from YAML
    var configYaml = {};
    try {
        const rootPath = process.cwd();
        var yamlPath = path.join(rootPath, 'config.yml');
        configYaml = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
    } catch (e) {
        console.error('Error loading config.yml:', e.message);
    }

    var settings = configYaml.settings || {};
    var auth = configYaml.auth || {};
    var chromeDefaults = settings.chromeLaunchConfig || {};
    var chromeOverrides = overrides.chromeLaunchConfig || {};

    var headless = env.AUDIT_HEADLESS === 'true'
        ? true
        : (chromeOverrides.headless !== undefined ? chromeOverrides.headless : chromeDefaults.headless);

    var includeNotices = overrides.includeNotices !== undefined
        ? overrides.includeNotices
        : settings.includeNotices;

    var includeWarnings = overrides.includeWarnings !== undefined
        ? overrides.includeWarnings
        : settings.includeWarnings;

    var name = env.AUDIT_NAME || overrides.name || settings.name || 'default';
    var reportDir = env.AUDIT_REPORT_DIR || overrides.reportDir || path.join('reports', name);

    var config = {
        name: name,
        baseUrl: env.AUDIT_BASE_URL || overrides.baseUrl || settings.baseUrl,
        standard: env.AUDIT_STANDARD || overrides.standard || settings.standard,
        includeNotices: includeNotices,
        includeWarnings: includeWarnings,
        reportDir: reportDir,
        timeout: parseInt(env.AUDIT_TIMEOUT, 10) || overrides.timeout || settings.timeout,
        runners: overrides.runners || settings.runners,
        waitUntil: overrides.waitUntil || settings.waitUntil,
        chromeLaunchConfig: Object.assign(
            {},
            chromeDefaults,
            chromeOverrides,
            { headless: headless }
        ),
        auth: {
            cookieName: env.DRUPAL_COOKIE_NAME || overrides.cookieName || auth.cookieName,
            cookieValue: env.DRUPAL_COOKIE_VALUE || overrides.cookieValue || auth.cookieValue,
        },
        paths: configYaml.paths || []
    };

    return Object.freeze(config);
}

module.exports = { buildConfig };
