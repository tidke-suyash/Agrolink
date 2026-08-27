const { Router } = require('express');
const complaintsController = require('../controllers/complaints.controller');
const authenticate = require('../middleware/auth');

const router = Router();

// Publicly readable helplines
router.get('/helplines', complaintsController.getHelplines);

// Authenticated routes
router.use(authenticate);

router.get('/', complaintsController.getComplaints);
router.post('/', complaintsController.createComplaint);
router.patch('/:id/status', complaintsController.updateStatus);
router.post('/:id/escalation-draft', complaintsController.generateEscalationDraft);

module.exports = router;
