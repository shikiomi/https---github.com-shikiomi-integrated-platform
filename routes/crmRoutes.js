const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');  // Ensure correct import
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// CRM routes with role-based access control
router.post('/customers', 
    authMiddleware,
    roleMiddleware(['admin']), 
    crmController.createCustomer);  // Create a new customer

router.get('/customers', authMiddleware,
  roleMiddleware(['admin']), 
  crmController.getCustomers);  // Get all customers

router.get('/customers/:id', 
    authMiddleware,
  (req, res, next) => {
    // Ensure that the customer can only access their own data
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'You do not have permission to access this customer data' });
    }
    next();
  },
  crmController.getCustomer
);  // Get a single customer by ID

router.put('/customers/:id',authMiddleware,
    roleMiddleware(['admin']), 
    crmController.updateCustomer);  // Update customer details by ID

router.delete('/customers/:id', authMiddleware,
    roleMiddleware(['admin']), 
    crmController.deleteCustomer);  // Delete a specific customer by ID

// Add route to delete all customers (resetting customer ID)
router.delete('/customers', Middleware,
    roleMiddleware(['admin']), 
    crmController.deleteAllCustomers);  // New route to delete all customers

module.exports = router;
