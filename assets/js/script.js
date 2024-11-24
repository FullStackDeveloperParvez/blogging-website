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

//Search Option
const searchIcon = document.getElementById('search-icon');
const overlay = document.getElementById('overlay');
const closeIcon = document.getElementById('overlay-close');

// Show the overlay and the close icon
searchIcon.addEventListener('click', () => {
    overlay.style.display = 'block';
    closeIcon.style.display = 'block';
    
    const overlayContent = document.createElement('div');
    overlayContent.setAttribute('id', 'overlay-conent');

    const searchHeading = document.createElement('div');
    searchHeading.setAttribute('id', 'overlay-search-heading');
    searchHeading.textContent = 'Search Blog';
    overlayContent.appendChild(searchHeading);

    const searchBox = document.createElement('input');
    searchBox.setAttribute('type', 'text');
    searchBox.setAttribute('id', 'overlay-search-textarea');
    searchBox.setAttribute('placeholder', 'Search for blog...');
    overlayContent.appendChild(searchBox);

    const searchBtn = document.createElement('button');
    searchBtn.setAttribute('id', 'overlay-search-btn');
    searchBtn.setAttribute('onclick', 'searchForDataInBlogs()');
    searchBtn.textContent = 'Search';
    overlayContent.appendChild(searchBtn);

    const searchResult = document.createElement('div');
    searchResult.setAttribute('id', 'overlay-search-result');
    overlayContent.appendChild(searchResult);

    overlay.appendChild(overlayContent);
});

// Hide the overlay and the close icon
closeIcon.addEventListener('click', () => {
    overlay.style.display = 'none';
    closeIcon.style.display = 'none';
    overlay.removeChild(document.getElementById('overlay-conent'));
});


function searchForDataInBlogs() {
    const searchBtn = document.getElementById("overlay-search-btn");
    const searchQuery = document.getElementById("overlay-search-textarea").value.trim();
    const resultContainer = document.getElementById("overlay-search-result");
    resultContainer.innerHTML = ""; // Clear previous results

    if (!searchQuery) {
        resultContainer.innerHTML = "<p>Please enter a search term.</p>";
        return;
    }

    let numberOfResults = 0;

    fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchQuery)}`)
	.then((response) => response.json())
    .then((data) => {
        if (data.length > 0) {
            data.forEach((result) => {
                if(numberOfResults<=10) {
                    const resultElement = document.createElement("div");
                resultElement.setAttribute('id', 'overlay-search-result-content');
                resultElement.innerHTML = `
                    <a href="${result.filePath}">${result.fileName.split('.')[0]}</a>
                `;
                resultContainer.appendChild(resultElement);
                numberOfResults++;
                }
            });
        } else {
            resultContainer.innerHTML = '<div id="overlay-search-result-content"> <p>No results found.</p> </div>';
        }
    })
	.catch((error) => {
		console.error("Error fetching search results:", error);
		resultContainer.innerHTML = '<div id="overlay-search-result-content"><p>Error searching files. Please try again later.</p></div>';
	});
}




//Homepage Recent Posts List
document.addEventListener('DOMContentLoaded', function () {
    const recentPostsList = document.getElementById('recent-posts-list');
    const loadMoreButton = document.getElementById('load-more-button');

    // Fetch the list of file names from the API
    fetch('http://localhost:3000/api/categories/files')
        .then(response => response.json())
        .then(data => {
            const fileNames = data;
            
            // Clear the current list
            recentPostsList.innerHTML = '';
            let numberOfFiles = 0;
            // Check if any filenames were returned
            if (fileNames.length > 0) {
                // Loop through the filenames and create an <li> for each
                fileNames.forEach(fullfileName => {
                    if(fullfileName.split('.')[1] == 'html') {
                        const listItem = document.createElement('li');
                        const postHeading = document.createElement('h1');
                        const fileName = fullfileName.replace('.html', '');
                        numberOfFiles++;
                        if(fileName != 'index' && numberOfFiles <= 15) {
                            postHeading.textContent = fileName;  // Set the filename as the heading
                            listItem.appendChild(postHeading);
                            recentPostsList.appendChild(listItem);
                            
                            postHeading.addEventListener('click', () => {
                                window.location.href = `assets/categories/${fullfileName}`;
                            });
                        }
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
            if (numberOfFiles > 15) {
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


