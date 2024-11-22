// Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle-btn');
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Load theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});

// Mobile Menu Toggle
const menuToggleBtn = document.getElementById('menu-toggle-icon');
const menu = document.getElementById('menu');

menuToggleBtn.addEventListener('click', () => {
    menu.classList.toggle('active');
});

// Categories Dropdown
document.addEventListener('DOMContentLoaded', () => {
    const categoriesButton = document.getElementById('categories-btn');
    const dropdownList = document.getElementById('dropdown-list');

    if (!categoriesButton || !dropdownList) {
        console.error("Categories button or dropdown list not found in the DOM");
        return;
    }

    // Fetch folder names from the backend API
    function fetchFolderNames(callback) {
        fetch('http://localhost:3000/api/categories')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch folder names');
                }
                return response.json();
            })
            .then((data) => {
                callback(data);
            })
            .catch((error) => {
                console.error(error);
                callback([]);
            });
    }

    // Populate dropdown dynamically
    function populateDropdown(folders) {
        dropdownList.innerHTML = ''; // Clear existing items
        folders.forEach((folder) => {
            const listItem = document.createElement('li');
            listItem.textContent = folder;

            listItem.addEventListener('click', () => {
                window.location.href = `assets/categories/${folder}/${folder}.html`;
            });

            dropdownList.appendChild(listItem);
        });
    }

    // Toggle dropdown visibility
    function toggleDropdown() {
        const isDropdownVisible = dropdownList.style.display === 'block';
        dropdownList.style.display = isDropdownVisible ? 'none' : 'block';
    }

    // Show/hide dropdown on button click and reload folders if closed
    categoriesButton.addEventListener('click', () => {
        const isDropdownVisible = dropdownList.style.display === 'block';
        
        if (!isDropdownVisible) {
            // Fetch and populate folders when dropdown is opened
            fetchFolderNames((folders) => {
                populateDropdown(folders);
                dropdownList.style.display = 'block';
            });
        } else {
            // Hide dropdown if it is already open
            dropdownList.style.display = 'none';
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            dropdownList.style.display = 'none';
        }
    });
});

// Upload multiple images and insert them into the textarea
function uploadImages() {
    const fileInput = document.getElementById("image-file");
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Please select images to upload!");
        return;
    }

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("images", file));

    fetch("/upload-images", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                // Insert each image into the textarea at the current cursor position
                data.imageUrls.forEach(imageUrl => {
                    insertImageToTextArea(imageUrl);
                });
            }
        })
        .catch((error) => {
            console.error("Error uploading images:", error);
            alert("Failed to upload images.");
        });
}

// Insert image URL into the textarea at the current cursor position
function insertImageToTextArea(imageUrl) {
    const textArea = document.getElementById("editor-content");
    const cursorPosition = textArea.selectionStart;
    const imageTag = `<img src="${imageUrl}" alt="Uploaded Image">`;

    // Insert image tag at cursor position
    const textBefore = textArea.value.substring(0, cursorPosition);
    const textAfter = textArea.value.substring(cursorPosition);
    textArea.value = textBefore + imageTag + textAfter;

    // Set cursor position after the inserted image tag
    textArea.selectionStart = textArea.selectionEnd = cursorPosition + imageTag.length;
}

// Save Blog
function saveBlog() {
    const heading = document.getElementById("editor-content-heading").value.trim();
    const content = document.getElementById("editor-content").value.trim();

    if (!heading || !content) {
        alert("Both heading and content are required!");
        return;
    }

    const category = prompt("Enter the category to save under:");
    if (!category) {
        alert("Category is required!");
        return;
    }

    // Send data to the backend
    fetch("/save-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heading, content, category }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Failed to save blog. Please try again.");
        });
}

