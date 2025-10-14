
// OMDB API Key (stored in localStorage if provided by user)
let apiKey = localStorage.getItem('omdbApiKey') || "3e974fca";

// Sample movie data from OMDB API (for initial display)
const sampleMovieData = {
    "Title": "Guardians of the Galaxy Vol. 2",
    "Year": "2017",
    "Rated": "PG-13",
    "Released": "05 May 2017",
    "Runtime": "136 min",
    "Genre": "Action, Adventure, Comedy",
    "Director": "James Gunn",
    "Writer": "James Gunn, Dan Abnett, Andy Lanning",
    "Actors": "Chris Pratt, Zoe Saldaña, Dave Bautista",
    "Plot": "The Guardians struggle to keep together as a team while dealing with their personal family issues, notably Star-Lord's encounter with his father, the ambitious celestial being Ego.",
    "Language": "English",
    "Country": "United States",
    "Awards": "Nominated for 1 Oscar. 15 wins & 60 nominations total",
    "Poster": "https://m.media-amazon.com/images/M/MV5BNWE5MGI3MDctMmU5Ni00YzI2LWEzMTQtZGIyZDA5MzQzNDBhXkEyXkFqcGc@._V1_SX300.jpg",
    "Ratings": [
        { "Source": "Internet Movie Database", "Value": "7.6/10" },
        { "Source": "Rotten Tomatoes", "Value": "85%" },
        { "Source": "Metacritic", "Value": "67/100" }
    ],
    "Metascore": "67",
    "imdbRating": "7.6",
    "imdbVotes": "806,353",
    "imdbID": "tt3896198",
    "Type": "movie",
    "BoxOffice": "$389,813,101",
    "Response": "True"
};

// Movie Database
let movies = [];

// Predefined movie lists by genre
const moviesByGenre = {
    action: ["The Dark Knight", "Mad Max: Fury Road", "John Wick", "Die Hard", "The Avengers", "Mission Impossible"],
    comedy: ["Superbad", "The Hangover", "Bridesmaids", "Anchorman", "Step Brothers", "Dumb and Dumber"],
    drama: ["The Shawshank Redemption", "The Godfather", "Schindler's List", "Forrest Gump", "The Green Mile", "Titanic"],
    horror: ["The Shining", "Hereditary", "Get Out", "The Conjuring", "A Quiet Place", "It"],
    "sci-fi": ["Inception", "Interstellar", "Blade Runner 2049", "The Matrix", "Arrival", "Dune"],
    romance: ["The Notebook", "Pride & Prejudice", "La La Land", "Before Sunrise", "Eternal Sunshine of the Spotless Mind", "Silver Linings Playbook"],
    thriller: ["Parasite", "Gone Girl", "Prisoners", "Se7en", "Silence of the Lambs", "Shutter Island"],
    animation: ["Spirited Away", "Toy Story", "Spider-Man: Into the Spider-Verse", "Up", "The Lion King", "Finding Nemo"],
    telugu: ["Baahubali: The Beginning", "RRR", "Arjun Reddy", "Pushpa", "Magadheera", "Eega"]
};

// Add sample movie
movies.push({
    id: 1,
    title: sampleMovieData.Title,
    year: parseInt(sampleMovieData.Year),
    genre: "action",
    rating: parseFloat(sampleMovieData.imdbRating),
    description: sampleMovieData.Plot,
    poster: sampleMovieData.Poster
});

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
        const moviesToFetch = moviesByGenre[genre] || [];
        if (moviesToFetch.length === 0) {
            selectionMessage.textContent = `No movies for ${genre}`;
            return;
        }
        selectionMessage.textContent = `Fetching ${genre} movies...`;
        const fetchPromises = moviesToFetch.map(title => fetchMovieByTitle(title, genre));
        const fetchedMovies = await Promise.all(fetchPromises);
        const validMovies = fetchedMovies.filter(movie => movie !== null);
        movies = [...movies, ...validMovies];
        displayMovies(validMovies, genre);
    } catch (error) {
        console.error('Error fetching movies:', error);
        selectionMessage.textContent = `Error loading ${genre} movies.`;
    }
}

// Fetch movie by title
async function fetchMovieByTitle(title, genre) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.Response === "True") {
            return {
                id: Date.now() + Math.floor(Math.random() * 1000),
                title: data.Title,
                year: parseInt(data.Year) || 0,
                genre: genre,
                rating: parseFloat(data.imdbRating) || 0,
                description: data.Plot || `No description available`,
                poster: data.Poster !== "N/A" ? data.Poster : `https://via.placeholder.com/300x450?text=${encodeURIComponent(title)}`
            };
        } else {
            return {
                id: movies.length + 1,
                title: title,
                year: 0,
                genre: genre,
                rating: 0,
                description: `No information available for ${title}`,
                poster: `https://via.placeholder.com/300x450?text=${encodeURIComponent(title)}`
            };
        }
    } catch (error) {
        return {
            id: movies.length + 1,
            title: title,
            year: 0,
            genre: genre,
            rating: 0,
            description: `Error loading ${title}`,
            poster: `https://via.placeholder.com/300x450?text=Error+Loading`
        };
    }
}

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
    return text.slice(0, maxLength) + '...';
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
    setupApiKeyControl();
});

// 🌗 Theme Toggle (class-based, no inline styles)
function setupThemeToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'themeToggle';
    toggleButton.className = 'theme-toggle';

    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme === 'light';
    document.body.classList.toggle('light-theme', isLight);
    toggleButton.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';

    document.body.appendChild(toggleButton);

    toggleButton.addEventListener('click', () => {
        const nowLight = !document.body.classList.contains('light-theme');
        document.body.classList.toggle('light-theme', nowLight);
        localStorage.setItem('theme', nowLight ? 'light' : 'dark');
        toggleButton.textContent = nowLight ? '🌙 Dark Mode' : '☀️ Light Mode';
    });
}

// 🔑 API key control (stores in localStorage)
function setupApiKeyControl() {
    const apiButton = document.createElement('button');
    apiButton.id = 'apiKeyButton';
    apiButton.className = 'api-key-btn';
    apiButton.textContent = '🔑 API Key';

    apiButton.addEventListener('click', () => {
        const current = localStorage.getItem('omdbApiKey') || '';
        const entered = window.prompt('Enter OMDB API key (leave blank to clear)', current);
        if (entered === null) return; // cancelled
        const trimmed = entered.trim();
        if (trimmed.length === 0) {
            localStorage.removeItem('omdbApiKey');
            apiKey = "3e974fca";
            if (selectionMessage) selectionMessage.textContent = 'Using default OMDB API key.';
        } else {
            localStorage.setItem('omdbApiKey', trimmed);
            apiKey = trimmed;
            if (selectionMessage) selectionMessage.textContent = 'OMDB API key saved.';
        }
    });

    document.body.appendChild(apiButton);
}
