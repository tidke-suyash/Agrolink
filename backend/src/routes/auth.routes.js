const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');

const router = Router();

// Public routes
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/set-role', authenticate, authController.setRole);
router.delete('/account', authenticate, authController.deleteAccount);

module.exports = router;
