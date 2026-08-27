const marketService = require('../services/marketService');

/**
 * Get market prices with filters.
 * GET /api/market/prices?state=Delhi&crop=Wheat
 */
async function getPrices(req, res, next) {
  try {
    const { state, crop, market, limit } = req.query;
    const prices = await marketService.getPrices({ state, crop, market, limit });
    res.json({ prices });
  } catch (err) {
    next(err);
  }
}

/**
 * Get list of available states.
 * GET /api/market/states
 */
async function getStates(req, res, next) {
  try {
    const states = await marketService.getStates();
    res.json({ states });
  } catch (err) {
    next(err);
  }
}

/**
 * Get list of available crops.
 * GET /api/market/crops
 */
async function getCrops(req, res, next) {
  try {
    const crops = await marketService.getCrops();
    res.json({ crops });
  } catch (err) {
    next(err);
  }
}

/**
 * Refresh market prices from external API (admin only).
 * POST /api/market/refresh
 */
async function refreshPrices(req, res, next) {
  try {
    const result = await marketService.refreshPrices();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPrices, getStates, getCrops, refreshPrices };
