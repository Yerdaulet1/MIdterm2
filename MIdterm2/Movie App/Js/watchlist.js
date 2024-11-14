const apiKey = '351196dc77cd5fbc3a47e64e07254c5f';
const apiBase = 'https://api.themoviedb.org/3';
const imgBase = 'https://image.tmdb.org/t/p/w500';

function loadWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    displayMovies(watchlist);
}

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
            <button onclick="addToWatchlist(${movie.id}, '${movie.title}', '${movie.poster_path}', ${movie.vote_average})">Add to Watchlist</button>
        `;
        grid.appendChild(movieCard);
    });
}


function addToWatchlist(movieId, movieTitle, posterPath, voteAverage) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    if (!watchlist.some(movie => movie.id === movieId)) {
        watchlist.push({ id: movieId, title: movieTitle, poster_path: posterPath, vote_average: voteAverage });
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert(`${movieTitle} added to your watchlist!`);
    } else {
        alert(`${movieTitle} is already in your watchlist.`);
    }
}

function sortWatchlist() {
    const sortBy = document.getElementById('sort').value;
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    watchlist = watchlist.sort((a, b) => {
        if (sortBy === 'popularity.desc') {
            return b.popularity - a.popularity;
        } else if (sortBy === 'release_date.desc') {
            return new Date(b.release_date) - new Date(a.release_date);
        } else if (sortBy === 'vote_average.desc') {
            return b.vote_average - a.vote_average;
        }
    });

    displayMovies(watchlist);
}
async function viewMovieDetails(movieId) {
    const response = await fetch(`${apiBase}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`);
    const movie = await response.json();

    const modalContent = document.getElementById('movieDetails');
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
    document.getElementById('movieModal').style.display = 'flex';
}
function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}

async function loadPopularMovies() {
    const response = await fetch(`${apiBase}/movie/popular?api_key=${apiKey}`);
    const data = await response.json();
    displayMovies(data.results);
}

document.addEventListener('DOMContentLoaded', () => {
    loadWatchlist(); 
    loadPopularMovies(); 
    document.getElementById('search-button').addEventListener('click', searchMovies);
    document.getElementById('search-button').addEventListener('input', handleSearchInput);
    document.querySelector('.close-button').addEventListener('click', closeModal);
});
