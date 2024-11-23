const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require('cors'); // Import CORS middleware
const multer = require("multer");

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


// Create the 'uploads' folder if it doesn't exist
const uploadDir = path.join(__dirname, "assets", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Upload images to 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Ensure the file name is unique
        const fileExtension = path.extname(file.originalname);
        const fileName = Date.now() + fileExtension;
        cb(null, fileName); // Set the file name
    },
});

const upload = multer({ storage });

// Middleware for parsing JSON
app.use(express.json());

// Upload multiple images API
app.post("/upload-images", upload.array("images", 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No image files uploaded." });
    }

    const imageUrls = req.files.map(file => `/assets/uploads/${file.filename}`); // Return relative URLs for uploaded images
    res.json({ imageUrls });
});



// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// API to handle blog saving
app.post("/save-blog", (req, res) => {
    const { heading, content, category } = req.body;

    if (!heading || !content || !category) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const categoriesPath = path.join(__dirname, "assets", "categories");
    const categoryPath = path.join(categoriesPath, category);
    const fileName = `${heading.replace(/\s+/g, "_")}.html`; // Create filename based on heading

    if (!fs.existsSync(categoriesPath)) {
        fs.mkdirSync(categoriesPath); // Ensure `categories` folder exists
    }

    if (!fs.existsSync(categoryPath)) {
        // Create category folder and default category.html using template.html
        fs.mkdirSync(categoryPath);

        const categoryFileContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>${category}</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../css/index.css">
    <link rel="stylesheet" href="../../css/theme.css">
    <script src="../../js/blogs.js" defer></script>
</head>
<body>
    <header>
        <nav>
            <a href="../../../index.html">
                <h2 class="logo">PRIZM</h2>
            </a>
            <div class="menu" id="menu">
                <ul class="list">
                    <li class = "nav-menu-list"><a href="../../../index.html">Home</a></li>
                    <li class = "nav-menu-list">
                        <a href="#" id = "categories-btn">Categories</a>
                        <ul id="dropdown-list" class="dropdown-menu"></ul>
                    </li>
                    <li class = "nav-menu-list"><a href="../../../editor.html">Editor</a></li>
                </ul>
            </div>
            <div class="list list-right">
                <button class="btn place-items-center" id="theme-toggle-btn">
                    <i class="ri-sun-line sun-icon"></i>
                    <i class="ri-moon-line moon-icon"></i>
                </button>

                <button class="btn place-items-center" id="search-icon">
                    <i class="ri-search-line"></i>
                </button>

                <button class="btn place-items-center screen-lg-hidden menu-toggle-icon" id="menu-toggle-icon">
                    <i class="ri-menu-3-line open-menu-icon"></i>
                    <i class="ri-close-line close-menu-icon"></i>
                </button>
            </div>
        </nav>
    </header>
    <main id="home">
        <div class="all-posts" id="all-posts">
            <ul id="all-posts-list"></ul>
        </div>
        
    </main>
</body>
</html>
        `;

        //const templatePath = path.join(__dirname, "assets", "template", "template.html");
        const categoryFilePath = path.join(categoryPath, `${category}.html`);
        fs.writeFileSync(categoryFilePath, categoryFileContent, "utf8");
    }

    // Create the new blog file
    const blogFilePath = path.join(categoryPath, fileName);
    const blogContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>${heading}</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="../../css/index.css">
    <link rel="stylesheet" href="../../css/theme.css">
    <script src="../../js/blogs.js" defer></script>
</head>
<body>
    <header>
        <nav>
            <a href="../../../index.html">
                <h2 class="logo">PRIZM</h2>
            </a>
            <div class="menu" id="menu">
                <ul class="list">
                    <li class = "nav-menu-list"><a href="../../../index.html">Home</a></li>
                    <li class = "nav-menu-list">
                        <a href="#" id = "categories-btn">Categories</a>
                        <ul id="dropdown-list" class="dropdown-menu"></ul>
                    </li>
                    <li class = "nav-menu-list"><a href="../../../editor.html">Editor</a></li>
                </ul>
            </div>
            <div class="list list-right">
                <button class="btn place-items-center" id="theme-toggle-btn">
                    <i class="ri-sun-line sun-icon"></i>
                    <i class="ri-moon-line moon-icon"></i>
                </button>

                <button class="btn place-items-center" id="search-icon">
                    <i class="ri-search-line"></i>
                </button>

                <button class="btn place-items-center screen-lg-hidden menu-toggle-icon" id="menu-toggle-icon">
                    <i class="ri-menu-3-line open-menu-icon"></i>
                    <i class="ri-close-line close-menu-icon"></i>
                </button>
            </div>
        </nav>
    </header>
    <main>
        <h1>${heading}</h1>
    <div>${content}</div>
    </main>
</body>
</html>
`;

    fs.writeFileSync(blogFilePath, blogContent, "utf8");
    res.json({ message: `Blog saved successfully under category "${category}" as "${fileName}".` });
});

//API to fetch file names in current directory
app.get("/get-html-file-names", (req, res) => {
    const folderName = req.query.folder; // Get folder name from query parameter

    if (!folderName) {
        return res.status(400).json({ error: "Folder name is required as a query parameter." });
    }

    const folderPath = path.join(__dirname, folderName);

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
        return res.status(404).json({ error: `Folder "${folderName}" not found.` });
    }

    // Read the folder contents
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error("Error reading folder:", err);
            return res.status(500).json({ error: "Failed to read folder." });
        }

        // Filter .html files and return names without extensions
        const htmlFileNames = files
            .filter(file => path.extname(file) === ".html") // Get only .html files
            .map(file => path.parse(file).name); // Extract file name without extension

        res.json(htmlFileNames);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

