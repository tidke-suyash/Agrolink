const { Router } = require('express');
const marketController = require('../controllers/market.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = Router();

// Public routes
router.get('/prices', marketController.getPrices);
router.get('/states', marketController.getStates);
router.get('/crops', marketController.getCrops);

// Admin-only route
router.post('/refresh', authenticate, requireRole('admin'), marketController.refreshPrices);

module.exports = router;
