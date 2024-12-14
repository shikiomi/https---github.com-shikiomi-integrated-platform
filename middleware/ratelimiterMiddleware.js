const { redisClient, redisLogger } = require('../config/db'); 
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, 
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res, next) => {
   
    const logMessage = `Rate limit reached for IP: ${req.ip} at ${new Date().toISOString()}`;
    
    redisClient.publish('rate_limit_channel', logMessage); 
    
    
    redisLogger.info(logMessage);

    
    res.status(429).json({ error: logMessage });
  }
});

module.exports = rateLimiter;
