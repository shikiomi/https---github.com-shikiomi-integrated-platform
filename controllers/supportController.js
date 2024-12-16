const { db } = require('../config/db');  


const createTicket = async (req, res) => {
  const { customer_id, subject, description } = req.body;
  const query = 'INSERT INTO support_tickets (customer_id, subject, description) VALUES (?, ?, ?)';

  try {
    const [result] = await db.execute(query, [customer_id, subject, description]);  
    res.status(201).json({ message: 'Ticket created successfully', ticketId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


const getTickets = async (req, res) => {
  const query = 'SELECT * FROM support_tickets';

  try {
    const [result] = await db.execute(query);  
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


const getTicket = async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM support_tickets WHERE id = ?';

  try {
    const [result] = await db.execute(query, [id]);  
    if (result.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


const updateTicket = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;


  const validStatuses = ['open', 'closed'];  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Allowed values are "open" or "closed".' });
  }

  const query = 'UPDATE support_tickets SET status = ? WHERE id = ?';

  try {
    const [result] = await db.execute(query, [status, id]);  
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(200).json({ message: 'Ticket updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


const deleteTicket = async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM support_tickets WHERE id = ?';

  try {
    const [result] = await db.execute(query, [id]);  
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


module.exports = { 
    createTicket, 
    getTickets, 
    getTicket, 
    updateTicket, 
    deleteTicket
};