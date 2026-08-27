const { Router } = require('express');
const ordersController = require('../controllers/orders.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getMyOrders);
router.get('/farmer', requireRole('farmer'), ordersController.getFarmerOrders);
router.get('/:id', ordersController.getOrder);
router.put('/:id/status', requireRole('farmer', 'admin'), ordersController.updateOrderStatus);

module.exports = router;
