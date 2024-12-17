const { db } = require('../config/db');
const { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder } = require('../models/orderModel');
const { redisClient, logger, redisLogger } = require('../config/db');

// Check product stock
const checkProductStock = async (productId) => {
    const query = 'SELECT stock FROM inventory_products WHERE id = ?';
    const [result] = await db.execute(query, [productId]);
    return result.length > 0 ? result[0].stock : null;
};

// Deduct product stock
const deductProductStock = async (productId, quantity) => {
    const query = 'UPDATE inventory_products SET stock = stock - ? WHERE id = ? AND stock >= ?';
    const [result] = await db.execute(query, [quantity, productId, quantity]);
    return result.affectedRows > 0;
};

// Create a new order
const createNewOrder = async (req, res) => {
    const { customerId, productId, quantity, totalPrice } = req.body;

    if (!customerId || !productId || !quantity || !totalPrice) {
        return res.status(400).json({ error: 'All fields are required: customerId, productId, quantity, totalPrice' });
    }

    try {
        logger.info(`Creating order: customerId=${customerId}, productId=${productId}, quantity=${quantity}, totalPrice=${totalPrice}`);

        // Step 1: Check product stock
        const stock = await checkProductStock(productId);
        if (stock === null) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (stock < quantity) {
            return res.status(400).json({ error: `Insufficient stock. Available stock: ${stock}` });
        }

        // Step 2: Deduct stock
        const isStockDeducted = await deductProductStock(productId, quantity);
        if (!isStockDeducted) {
            return res.status(400).json({ error: 'Failed to deduct stock. Insufficient stock or product does not exist.' });
        }

        // Step 3: Create order and get the result
        const result = await createOrder(customerId, productId, quantity, totalPrice);  // No destructuring here

        // Step 4: Insert into purchased_history table
        const historyQuery = 'INSERT INTO purchased_history (customer_id, order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?, ?)';
        await db.execute(historyQuery, [customerId, result.insertId, productId, quantity, totalPrice]);

        // Prepare and publish the order event to Redis
        const orderEvent = JSON.stringify({
            type: 'NEW_ORDER',
            orderId: result.insertId,
            customerId,
            productId,
            quantity,
            totalPrice,
            timestamp: new Date().toISOString(),
        });

        redisClient.publish('order_events', orderEvent, (err, reply) => {
            if (err) {
                console.error('Error publishing order event to Redis:', err);
                return res.status(500).json({ error: 'Failed to publish order event to Redis' });
            }
            redisLogger.info(`Published order event: ${orderEvent}`);
        });

        logger.info(`Order created successfully: ${orderEvent}`);
        res.status(201).json({ message: 'Order created successfully, stock updated', orderId: result.insertId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error while creating order' });
    }
};

// Fetch all orders
const fetchOrders = async (req, res) => {
    try {
        logger.info('Fetching all orders');
        const [orders] = await getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error while fetching orders' });
    }
};

// Fetch a specific order by ID
const fetchOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        logger.info(`Fetching order with id: ${id}`);
        const [order] = await getOrderById(id);
        if (order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order[0]);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error while fetching order' });
    }
};

// Modify an order
const modifyOrder = async (req, res) => {
    const { id } = req.params;
    const { quantity, totalPrice } = req.body;

    if (!quantity || !totalPrice) {
        return res.status(400).json({ error: 'Quantity and totalPrice are required' });
    }

    try {
        logger.info(`Modifying order with id: ${id}, quantity: ${quantity}, totalPrice: ${totalPrice}`);
        const [result] = await updateOrder(id, quantity, totalPrice);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Internal server error while updating order' });
    }
};

// Remove an order
const removeOrder = async (req, res) => {
    const { id } = req.params;

    try {
        logger.info(`Deleting order with id: ${id}`);
        const [result] = await deleteOrder(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal server error while deleting order' });
    }
};

// Delete all orders and reset the auto-increment ID
const deleteAllOrders = async (req, res) => {
    try {
        logger.info('Deleting all orders and resetting auto-increment ID');
        const deleteQuery = 'DELETE FROM orders';
        await db.execute(deleteQuery);

        const resetAutoIncrementQuery = 'ALTER TABLE orders AUTO_INCREMENT = 1';
        await db.execute(resetAutoIncrementQuery);

        const event = 'All orders deleted and AUTO_INCREMENT reset to 1';
        redisClient.publish('order_events', event);
        redisLogger.info(`Published event: ${event}`);

        res.status(200).json({ message: 'All orders deleted and AUTO_INCREMENT reset successfully' });
    } catch (error) {
        console.error('Error deleting all orders:', error);
        res.status(500).json({ error: 'Internal server error while deleting all orders' });
    }
};

// New Method to Get All Purchased History
const getAllPurchasedHistory = async (req, res) => {
    try {
        const query = 'SELECT * FROM purchased_history';
        const [history] = await db.execute(query);
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ error: 'Internal server error while fetching purchase history' });
    }
};

// New Method to Get Customer's Purchased History by ID
const getCustomerPurchasedHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM purchased_history WHERE customer_id = ?';
        const [history] = await db.execute(query, [id]);

        if (history.length === 0) {
            return res.status(404).json({ error: 'No purchase history found for this customer' });
        }

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching customer purchase history:', error);
        res.status(500).json({ error: 'Internal server error while fetching customer purchase history' });
    }
};

module.exports = { 
    createNewOrder, 
    fetchOrders, 
    fetchOrderById, 
    modifyOrder, 
    removeOrder, 
    deleteAllOrders, 
    getAllPurchasedHistory, 
    getCustomerPurchasedHistory 
};
