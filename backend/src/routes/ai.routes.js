const { Router } = require('express');
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middleware/auth');

const router = Router();

// All AI routes require authentication
router.use(authenticate);

router.post('/chat', aiController.chat);
router.get('/history', aiController.getHistory);
router.get('/chat/:id', aiController.getChat);
router.delete('/chat/:id', aiController.deleteChat);
router.post('/crop-advice', aiController.cropAdvice);

module.exports = router;
