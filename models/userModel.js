const db = require('../db');
const bcrypt = require('bcryptjs');

// Crée un nouveau joueur (avec hash du mot de passe)
function createPlayer(username, password, callback) {
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return callback(err);

    const sql = 'INSERT INTO players (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], callback);
  });
}

// Vérifie le login d’un joueur
function loginPlayer(username, password, callback) {
  const sql = 'SELECT * FROM players WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);

    const player = results[0];
    bcrypt.compare(password, player.password, (err, isMatch) => {
      if (err) return callback(err);
      if (!isMatch) return callback(null, null);
      callback(null, player);
    });
  });
}

// Récupère les infos d’un joueur par son ID
function getPlayerById(id, callback) {
  const sql = 'SELECT id, username FROM players WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

module.exports = {
  createPlayer,
  loginPlayer,
  getPlayerById,
};