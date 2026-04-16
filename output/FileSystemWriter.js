/**
 * Writer that persists reports to the file system.
 *
 * Implements the Repository pattern: abstracts the storage destination.
 * It could be replaced by S3Writer, DatabaseWriter, etc.
 *
 * @module output/FileSystemWriter
 */

const fs = require('fs');
const path = require('path');

class FileSystemWriter {
    /**
     * @param {string} outputDir - Base directory for reports
     */
    constructor(outputDir) {
        this._outputDir = outputDir;
        this._ensureDirectory();
    }

    /**
     * Writes the content of a report to a file.
     *
     * @param {string} fileName - Base file name (without extension)
     * @param {string} content - Content to write
     * @param {string} [extension='.html'] - File extension
     * @returns {string} Full path of the generated file
     */
    write(fileName, content, extension = '.html') {
        const filePath = path.join(this._outputDir, `${fileName}${extension}`);
        fs.writeFileSync(filePath, content, 'utf-8');
        return filePath;
    }

    /**
     * Ensures that the output directory exists.
     * @private
     */
    _ensureDirectory() {
        if (!fs.existsSync(this._outputDir)) {
            fs.mkdirSync(this._outputDir, { recursive: true });
        }
    }
}

module.exports = FileSystemWriter;
