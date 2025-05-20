import db from "../db.js";

// Enregistre un nouveau score pour un joueur
export function saveScore(playerId, score, callback) {
  const sql = "INSERT INTO scores (player_id, score) VALUES (?, ?)";
  db.query(sql, [playerId, score], callback);
}

// Récupère les meilleurs scores (classement global)
export function getTopScores(limit = 10, callback) {
  const sql = `
    SELECT players.username, scores.score, scores.created_at
    FROM scores
    JOIN players ON scores.player_id = players.id
    ORDER BY scores.score DESC
    LIMIT ?
  `;
  db.query(sql, [limit], callback);
}

// Récupère tous les scores d’un joueur donné
export function getScoresByPlayer(playerId, callback) {
  const sql = `
    SELECT score, created_at
    FROM scores
    WHERE player_id = ?
    ORDER BY created_at DESC
  `;
  db.query(sql, [playerId], callback);
}
