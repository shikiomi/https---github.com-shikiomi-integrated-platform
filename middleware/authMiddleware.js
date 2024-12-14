const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded user data to request
    console.log('Authenticated user:', decoded); // Debug log
    next();
  } catch (error) {
    console.error('Token authentication failed:', error.message);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
