const apiKey = '351196dc77cd5fbc3a47e64e07254c5f';
const apiBase = 'https://api.themoviedb.org/3';
const imgBase = 'https://image.tmdb.org/t/p/w500';
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadPopularMovies();
    document.getElementById('search-button').addEventListener('click', searchMovies);
    document.getElementById('search-button').addEventListener('input', handleSearchInput);
    document.querySelector('.close-button').addEventListener('click', closeModal);
});

// Fetch popular movies on load
async function loadPopularMovies() {
    const response = await fetch(`${apiBase}/movie/popular?api_key=${apiKey}`);
    const data = await response.json();
    displayMovies(data.results);
}

// Display movies in grid
function displayMovies(movies) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${imgBase + movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
            <button onclick="viewMovieDetails(${movie.id})">View Details</button>
            <button onclick="addToWatchlist(${movie.id}, '${movie.title}')">Add to Watchlist</button>
        `;
        grid.appendChild(movieCard);
    });
}

async function sortMovies() {
    const sortBy = document.getElementById('sort').value;
    const response = await fetch(`${apiBase}/discover/movie?api_key=${apiKey}&sort_by=${sortBy}`);
    const data = await response.json();
    displayMovies(data.results);
}

async function handleSearchInput() {
    const query = document.getElementById('search-button').value;
    if (query.length > 2) {
        const response = await fetch(`${apiBase}/search/movie?api_key=${apiKey}&query=${query}`);
        const data = await response.json();
        displayAutocompleteResults(data.results);
    } else {
        clearAutocompleteResults();
    }
}

function displayAutocompleteResults(movies) {
    const results = document.getElementById('autocomplete-results');
    results.innerHTML = '';
    results.style.display = 'block';
    movies.slice(0, 5).forEach(movie => {
        const item = document.createElement('div');
        item.innerText = movie.title;
        item.addEventListener('click', () => {
            document.getElementById('search-button').value = movie.title;
            clearAutocompleteResults();
            displayMovies([movie]);
        });
        results.appendChild(item);
    });
}

function clearAutocompleteResults() {
    document.getElementById('autocomplete-results').style.display = 'none';
}

async function viewMovieDetails(movieId) {
    const response = await fetch(`${apiBase}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`);
    const movie = await response.json();

    const modalContent = document.querySelector('.movie-details');
    modalContent.innerHTML = `
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
        <p>Rating: ${movie.vote_average} / 10</p>
        <p>Runtime: ${movie.runtime} minutes</p>
        <h3>Cast:</h3>
        <ul>
            ${movie.credits.cast.slice(0, 5).map(actor => `<li>${actor.name}</li>`).join('')}
        </ul>
        ${movie.videos.results.length ? `<iframe src="https://www.youtube.com/embed/${movie.videos.results[0].key}" frameborder="0"></iframe>` : ''}
    `;
    document.querySelector('.modal').style.display = 'flex';
}

function closeModal() {
    document.querySelector('.modal').style.display = 'none';
}

function addToWatchlist(movieId, movieTitle) {
    console.log(`Attempting to add movie with ID: ${movieId}, Title: ${movieTitle}`); 

    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    console.log('Current watchlist:', watchlist);
    const movieExists = watchlist.some(movie => movie.id === movieId);
    if (!movieExists) {

        watchlist.push({ id: movieId, title: movieTitle });
        console.log('Updated watchlist after adding:', watchlist);


        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        console.log('Watchlist successfully updated in localStorage');

        alert(`${movieTitle} added to your watchlist!`);
    } else {
        console.log('Movie already exists in watchlist');
        alert(`${movieTitle} is already in your watchlist.`);
    }
}


async function searchMovies() {
    const query = document.getElementById('search-button').value;
    if (query) {
        const response = await fetch(`${apiBase}/search/movie?api_key=${apiKey}&query=${query}`);
        const data = await response.json();
        displayMovies(data.results);
    }
}
