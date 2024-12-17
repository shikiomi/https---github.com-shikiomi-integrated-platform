const { db } = require('../config/db');

// Check product stock
const checkProductStock = (productId) => {
    const query = 'SELECT stock FROM inventory_products WHERE id = ?';
    return db.execute(query, [productId]);
};

// Deduct product stock
const deductProductStock = (productId, quantity) => {
    const query = 'UPDATE inventory_products SET stock = stock - ? WHERE id = ? AND stock >= ?';
    return db.execute(query, [quantity, productId, quantity]);
};

// Create a new order and insert into purchased_history
const createOrder = async (customerId, productId, quantity, totalPrice) => {
    const query = 'INSERT INTO orders (customer_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)';
    
    try {
        // Execute query and get the result
        const [result] = await db.execute(query, [customerId, productId, quantity, totalPrice]);
        
        // Ensure that result.insertId exists
        if (result && result.insertId) {
            return result;  // Return the result object containing insertId
        } else {
            throw new Error('Order creation failed: No insertId returned.');
        }
    } catch (err) {
        console.error('Error in createOrder:', err);
        throw err;
    }
};

// Get all orders
const getAllOrders = () => {
    const query = 'SELECT * FROM orders';
    return db.execute(query);
};

// Get an order by ID
const getOrderById = (id) => {
    const query = 'SELECT * FROM orders WHERE id = ?';
    return db.execute(query, [id]);
};

// Update an order
const updateOrder = (id, quantity, totalPrice) => {
    const query = 'UPDATE orders SET quantity = ?, total_price = ? WHERE id = ?';
    return db.execute(query, [quantity, totalPrice, id]);
};

// Delete an order
const deleteOrder = (id) => {
    const query = 'DELETE FROM orders WHERE id = ?';
    return db.execute(query, [id]);
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };
