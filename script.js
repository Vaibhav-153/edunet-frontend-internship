const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherSection = document.getElementById('weatherSection');
const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const windSpeedEl = document.getElementById('windSpeed');
const humidityEl = document.getElementById('humidity');

// Utility Functions
/**
 * Show loading state
 */
function showLoading() {
    hideError();
    hideWeather();
    loading.classList.remove('hidden');
}

/**
 * Hide loading state
 */
function hideLoading() {
    loading.classList.add('hidden');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    hideLoading();
    hideWeather();
}

/**
 * Hide error message
 */
function hideError() {
    error.classList.add('hidden');
}

/**
 * Show weather section
 */
function showWeather() {
    weatherSection.classList.remove('hidden');
}

/**
 * Hide weather section
 */
function hideWeather() {
    weatherSection.classList.add('hidden');
    // Clear previous data
    cityNameEl.textContent = '';
    weatherIconEl.src = '';
    temperatureEl.textContent = '';
    descriptionEl.textContent = '';
    windSpeedEl.textContent = '';
    humidityEl.textContent = '';
}

/**
 * Fetch weather data from API
 * @param {string|Object} query - City name or {lat, lon} object
 * @returns {Promise<Object>} Weather data or throws error
 */
// ...WITH THIS NEW FUNCTION
async function fetchWeather(query) {
    // The base URL is now our own API endpoint on Vercel
    const API_BASE_URL = '/api/weather'; 
    let url;

    if (typeof query === 'string') {
        // Search by city name
        url = `${API_BASE_URL}?city=${encodeURIComponent(query)}`;
    } else {
        // Search by lat/lon
        url = `${API_BASE_URL}?lat=${query.lat}&lon=${query.lon}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found or API error');
        }
        return await response.json();
    } catch (err) {
        throw new Error(err.message || 'Failed to fetch weather data');
    }
}

/**
 * Display weather data in UI
 * @param {Object} data - Weather API response
 */
function displayWeather(data) {
    hideLoading();
    hideError();
    showWeather();

    // Update elements
    cityNameEl.textContent = data.name + ', ' + data.sys.country;
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIconEl.src = iconUrl;
    weatherIconEl.alt = data.weather[0].description;
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionEl.textContent = data.weather[0].description;
    windSpeedEl.textContent = `${data.wind.speed} m/s`;
    humidityEl.textContent = `${data.main.humidity}%`;
}

// Event Listeners
/**
 * Handle search button click
 */
searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    try {
        const data = await fetchWeather(city);
        displayWeather(data);
        cityInput.value = ''; // Clear input
    } catch (err) {
        showError(err.message);
    }
});

/**
 * Handle Enter key in input field
 */
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

/**
 * Handle geolocation button click
 */
geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude: lat, longitude: lon } = position.coords;
            try {
                const data = await fetchWeather({ lat, lon });
                displayWeather(data);
            } catch (err) {
                showError(err.message);
            }
        },
        (err) => {
            hideLoading();
            let message = 'Failed to get location: ';
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    message += 'Location access denied';
                    break;
                case err.POSITION_UNAVAILABLE:
                    message += 'Location unavailable';
                    break;
                default:
                    message += 'Unknown error';
            }
            showError(message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
});

// Initialize: Hide weather and error on load
hideWeather();
hideError();