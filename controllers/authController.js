const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db'); 

// User registration
const register = async (req, res) => {
  const { username, password, role, name, email, phone, address } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role.toLowerCase(); // Normalize role to handle case-insensitivity

    // Insert user into the users table
    await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, normalizedRole]
    );

    // If role is 'customer', insert the user into the CRM customers table
    if (normalizedRole === 'customer') {
      const checkEmailQuery = 'SELECT * FROM crm_customers WHERE email = ?';
      const [existingCustomer] = await db.execute(checkEmailQuery, [email]);

      if (existingCustomer.length > 0) {
        return res.status(400).json({ error: 'Email already exists in CRM. Please use a different email.' });
      }

      const insertCustomerQuery =
        'INSERT INTO crm_customers (name, email, phone, address) VALUES (?, ?, ?, ?)';
      const [result] = await db.execute(insertCustomerQuery, [name, email, phone, address]);

      // Optionally log or publish event
      console.log(`Customer created with ID: ${result.insertId}`);
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// User login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [result] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { register, login };