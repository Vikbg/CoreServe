import db from "../db.js";
import bcrypt from "bcryptjs";

// Crée un nouveau joueur (hash le mot de passe)
export function createPlayer(username, password, callback) {
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return callback(err);

    const sql = "INSERT INTO players (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], callback);
  });
}

// Vérifie le login d’un joueur
export function loginPlayer(username, password, callback) {
  const sql = "SELECT * FROM players WHERE username = ?";
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
export function getPlayerById(id, callback) {
  const sql = "SELECT id, username FROM players WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Trouve un joueur par username (utile pour vérifier doublon inscription)
export function findUserByUsername(username, callback) {
  const sql = "SELECT * FROM players WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0]);
  });
}
