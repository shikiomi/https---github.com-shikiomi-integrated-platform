const { db, redisClient, logger, redisLogger } = require('../config/db'); // Import the promisified db and loggers

// Create a new CRM customer
const createCustomer = async (req, res) => {
  const { name, email, phone, address } = req.body;

  // Check if the email already exists
  const checkEmailQuery = 'SELECT * FROM crm_customers WHERE email = ?';

  try {
    // Check if the email already exists in the CRM
    const [existingCustomer] = await db.execute(checkEmailQuery, [email]);
    
    if (existingCustomer.length > 0) {
      return res.status(400).json({ error: 'Email already exists. Please use a different email address.' });
    }

    const query = 'INSERT INTO crm_customers (name, email, phone, address) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(query, [name, email, phone, address]);

    // Log customer creation event to integration.log
    logger.info(`New customer added: ${name} (${email})`);

    // Publish event to Redis and log to redis_events.log
    const event = `New customer added: ${name} (${email})`;
    redisClient.publish('customer_events', event);  // Publish the event to Redis channel
    redisLogger.info(`Support system received event: ${event}`);  // Log the event to redis_events.log

    res.status(201).json({
      message: 'Customer created successfully',
      customerId: result.insertId,
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get all CRM customers
const getCustomers = async (req, res) => {
  const query = 'SELECT * FROM crm_customers';

  try {
    const [result] = await db.execute(query);
    res.status(200).json(result);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get a single CRM customer by ID
const getCustomer = async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM crm_customers WHERE id = ?';

  try {
    const [result] = await db.execute(query, [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update CRM customer by ID
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const query = 'UPDATE crm_customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';

  try {
    const [result] = await db.execute(query, [name, email, phone, address, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete CRM customer by ID
const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM crm_customers WHERE id = ?';

  try {
    const [result] = await db.execute(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Log customer deletion event to integration.log
    logger.info(`Customer deleted: ID ${id}`);

    // Publish event to Redis and log to redis_events.log
    const event = `Customer deleted: ID ${id}`;
    redisClient.publish('customer_events', event);  // Publish the event to Redis channel
    redisLogger.info(`Support system received event: ${event}`);  // Log the event to redis_events.log

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete all CRM customers (resetting customer ID)
const deleteAllCustomers = async (req, res) => {
  const deleteQuery = 'DELETE FROM crm_customers';  // Deletes all customers
  const resetAutoIncrementQuery = 'ALTER TABLE crm_customers AUTO_INCREMENT = 1';  // Resets auto-increment

  try {
    await db.execute(deleteQuery);  // Delete all customers
    await db.execute(resetAutoIncrementQuery);  // Reset auto-increment to 1

    // Log deletion of all customers event
    logger.info('All customers deleted.');

    // Publish event to Redis and log to redis_events.log
    const event = 'All customers deleted.';
    redisClient.publish('customer_events', event);  // Publish the event to Redis channel
    redisLogger.info(`Support system received event: ${event}`);  // Log the event to redis_events.log

    res.status(200).json({ message: 'All customers deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer, deleteAllCustomers };
