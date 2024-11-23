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

//Homepage Random posts section
// document.addEventListener('DOMContentLoaded', () => {
//     const mainContentBoxes = document.querySelectorAll('.content-box');

//     // Fetch filenames from the backend API
//     function fetchFilenames(callback) {
//         fetch('http://localhost:3000/api/categories/files')
//             .then((response) => {
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch filenames');
//                 }
//                 return response.json();
//             })
//             .then((data) => {
//                 callback(data);
//             })
//             .catch((error) => {
//                 console.error(error);
//                 callback([]);
//             });
//     }

//     // Display random filenames in the content boxes
//     function displayRandomFiles(filenames) {
//         // Select 4 random filenames
//         const randomFiles = filenames.sort(() => 0.5 - Math.random()).slice(0, 4);

//         mainContentBoxes.forEach((box, index) => {
//             if (randomFiles[index]) {
//                 const fullPath = randomFiles[index];
//                 const fileNameWithExtension = fullPath.split('/').pop();
//                 const fileName = fileNameWithExtension.replace('.html', '');
//                 const headingElement = box.querySelector('h1');
//                 headingElement.textContent = fileName;

//                 // Set the file path as a click event handler
//                 box.addEventListener('click', () => {
//                     window.location.href = `assets/categories/${fullPath}`;
//                 });
//             }
//         });
//     }

//     // Initialize
//     fetchFilenames((filenames) => {
//         if (filenames.length > 0) {
//             displayRandomFiles(filenames);
//         } else {
//             console.error('No files found in categories');
//         }
//     });
// });

//Homepage Recent Posts List
document.addEventListener('DOMContentLoaded', function () {
    const recentPostsList = document.getElementById('recent-posts-list');
    const loadMoreButton = document.getElementById('load-more-button');

    // Fetch the list of file names from the API
    fetch('http://localhost:3000/api/categories/files')
        .then(response => response.json())
        .then(data => {
            // Limit the number of filenames to 15
            const fileNames = data.slice(0, 15);
            
            // Clear the current list
            recentPostsList.innerHTML = '';

            // Check if any filenames were returned
            if (fileNames.length > 0) {
                // Loop through the filenames and create an <li> for each
                fileNames.forEach(fullfileName => {
                    const listItem = document.createElement('li');
                    const postHeading = document.createElement('h1');
                    const fileNameWithExtension = fullfileName.split('/').pop();
                    const fileName = fileNameWithExtension.replace('.html', '');
                    if(fileName != 'index') {
                        postHeading.textContent = fileName;  // Set the filename as the heading
                        listItem.appendChild(postHeading);
                        recentPostsList.appendChild(listItem);
                        
                        postHeading.addEventListener('click', () => {
                            window.location.href = `assets/categories/${fullfileName}`;
                        });
                    }
                });
            } else {
                // Handle the case where no files were returned
                const listItem = document.createElement('li');
                const postHeading = document.createElement('h1');
                postHeading.textContent = 'No posts available';
                listItem.appendChild(postHeading);
                recentPostsList.appendChild(listItem);
            }

            // Handle the "More" button visibility based on the number of files
            if (data.length > 15) {
                loadMoreButton.style.display = 'block';
                loadMoreButton.addEventListener('click', () => {
                    window.location.href = `allPosts.html`;
                });
            } else {
                loadMoreButton.style.display = 'none';  // Hide the "More" button if there are 15 or fewer files
            }
        })
        .catch(error => {
            console.error('Error fetching file names:', error);
            recentPostsList.innerHTML = '<li><h1>Error fetching file names</h1></li>';
        });
});