const db = require('../config/db');

// Get all support tickets
const getAllTickets = () => {
  const query = 'SELECT * FROM support_tickets';
  return db.execute(query);
};

// Get a support ticket by ID
const getTicketById = (id) => {
  const query = 'SELECT * FROM support_tickets WHERE id = ?';
  return db.execute(query, [id]);
};

// Create a new support ticket
const createTicket = (customer_id, subject, description) => {
  const query = 'INSERT INTO support_tickets (customer_id, subject, description) VALUES (?, ?, ?)';
  return db.execute(query, [customer_id, subject, description]);
};

// Update support ticket by ID
const updateTicket = (id, status) => {
  const query = 'UPDATE support_tickets SET status = ? WHERE id = ?';
  return db.execute(query, [status, id]);
};

// Delete support ticket by ID
const deleteTicket = (id) => {
  const query = 'DELETE FROM support_tickets WHERE id = ?';
  return db.execute(query, [id]);
};

module.exports = { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket };