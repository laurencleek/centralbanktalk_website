const fs = require('fs');
const path = require('path');
const fse = require('fs-extra'); // For easy folder copying

// Settings
const skipFolders = ['data']; // Folders to skip
const skipFiles = []; // Specific files to skip

// Define paths
const packageJsonPath = path.resolve(__dirname, 'package.json');
const pathsJsonPath = path.resolve(__dirname, 'paths.json');
const outFolderPath = path.resolve(__dirname, 'out');

(async () => {
    try {
        // Check if paths.json exists
        if (!fs.existsSync(pathsJsonPath)) {
            console.log('paths.json does not exist. Exiting.');
            return;
        }

        // Read paths.json to get the destination folder
        const pathsConfig = JSON.parse(fs.readFileSync(pathsJsonPath, 'utf-8'));
        if (!pathsConfig["website_destination"]) {
            throw new Error('Destination path is not defined in paths.json.');
        }

        const destinationFolderPath = path.resolve(__dirname, pathsConfig["website_destination"]);

        // Check if out folder exists
        if (!fs.existsSync(outFolderPath)) {
            console.log('Out folder does not exist. Exiting.');
            return;
        }

        // Copy everything except specified folders and files
        const items = fs.readdirSync(outFolderPath);
        for (const item of items) {
            const sourcePath = path.join(outFolderPath, item);
            const destinationPath = path.join(destinationFolderPath, item);

            // Skip folders in the skipFolders array
            if (skipFolders.includes(item) && fs.lstatSync(sourcePath).isDirectory()) {
                console.log(`Skipping folder: ${item}`);
                continue;
            }

            // Skip files in the skipFiles array
            if (skipFiles.includes(item) && fs.lstatSync(sourcePath).isFile()) {
                console.log(`Skipping file: ${item}`);
                continue;
            }

            // Copy item
            await fse.copy(sourcePath, destinationPath);
            console.log(`Copied ${item} to ${destinationFolderPath}`);
        }

        console.log('Copy operation completed successfully.');
    } catch (error) {
        console.error('Error during copy operation:', error.message);
    }
})();
