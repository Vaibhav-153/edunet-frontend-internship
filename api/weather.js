// This is your new serverless function: api/weather.js

export default async function handler(request, response) {
  // Get the API key from Vercel's environment variables
  const API_KEY = process.env.API_KEY;
  const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // Get the search parameters (city or lat/lon) from the request URL
  const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  let fetchUrl;

  if (city) {
    fetchUrl = `${API_BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
  } else if (lat && lon) {
    fetchUrl = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  } else {
    // If no city or lat/lon, return an error
    return response.status(400).json({ error: 'City or coordinates are required' });
  }

  try {
    const weatherResponse = await fetch(fetchUrl);
    if (!weatherResponse.ok) {
      // If the API call fails, pass the error status along
      const errorData = await weatherResponse.json();
      return response.status(weatherResponse.status).json(errorData);
    }
    const weatherData = await weatherResponse.json();
    // Send the successful weather data back to your front-end
    return response.status(200).json(weatherData);

  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch weather data' });
  }
}