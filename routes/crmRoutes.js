const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');  // Ensure correct import

// CRM routes with role-based access control
router.post('/customers', crmController.createCustomer);  // Create a new customer
router.get('/customers', crmController.getCustomers);  // Get all customers
router.get('/customers/:id', crmController.getCustomer);  // Get a single customer by ID
router.put('/customers/:id', crmController.updateCustomer);  // Update customer details by ID
router.delete('/customers/:id', crmController.deleteCustomer);  // Delete a specific customer by ID

// Add route to delete all customers (resetting customer ID)
router.delete('/customers', crmController.deleteAllCustomers);  // New route to delete all customers

module.exports = router;
