const { Router } = require('express');
const productsController = require('../controllers/products.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = Router();

// Public routes
router.get('/', productsController.listProducts);
router.get('/:id', productsController.getProduct);

// Farmer routes
router.get('/my/listings', authenticate, requireRole('farmer'), productsController.getMyProducts);
router.post('/', authenticate, requireRole('farmer'), productsController.createProduct);
router.put('/:id', authenticate, requireRole('farmer', 'admin'), productsController.updateProduct);
router.delete('/:id', authenticate, requireRole('farmer', 'admin'), productsController.deleteProduct);

module.exports = router;
