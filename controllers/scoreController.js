const scoreModel = require('../models/scoreModel');

// Enregistrer un score pour un joueur
function submitScore(req, res) {
  const { playerId, score } = req.body;

  if (!playerId || typeof score !== 'number') {
    return res.status(400).json({ message: 'Requête invalide.' });
  }

  scoreModel.saveScore(playerId, score, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de l’enregistrement du score.' });
    }

    res.status(201).json({ message: 'Score enregistré avec succès.' });
  });
}

// Récupérer les meilleurs scores (leaderboard)
function getLeaderboard(req, res) {
  const limit = parseInt(req.query.limit) || 10;

  scoreModel.getTopScores(limit, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération du classement.' });
    }

    res.status(200).json(results);
  });
}

// Récupérer les scores d’un joueur
function getPlayerScores(req, res) {
  const playerId = req.params.id;

  scoreModel.getScoresByPlayer(playerId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des scores.' });
    }

    res.status(200).json(results);
  });
}

module.exports = {
  submitScore,
  getLeaderboard,
  getPlayerScores,
};