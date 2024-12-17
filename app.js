const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const path = require('path');
const apiLimiter = require('./middleware/ratelimiterMiddleware');  // Import rate limiter

// Initialize dotenv
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());


// Apply rate limiting to all routes
app.use(apiLimiter);  // This will apply rate limiting globally

// Import routes
const authRoutes = require('./routes/authRoutes');
const crmRoutes = require('./routes/crmRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const supportRoutes = require('./routes/supportRoutes');
const orderRoutes = require('./routes/orderRoutes');




// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/support', supportRoutes);
app.use('/api', orderRoutes);

// SSL options
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.cert'))
};

// Start server with HTTPS
https.createServer(sslOptions, app).listen(3000, () => {
  console.log('Server is running on https://localhost:3000');
});
