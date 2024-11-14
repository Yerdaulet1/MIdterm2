const apiKey = '876f13b064e33cabb9d9c3bedbf36af5'; 
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('search-button');
const locationBtn = document.getElementById('location-button');
const unitToggleBtns = document.querySelectorAll('.unit-toggle button');
const currentWeatherSection = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecastContainer');

let unit = 'metric';

searchBtn.addEventListener('click', () => getWeatherByCity(cityInput.value));
locationBtn.addEventListener('click', getWeatherByLocation);
unitToggleBtns.forEach(button => {
  button.addEventListener('click', () => {
    unit = button.id === 'celsius' ? 'metric' : 'imperial';
    updateUnitToggle();
    getWeatherByCity(cityInput.value);
  });
});

function updateUnitToggle() {
  unitToggleBtns.forEach(button => {
    button.classList.toggle('active', (button.id === 'celsius' && unit === 'metric') || (button.id === 'fahrenheit' && unit === 'imperial'));
  });
}

function getWeatherByCity(city) {
  if (!city) return;
  
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      displayCurrentWeather(data);
      get5DayForecast(city);
    })
    .catch(error => console.error('Ошибка при получении данных:', error));
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          displayCurrentWeather(data);
          get5DayForecastByLocation(latitude, longitude);
        })
        .catch(error => console.error('Ошибка при получении данных:', error));
    });
  } else {
    alert('Геолокация не поддерживается вашим браузером.');
  }
}

function displayCurrentWeather(data) {
  const { name, main, weather, wind } = data;
  
  document.getElementById('cityName').textContent = name;
  document.getElementById('date').textContent = new Date().toLocaleDateString();
  document.getElementById('temperature').textContent = `${Math.round(main.temp)}°`;
  document.getElementById('weatherDescription').textContent = weather[0].description;
  document.getElementById('humidity').textContent = `${main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${wind.speed} м/с`;
  document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
}

function get5DayForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => display5DayForecast(data))
    .catch(error => console.error('Ошибка при получении прогноза:', error));
}

function get5DayForecastByLocation(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => display5DayForecast(data))
    .catch(error => console.error('Ошибка при получении прогноза:', error));
}

function display5DayForecast(data) {
  forecastContainer.innerHTML = '';

  const forecastByDay = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!forecastByDay[date]) {
      forecastByDay[date] = {
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        icon: item.weather[0].icon,
        description: item.weather[0].description
      };
    } else {
      forecastByDay[date].temp_min = Math.min(forecastByDay[date].temp_min, item.main.temp_min);
      forecastByDay[date].temp_max = Math.max(forecastByDay[date].temp_max, item.main.temp_max);
    }
  });

  Object.keys(forecastByDay).slice(0, 5).forEach(date => {
    const forecast = forecastByDay[date];

    const forecastElement = document.createElement('div');
    forecastElement.className = 'forecast-day';
    forecastElement.innerHTML = `
      <p>${new Date(date).toLocaleDateString()}</p>
      <img src="http://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="${forecast.description}">
      <p class="temp-high">${Math.round(forecast.temp_max)}°</p>
      <p class="temp-low">${Math.round(forecast.temp_min)}°</p>
    `;
    forecastContainer.appendChild(forecastElement);
  });
}
cityInput.addEventListener('input', () => fetchCitySuggestions(cityInput.value));

function fetchCitySuggestions(query) {
  if (query.length < 3) {
    clearAutocompleteResults();
    return;
  }

  fetch(`https://api.teleport.org/api/cities/?search=${query}&limit=5`)
    .then(response => response.json())
    .then(data => displayAutocompleteResults(data._embedded['city:search-results']))
    .catch(error => console.error('Error fetching suggestions:', error));
}

function displayAutocompleteResults(cities) {
  const suggestionsDiv = document.getElementById('autocomplete-results');
  suggestionsDiv.innerHTML = '';
  suggestionsDiv.style.display = 'block';

  cities.forEach(city => {
    const item = document.createElement('div');
    item.classList.add('suggestion-item');
    item.innerText = city.matching_full_name;
    item.addEventListener('click', () => {
      cityInput.value = city.matching_full_name;
      clearAutocompleteResults();
      getWeatherByCity(cityInput.value);
    });
    suggestionsDiv.appendChild(item);
  });
}
function clearAutocompleteResults() {
  const suggestionsDiv = document.getElementById('autocomplete-results');
  suggestionsDiv.innerHTML = '';
  suggestionsDiv.style.display = 'none';
}
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchBtn.click()
  }
});