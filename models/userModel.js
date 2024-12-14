const db = require('../config/db');


const getUserByUsername = (username) => {
  const query = 'SELECT * FROM users WHERE username = ?';
  return db.execute(query, [username]);
};


const createUser = (username, password, role) => {
  const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  return db.execute(query, [username, password, role]);
};


const getUserById = (id) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  return db.execute(query, [id]);
};

module.exports = { getUserByUsername, createUser, getUserById };
