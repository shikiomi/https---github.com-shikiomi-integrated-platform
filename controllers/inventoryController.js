const { db } = require('../config/db');  // Ensure we're using the promisified db connection

// Create a new inventory product
const createProduct = async (req, res) => {
  const { name, description, stock, price } = req.body;
  const query = 'INSERT INTO inventory_products (name, description, stock, price) VALUES (?, ?, ?, ?)';

  try {
    const [result] = await db.execute(query, [name, description, stock, price]);
    res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get all inventory products
const getProducts = async (req, res) => {
  const query = 'SELECT * FROM inventory_products';

  try {
    const [result] = await db.execute(query);
    res.status(200).json(result);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get a single inventory product by ID
const getProduct = async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM inventory_products WHERE id = ?';

  try {
    const [result] = await db.execute(query, [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update inventory product by ID
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, stock, price } = req.body;
  const query = 'UPDATE inventory_products SET name = ?, description = ?, stock = ?, price = ? WHERE id = ?';

  try {
    const [result] = await db.execute(query, [name, description, stock, price, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete inventory product by ID
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM inventory_products WHERE id = ?';

  try {
    const [result] = await db.execute(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct };
