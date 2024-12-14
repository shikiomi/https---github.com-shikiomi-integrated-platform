require('dotenv').config();
const redis = require('redis');
const mysql = require('mysql2');
const fs = require('fs');
const winston = require('winston'); 


const redisClient = redis.createClient({
  url: `redis://localhost:6379`
});


redisClient.on('connect', () => {
  console.log('Connected to Redis');
});


redisClient.connect().catch(err => console.error('Redis connection failed:', err));


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true, 
});


const promiseDb = db.promise();


const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/integration.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});


const redisLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/redis_events.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});


redisClient.on('connect', () => {
  redisLogger.info('Connected to Redis');
});


module.exports = { db: promiseDb, redisClient, logger, redisLogger };
