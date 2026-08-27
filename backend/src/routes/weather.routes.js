const { Router } = require('express');
const weatherController = require('../controllers/weather.controller');
const authenticate = require('../middleware/auth');

const router = Router();

// Weather requires auth (to track usage, prevent abuse)
router.get('/', authenticate, weatherController.getWeather);

module.exports = router;
