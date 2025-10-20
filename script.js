
// OMDB API Key
const apiKey = "3e974fca"; // Using a valid OMDB API key

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
    action: [
        "The Dark Knight", "Mad Max: Fury Road", "John Wick", "Die Hard", "The Avengers", "Mission: Impossible - Fallout",
        "Terminator 2: Judgment Day", "Gladiator", "The Bourne Identity", "Casino Royale", "The Raid", "Logan", "Kill Bill: Vol. 1", "Heat"
    ],
    comedy: [
        "Superbad", "The Hangover", "Bridesmaids", "Anchorman", "Step Brothers", "Dumb and Dumber",
        "Groundhog Day", "Monty Python and the Holy Grail", "Hot Fuzz", "Shaun of the Dead", "Tropic Thunder", "Mean Girls", "The Big Lebowski"
    ],
    drama: [
        "The Shawshank Redemption", "The Godfather", "Schindler's List", "Forrest Gump", "The Green Mile", "Titanic",
        "Fight Club", "Good Will Hunting", "A Beautiful Mind", "The Social Network", "Moonlight", "Spotlight"
    ],
    horror: [
        "The Shining", "Hereditary", "Get Out", "The Conjuring", "A Quiet Place", "It",
        "The Exorcist", "Alien", "The Babadook", "The Ring", "Halloween", "Scream"
    ],
    "sci-fi": [
        "Inception", "Interstellar", "Blade Runner 2049", "The Matrix", "Arrival", "Dune",
        "Ex Machina", "2001: A Space Odyssey", "Minority Report", "Edge of Tomorrow", "The Fifth Element", "Moon"
    ],
    romance: [
        "The Notebook", "Pride & Prejudice", "La La Land", "Before Sunrise", "Eternal Sunshine of the Spotless Mind", "Silver Linings Playbook",
        "Casablanca", "Roman Holiday", "Amélie", "500 Days of Summer", "The Fault in Our Stars"
    ],
    thriller: [
        "Parasite", "Gone Girl", "Prisoners", "Se7en", "The Silence of the Lambs", "Shutter Island",
        "Zodiac", "No Country for Old Men", "Oldboy", "Nightcrawler", "The Girl with the Dragon Tattoo"
    ],
    animation: [
        "Spirited Away", "Toy Story", "Spider-Man: Into the Spider-Verse", "Up", "The Lion King", "Finding Nemo",
        "WALL-E", "Coco", "Inside Out", "How to Train Your Dragon", "Kiki's Delivery Service"
    ],
    telugu: [
        "Baahubali: The Beginning", "RRR", "Arjun Reddy", "Pushpa", "Magadheera", "Eega",
        "Ala Vaikunthapurramuloo", "Mahanati", "Srimanthudu", "DJ: Duvvada Jagannadham", "Agent Sai Srinivasa Athreya", "Sye"
    ]
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
const search = document.getElementById('search');
let timeOut;
search.addEventListener('input', (e) => {
    const query = e.target.value;
    clearTimeout(timeOut);
    timeOut = setTimeout(async () => {
        if (query.length > 0) {
            moviesContainer.innerHTML = '';
            selectionMessage.textContent = `Searching for: ${query}...`;
            const movie = await fetchTitle(query);
            if (movie.Response === "True" || movie.year !== 0) {
                displayMovie(movie);
                selectionMessage.textContent = `Showing result for: ${movie.title}`;
            } else {

                selectionMessage.textContent = `No exact match found for "${query}"`;
                displayMovie(movie);
            }
        } else {
            selectionMessage.textContent = `No movies for ${query}`;
            return;
        }
    }, 300)
})
async function fetchTitle(title) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.Response === "True") {
            return {
                id: Date.now() + Math.floor(Math.random() * 1000),
                title: data.Title,
                year: parseInt(data.Year) || 0,
                genre: data.genre,
                rating: parseFloat(data.imdbRating) || 0,
                description: data.Plot || `No description available`,
                poster: data.Poster !== "N/A" ? data.Poster : `https://via.placeholder.com/300x450?text=${encodeURIComponent(title)}`
            };
        } else {
            return {
                id: movies.length + 1,
                title: title,
                year: 0,
                genre: 'genre',
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
            genre: 'genre',
            rating: 0,
            description: `Error loading ${title}`,
            poster: `https://via.placeholder.com/300x450?text=Error+Loading`
        };
    }
}
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


function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}


window.addEventListener('DOMContentLoaded', () => {
    const actionButton = document.querySelector('.genre-btn[data-genre="action"]');
    if (actionButton) {
        document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
        actionButton.classList.add('active');
        movies = [];
        filterMovies('action');
    }

    document.body.classList.add('dark-theme');

    document.body.style.backgroundColor = '#0a1929';
    document.body.style.color = '#f0f0f0';
});



