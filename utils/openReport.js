const { buildConfig } = require('../config/index');
const { exec } = require('child_process');
const path = require('path');

/**
 * Script to automatically open the accessibility report
 * based on the configuration defined in config.yml
 */
function openReport() {
    try {
        const config = buildConfig();
        if (!config.reportDir) {
            console.error('Error: "reportDir" was not found in the configuration.');
            return;
        }

        const reportPath = path.join(process.cwd(), 'reports', 'index.html');

        // Determine the command based on the operating system
        let command;
        switch (process.platform) {
            case 'win32':
                command = `start "" "${reportPath}"`;
                break;
            case 'darwin':
                command = `open "${reportPath}"`;
                break;
            default:
                command = `xdg-open "${reportPath}"`;
                break;
        }

        console.log(`Opening report at: ${reportPath}`);

        exec(command, (error) => {
            if (error) {
                console.error(`Error while trying to open the report: ${error.message}`);
            }
        });
    } catch (error) {
        console.error('Error loading configuration:', error.message);
    }
}

openReport();
