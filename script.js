// Weather Dashboard - A web application for checking weather forecasts

// Define global variables for API access
const apiKey = '6c26d6a06d4530e5d711257392c15e69';
const apiBaseUrl = 'https://api.openweathermap.org/data/2.5';

// Get references to important DOM elements
const cityForm = document.getElementById('city-search');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecastWeather = document.getElementById('forecast-weather');

// Initialize search history from localStorage or create an empty array
let searchedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];

// Set up event listeners for form submission and history clicks
cityForm.addEventListener('submit', handleCitySearch);
searchHistory.addEventListener('click', handleHistoryClick);

// Display the search history when the page loads
displaySearchHistory();

// Handle the city search form submission
async function handleCitySearch(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        try {
            await getWeatherData(city);
            addToSearchHistory(city);
            cityInput.value = '';
        } catch (error) {
            console.error('Error:', error);
            alert('City not found or there was an error fetching data. Please try again.');
        }
    }
}

// Fetch weather data for given city name
async function getWeatherData(city) {
    const currentResponse = await fetch(`${apiBaseUrl}/weather?q=${city}&units=imperial&appid=${apiKey}`);
    const forecastResponse = await fetch(`${apiBaseUrl}/forecast?q=${city}&units=imperial&appid=${apiKey}`);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error(`HTTP error! status: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    displayCurrentWeather(currentData);
    displayForecast(forecastData);
}

// Display current weather data
function displayCurrentWeather(data) {
    const { temp, humidity } = data.main;
    const windSpeed = data.wind.speed;
    const weatherIcon = data.weather[0].icon;
    const weatherDescription = data.weather[0].description;

    // Update the current weather HTML
    currentWeather.innerHTML = `
        <h2>${data.name} (${dayjs.unix(data.dt).format('MM/DD/YYYY')})</h2>
        <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}" class="weather-icon">
        <p>Temperature: ${temp.toFixed(1)}°F</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed.toFixed(1)} MPH</p>
    `;
}

// Display 5-day forecast
function displayForecast(data) {
    // Filter the forecast data to get one reading per day at noon
    const dailyForecasts = data.list.filter(reading => reading.dt_txt.includes('12:00:00'));
    
    // Clear previous forecast and add title
    forecastWeather.innerHTML = '<h3>5-Day Forecast:</h3>';

    // Create and append forecast cards for each day
    dailyForecasts.forEach(day => {
        const { temp, humidity } = day.main;
        const windSpeed = day.wind.speed;
        const weatherIcon = day.weather[0].icon;
        const weatherDescription = day.weather[0].description;

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <h4>${dayjs(day.dt_txt).format('MM/DD/YYYY')}</h4>
            <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDescription}" class="weather-icon">
            <p>Temp: ${temp.toFixed(1)}°F</p>
            <p>Wind: ${windSpeed.toFixed(1)} MPH</p>
            <p>Humidity: ${humidity}%</p>
        `;
        forecastWeather.appendChild(forecastCard);
    });
}

// Add a city to the search history
function addToSearchHistory(city) {
    if (!searchedCities.includes(city)) {
        searchedCities.unshift(city);
        if (searchedCities.length > 5) searchedCities.pop();
        localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
        displaySearchHistory();
    }
}

// Display the search history
function displaySearchHistory() {
    searchHistory.innerHTML = '';
    searchedCities.forEach(city => {
        const btn = document.createElement('button');
        btn.textContent = city;
        btn.setAttribute('data-city', city);
        searchHistory.appendChild(btn);
    });
}

// Handle clicks on search history items
function handleHistoryClick(e) {
    if (e.target.matches('button')) {
        const city = e.target.getAttribute('data-city');
        cityInput.value = city;
        handleCitySearch({ preventDefault: () => {} });
    }
}