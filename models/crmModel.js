const db = require('../config/db');

// Get all CRM customers
const getAllCustomers = () => {
  const query = 'SELECT * FROM crm_customers';
  return db.execute(query);
};

// Get a customer by ID
const getCustomerById = (id) => {
  const query = 'SELECT * FROM crm_customers WHERE id = ?';
  return db.execute(query, [id]);
};

// Create a new CRM customer
const createCustomer = (name, email, phone, address) => {
  const query = 'INSERT INTO crm_customers (name, email, phone, address) VALUES (?, ?, ?, ?)';
  return db.execute(query, [name, email, phone, address]);
};

// Update CRM customer by ID
const updateCustomer = (id, name, email, phone, address) => {
  const query = 'UPDATE crm_customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';
  return db.execute(query, [name, email, phone, address, id]);
};

// Delete CRM customer by ID
const deleteCustomer = (id) => {
  const query = 'DELETE FROM crm_customers WHERE id = ?';
  return db.execute(query, [id]);
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
