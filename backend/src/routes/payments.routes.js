const { Router } = require('express');
const paymentsController = require('../controllers/payments.controller');
const authenticate = require('../middleware/auth');

const router = Router();

router.post('/create-order', authenticate, paymentsController.createPaymentOrder);
router.post('/verify', authenticate, paymentsController.verifyPayment);

module.exports = router;
