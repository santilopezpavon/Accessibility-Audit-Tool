/**
 * Central configuration module.
 *
 * Loads general configuration and merges it with project-specific configuration.
 *
 * @module config
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Loads a YAML file and returns its content as an object.
 * @param {string} filePath 
 * @returns {Object}
 */
function loadYaml(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
        }
    } catch (e) {
        console.error(`Error loading ${filePath}:`, e.message);
    }
    return {};
}

/**
 * Builds the final configuration by combining General YAML, Project YAML, environment variables, and overrides.
 *
 * @param {string} [projectName] - Name of the project to load
 * @param {Object} [overrides={}] - Values that override the configuration
 * @returns {Object} Immutable configuration
 */
function buildConfig(projectName, overrides) {
    overrides = overrides || {};
    const env = process.env;
    const rootPath = process.cwd();

    // 1. Load General Config
    const generalConfig = loadYaml(path.join(rootPath, 'config', 'config.yml'));

    // 2. Load Project Config
    let projectConfig = {};
    if (projectName) {
        projectConfig = loadYaml(path.join(rootPath, 'config', 'projects', `${projectName}.yml`));
    }

    // 3. Merge configurations (shallow merge for top-level, special handling for nested)
    const merged = Object.assign({}, generalConfig, projectConfig, overrides);

    // Special handling for nested objects to ensure they are merged correctly
    const auth = Object.assign({}, generalConfig.auth, projectConfig.auth, overrides.auth);
    const chromeDefaults = generalConfig.chromeLaunchConfig || {};
    const chromeProject = projectConfig.chromeLaunchConfig || {};
    const chromeOverrides = overrides.chromeLaunchConfig || {};

    const headless = env.AUDIT_HEADLESS === 'true'
        ? true
        : (chromeOverrides.headless !== undefined ? chromeOverrides.headless : (chromeProject.headless !== undefined ? chromeProject.headless : chromeDefaults.headless));

    const name = projectName || env.AUDIT_NAME || merged.name || 'default';
    const reportDir = env.AUDIT_REPORT_DIR || overrides.reportDir || path.join('reports', name);

    const config = {
        name: name,
        baseUrl: env.AUDIT_BASE_URL || merged.baseUrl,
        standard: env.AUDIT_STANDARD || merged.standard || 'WCAG2AA',
        includeNotices: merged.includeNotices !== undefined ? merged.includeNotices : true,
        includeWarnings: merged.includeWarnings !== undefined ? merged.includeWarnings : true,
        reportDir: reportDir,
        timeout: parseInt(env.AUDIT_TIMEOUT, 10) || merged.timeout || 90000,
        runners: merged.runners || ['htmlcs', 'axe'],
        waitUntil: merged.waitUntil || 'networkidle2',
        chromeLaunchConfig: Object.assign(
            {},
            chromeDefaults,
            chromeProject,
            chromeOverrides,
            { headless: headless }
        ),
        auth: {
            cookieName: env.DRUPAL_COOKIE_NAME || auth.cookieName,
            cookieValue: env.DRUPAL_COOKIE_VALUE || auth.cookieValue,
        },
        paths: merged.paths || []
    };

    return Object.freeze(config);
}

module.exports = { buildConfig };
