const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController'); 
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.post('/tickets', authMiddleware, roleMiddleware(['admin', 'support-agent']), supportController.createTicket);
router.get('/tickets', authMiddleware, supportController.getTickets);  
router.get('/tickets/:id', authMiddleware, supportController.getTicket);  
router.put('/tickets/:id', authMiddleware, roleMiddleware(['admin', 'support-agent']), supportController.updateTicket);
router.delete('/tickets/:id', authMiddleware, roleMiddleware(['admin', 'support-agent']), supportController.deleteTicket);

module.exports = router;
