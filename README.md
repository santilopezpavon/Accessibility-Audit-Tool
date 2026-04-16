# Accessibility Audit Tool

A powerful accessibility auditing tool based on **Pa11y** that analyzes multiple routes and generates comprehensive HTML reports.

## Features

- **Multi-route Analysis**: Audit several pages in one go.
- **Configurable Standards**: Supports WCAG2A, WCAG2AA, and WCAG2AAA.
- **HTML Reports**: Generates detailed individual reports and a central index.
- **Authentication Support**: Ability to pass session cookies to audit restricted areas.
- **Dynamic Reporting**: Open your reports automatically from the command line.

## Prerequisites

- **Node.js**: Version 10 or higher.
- **npm**: Installed along with Node.js.

## Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Copy and rename the config_example.yml file to config.yml

The project provides two main commands in `package.json`:

### 1. Run the Audit
Executes the accessibility analysis on all paths defined in the configuration.
```bash
npm start
```

### 2. Open the Report
Automatically opens the generated HTML index in your default browser. This command dynamically reads the output directory from your configuration.
```bash
npm run open-report
```

---

## Configuration (`config.yml`)

The tool is highly customizable via the `config.yml` file. Here are the available options:

### General Settings (`settings`)
- `name`: The name of the configuration. This determines the subdirectory where reports are saved (default: `default`).
- `baseUrl`: The root URL of the site you want to audit.
- `standard`: The accessibility standard to follow (e.g., `WCAG2AA`).
- `includeNotices`: Set to `true` to include notices in the report.
- `includeWarnings`: Set to `true` to include warnings along with errors.
- `reportDir`: (Optional) Override the final directory where HTML reports will be saved (overrides `reports/<name>`).
- `timeout`: Maximum time (in milliseconds) allowed for each page analysis.
- `runners`: The analysis engines to use (e.g., `htmlcs`, `axe`).
- `waitUntil`: The browser state to wait for before started the audit (e.g., `networkidle2`).
- `chromeLaunchConfig`: Advanced Puppeteer configuration for launching Chrome (headless mode, viewport, etc.).

### Authentication (`auth`)
If the site requires a login, you can provide session cookies:
- `cookieName`: The name of the session cookie (e.g., Drupal session cookie).
- `cookieValue`: The value of the active session cookie.

### Paths to Analyze (`paths`)
A list of routes to audit. You can specify a simple path or a path with an alias:
```yaml
paths:
  - ['/']                  # Audits the homepage
  - ['/contact', 'Contact'] # Audits /contact and labels it as "Contact" in reports
```

## Environment Variables

You can also override some configurations using environment variables:
- `AUDIT_NAME` (Determines the subdirectory in `reports/`)
- `AUDIT_BASE_URL`
- `AUDIT_STANDARD`
- `AUDIT_REPORT_DIR` (Overrides the entire path)
- `AUDIT_TIMEOUT`
- `AUDIT_HEADLESS` (Set to `true` or `false`)
- `DRUPAL_COOKIE_NAME`
- `DRUPAL_COOKIE_VALUE`
