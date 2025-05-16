const mysql = require('mysql2');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
  } else {
    console.log(`Connexion à MariaDB réussie sur la base ${isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME}.`);
  }
});

module.exports = db;