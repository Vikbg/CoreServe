const mysql = require('mysql2');
require('dotenv').config();

// Crée une connexion MySQL avec les infos dans le fichier .env
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'triangle_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Essaie de se connecter à la base
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('Connexion à MariaDB réussie.');
  }
});

module.exports = db;