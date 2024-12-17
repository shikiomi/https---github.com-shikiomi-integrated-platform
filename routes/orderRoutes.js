// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { 
  createNewOrder, 
  fetchOrders, 
  fetchOrderById, 
  modifyOrder, 
  removeOrder,
  deleteAllOrders,
  getAllPurchasedHistory, // Ensure this is imported
  getCustomerPurchasedHistory // Ensure this is imported
} = require('../controllers/orderController');

// Route to create a new order
router.post(
  '/orders',
  authMiddleware,
  roleMiddleware(['admin', 'sales-manager']), // Only admin or sales-manager can create an order
  createNewOrder
);

// Route to fetch all orders
router.get(
  '/orders',
  authMiddleware,
  fetchOrders
);

// Route to fetch a specific order by ID
router.get(
  '/orders/:id',
  authMiddleware,
  fetchOrderById
);

// Route to modify an order
router.put(
  '/orders/:id',
  authMiddleware,
  roleMiddleware(['admin', 'sales-manager']), // Only admin or sales-manager can modify an order
  modifyOrder
);

// Route to remove an order
router.delete(
  '/orders/:id',
  authMiddleware,
  roleMiddleware(['admin']), // Only admin can delete an order
  removeOrder
);

// Route for deleting all orders and resetting the auto-increment ID
router.delete(
  '/orders',
  authMiddleware,
  roleMiddleware(['admin']),  // Only admins can delete all orders
  deleteAllOrders
);

// New route to fetch all purchase history
router.get(
  '/purchased-history',
  authMiddleware,
  getAllPurchasedHistory // This should be a valid method in orderController.js
);

// New route to fetch purchase history for a specific customer by ID
router.get(
  '/purchased-history/:id',
  authMiddleware,
  getCustomerPurchasedHistory // This should be a valid method in orderController.js
);

module.exports = router;
