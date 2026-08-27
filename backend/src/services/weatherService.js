const { OPENWEATHER_API_KEY } = require('../config/env');
const supabase = require('../config/supabase');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get weather data for a location. Checks cache first, then calls OpenWeather.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Formatted weather data
 */
async function getWeather(lat, lng) {
  const locationKey = `${parseFloat(lat).toFixed(2)}_${parseFloat(lng).toFixed(2)}`;

  // Check cache first
  const { data: cached } = await supabase
    .from('weather_cache')
    .select('*')
    .eq('location_key', locationKey)
    .single();

  if (cached) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < CACHE_DURATION_MS) {
      return cached.data;
    }
  }

  // Fetch from OpenWeather
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=40`),
  ]);

  if (!currentRes.ok) {
    throw new Error(`OpenWeather API error: ${currentRes.status}`);
  }

  const current = await currentRes.json();
  const forecast = forecastRes.ok ? await forecastRes.json() : null;

  // Transform to clean format
  const weatherData = {
    current: {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      condition: current.weather[0]?.main,
      description: current.weather[0]?.description,
      icon: current.weather[0]?.icon,
      pressure: current.main.pressure,
      visibility: current.visibility,
      clouds: current.clouds?.all,
    },
    location: {
      name: current.name,
      country: current.sys?.country,
      lat,
      lng,
    },
    forecast: forecast?.list
      ? processForecast(forecast.list)
      : [],
    farming: generateFarmingAlerts(current),
    fetchedAt: new Date().toISOString(),
  };

  // Cache the result (upsert)
  await supabase
    .from('weather_cache')
    .upsert({
      location_key: locationKey,
      lat,
      lng,
      data: weatherData,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'location_key' });

  return weatherData;
}

/**
 * Process 5-day forecast into daily summaries.
 */
function processForecast(list) {
  const dailyMap = {};

  list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyMap[date]) {
      dailyMap[date] = {
        date,
        temps: [],
        conditions: [],
        humidity: [],
        icons: [],
      };
    }
    dailyMap[date].temps.push(item.main.temp);
    dailyMap[date].conditions.push(item.weather[0]?.main);
    dailyMap[date].humidity.push(item.main.humidity);
    dailyMap[date].icons.push(item.weather[0]?.icon);
  });

  return Object.values(dailyMap).slice(0, 5).map((day) => ({
    date: day.date,
    tempMin: Math.round(Math.min(...day.temps)),
    tempMax: Math.round(Math.max(...day.temps)),
    condition: mode(day.conditions),
    humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
    icon: mode(day.icons),
  }));
}

/**
 * Generate farming-specific weather alerts.
 */
function generateFarmingAlerts(current) {
  const alerts = [];

  if (current.main.temp > 40) {
    alerts.push({ type: 'warning', message: 'Extreme heat — irrigate crops early morning or evening' });
  }
  if (current.main.temp < 5) {
    alerts.push({ type: 'warning', message: 'Frost risk — protect sensitive crops with mulch or covers' });
  }
  if (current.main.humidity > 85) {
    alerts.push({ type: 'info', message: 'High humidity — watch for fungal diseases in crops' });
  }
  if (current.wind.speed > 10) {
    alerts.push({ type: 'warning', message: 'Strong winds — avoid spraying pesticides today' });
  }
  if (current.weather[0]?.main === 'Rain') {
    alerts.push({ type: 'info', message: 'Rain expected — good time to skip irrigation, check drainage' });
  }
  if (current.main.humidity < 30) {
    alerts.push({ type: 'info', message: 'Low humidity — increase irrigation frequency' });
  }

  return alerts;
}

/**
 * Get the most common value in an array (mode).
 */
function mode(arr) {
  const freq = {};
  arr.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
}

module.exports = { getWeather };
