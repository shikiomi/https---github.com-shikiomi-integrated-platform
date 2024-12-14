const db = require('../config/db');

// Get all inventory products
const getAllProducts = () => {
  const query = 'SELECT * FROM inventory_products';
  return db.execute(query);
};

// Get a product by ID
const getProductById = (id) => {
  const query = 'SELECT * FROM inventory_products WHERE id = ?';
  return db.execute(query, [id]);
};

// Create a new product
const createProduct = (name, description, stock, price) => {
  const query = 'INSERT INTO inventory_products (name, description, stock, price) VALUES (?, ?, ?, ?)';
  return db.execute(query, [name, description, stock, price]);
};

// Update inventory product by ID
const updateProduct = (id, name, description, stock, price) => {
  const query = 'UPDATE inventory_products SET name = ?, description = ?, stock = ?, price = ? WHERE id = ?';
  return db.execute(query, [name, description, stock, price, id]);
};

// Delete inventory product by ID
const deleteProduct = (id) => {
  const query = 'DELETE FROM inventory_products WHERE id = ?';
  return db.execute(query, [id]);
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
