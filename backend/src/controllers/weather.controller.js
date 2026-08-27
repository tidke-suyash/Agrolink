const weatherService = require('../services/weatherService');

/**
 * Get weather data for a location.
 * GET /api/weather?lat=28.6&lng=77.2
 */
async function getWeather(req, res, next) {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const weather = await weatherService.getWeather(
      parseFloat(lat),
      parseFloat(lng)
    );

    res.json({ weather });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWeather };
