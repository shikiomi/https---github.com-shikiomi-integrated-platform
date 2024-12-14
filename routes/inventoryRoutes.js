const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Inventory routes with role-based access control
router.post('/products', authMiddleware, roleMiddleware(['admin', 'inventory-manager']), inventoryController.createProduct);
router.get('/products', authMiddleware, inventoryController.getProducts);
router.get('/products/:id', authMiddleware, inventoryController.getProduct);
router.put('/products/:id', authMiddleware, roleMiddleware(['admin', 'inventory-manager']), inventoryController.updateProduct);
router.delete('/products/:id', authMiddleware, roleMiddleware(['admin', 'inventory-manager']), inventoryController.deleteProduct);

module.exports = router;
