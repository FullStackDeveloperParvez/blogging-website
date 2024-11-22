const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS middleware

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Endpoint to fetch folder names
app.get('/api/categories', (req, res) => {
    const directoryPath = path.join(__dirname, 'assets', 'categories');
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read directory' });
        }

        // Filter directories only
        const folderNames = files
            .filter((file) => file.isDirectory())
            .map((folder) => folder.name);

        res.json(folderNames);
    });
});

// Serve static files (optional)
app.use('/assets', express.static(path.join(__dirname, 'assets')));


// Endpoint to fetch filenames from subfolders
app.get('/api/categories/files', (req, res) => {
    const categoriesPath = path.join(__dirname, 'assets', 'categories');
    const filesWithDates = [];

    fs.readdir(categoriesPath, { withFileTypes: true }, (err, folders) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read directory' });
        }

        let remainingFolders = folders.length;

        if (remainingFolders === 0) {
            return res.json([]); // If no folders, return an empty array
        }

        folders.forEach((folder) => {
            if (folder.isDirectory()) {
                const folderPath = path.join(categoriesPath, folder.name);

                fs.readdir(folderPath, (err, files) => {
                    if (!err) {
                        files.forEach((file) => {
                            if (file.endsWith('.html')) {
                                const filePath = path.join(folderPath, file);
                                const stats = fs.statSync(filePath);

                                filesWithDates.push({
                                    name: `${folder.name}/${file}`,
                                    createdAt: stats.birthtimeMs, // File creation time
                                });
                            }
                        });
                    }

                    remainingFolders--;

                    if (remainingFolders === 0) {
                        // Sort by creation date and time (descending)
                        const sortedFiles = filesWithDates.sort((a, b) => {
                            const timeA = a.createdAt;
                            const timeB = b.createdAt;
                            return timeB - timeA; // Descending order
                        });

                        // Extract filenames only
                        const sortedFileNames = sortedFiles.map((file) => file.name);
                        res.json(sortedFileNames);
                    }
                });
            } else {
                remainingFolders--;
            }
        });
    });
});


// Serve static files
app.use('/categories', express.static(path.join(__dirname, 'assets', 'categories')));


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
