const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db'); 

// User registration
const register = async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
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
      console.log('No user found');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    
    console.log(`Comparing password: ${password} with hashed password: ${user.password}`);
    console.log(`Password match: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { register, login };
