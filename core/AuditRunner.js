/**
 * Main orchestrator for the accessibility audit.
 *
 * Implements the Template Method pattern: defines the audit flow
 * (analyze → generate report → save) and delegates each step to
 * injected collaborators (Strategy + Repository).
 *
 * @module core/AuditRunner
 */

class AuditRunner {
    /**
     * @param {Object} options
     * @param {Object} options.runner - Audit runner instance (Strategy)
     * @param {Object} options.reporter - Reporter instance (Strategy)
     * @param {Object} options.writer - Output writer instance (Repository)
     * @param {Object} [options.logger=console] - Logger for messages
     */
    constructor({ runner, reporter, writer, logger = console }) {
        this._runner = runner;
        this._reporter = reporter;
        this._writer = writer;
        this._logger = logger;
    }

    /**
     * Executes the audit for a single analysis path.
     *
     * Template Method: defines the invariant audit flow.
     *
     * @param {import('./AnalysisPath')} analysisPath - Path to analyze
     * @returns {Promise<{filePath: string, issueCount: number}|null>}
     */
    async auditOne(analysisPath) {
        const url = analysisPath.url;

        try {
            this._logger.log(`Starting strict accessibility analysis at: ${url}`);

            // Step 1: Run analysis
            const pa11yResult = await this._runner.run(url);

            this._logger.log(`Analysis completed. Found ${pa11yResult.issues.length} issues.`);

            // Step 2: Generate report
            const { content, extension } = this._reporter.generate(pa11yResult);

            // Step 3: Save report
            const filePath = this._writer.write(analysisPath.fileName, content, extension);

            this._logger.log(`Report saved at: ${filePath}`);

            return { filePath, issueCount: pa11yResult.issues.length, analysisPath, pa11yResult };

        } catch (error) {
            this._logger.error(`Error analyzing ${url}:`, error.message);
            return null;
        }
    }

    /**
     * Executes the audit sequentially for multiple paths.
     *
     * @param {import('./AnalysisPath')[]} analysisPaths - List of paths to analyze
     * @returns {Promise<Array<{filePath: string, issueCount: number}|null>>}
     */
    async auditAll(analysisPaths) {
        const results = [];

        for (const analysisPath of analysisPaths) {
            const result = await this.auditOne(analysisPath);
            results.push(result);
        }

        return results;
    }
}

module.exports = AuditRunner;
