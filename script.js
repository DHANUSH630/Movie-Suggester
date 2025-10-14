
// RapidAPI-backed UI: fetch movies by selected genre from server
let movies = [];

// DOM elements
const genreButtons = document.querySelectorAll('.genre-btn');
const moviesContainer = document.getElementById('moviesContainer');
const selectionMessage = document.querySelector('.selection-message');

// Genre button click events
genreButtons.forEach(button => {
    button.addEventListener('click', () => {
        genreButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const selectedGenre = button.getAttribute('data-genre');
        filterMovies(selectedGenre);
    });
});

// Filter movies by genre
function filterMovies(genre) {
    moviesContainer.innerHTML = '';
    selectionMessage.textContent = `Loading recommendations for: ${genre}`;
    selectionMessage.classList.add('loading');
    movies = movies.filter(movie => movie.genre !== genre);
    fetchMoviesByGenre(genre);
}

// Fetch movies by genre
async function fetchMoviesByGenre(genre) {
    try {
        selectionMessage.textContent = `Fetching ${genre} movies...`;
        const response = await fetch(`/api/movies?genre=${encodeURIComponent(genre)}&limit=12`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        const validMovies = Array.isArray(data.movies) ? data.movies : [];
        movies = [...movies, ...validMovies];
        displayMovies(validMovies, genre);
    } catch (error) {
        console.error('Error fetching movies:', error);
        selectionMessage.textContent = `Error loading ${genre} movies.`;
    }
}

// Remove OMDB single-title fetch; we now use our server API

// Display movies
function displayMovies(moviesToDisplay, genre) {
    selectionMessage.classList.remove('loading');
    if (moviesToDisplay.length > 0) {
        selectionMessage.textContent = `Showing ${genre} movies`;
        moviesContainer.innerHTML = '';
        moviesToDisplay.forEach(movie => displayMovie(movie));
    } else {
        selectionMessage.textContent = `No movies found for ${genre}`;
    }
}

// Display individual movie card
function displayMovie(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
        <div class="movie-poster-container">
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
            <div class="movie-overlay">
                <div class="full-description">${movie.description}</div>
            </div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${movie.year}</p>
            <div class="movie-rating">
                <i class="fas fa-star"></i>
                <span>${movie.rating.toFixed(1)}</span>
            </div>
            <p class="movie-description">${truncateText(movie.description, 100)}</p>
        </div>
    `;
    const posterContainer = movieCard.querySelector('.movie-poster-container');
    posterContainer.addEventListener('click', () => {
        posterContainer.classList.toggle('show-overlay');
    });
    moviesContainer.appendChild(movieCard);
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Initialize with default genre
window.addEventListener('DOMContentLoaded', () => {
    const actionButton = document.querySelector('.genre-btn[data-genre="action"]');
    if (actionButton) {
        document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
        actionButton.classList.add('active');
        movies = [];
        filterMovies('action');
    }
    setupThemeToggle();
});

// 🌙 Dark Mode Toggle
function setupThemeToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'themeToggle';
    toggleButton.textContent = '🌙 Dark Mode';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.padding = '10px 15px';
    toggleButton.style.borderRadius = '20px';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '999';
    toggleButton.style.fontWeight = 'bold';
    toggleButton.style.backgroundColor = '#01b4e4';
    toggleButton.style.color = '#fff';
    document.body.appendChild(toggleButton);

    // Restore saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        toggleButton.textContent = '☀️ Light Mode';
        document.body.style.backgroundColor = '#0a1929';
        document.body.style.color = '#f0f0f0';
    }

    // On click
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggleButton.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        document.body.style.backgroundColor = isDark ? '#0a1929' : '#ffffff';
        document.body.style.color = isDark ? '#f0f0f0' : '#000000';
    });
}
