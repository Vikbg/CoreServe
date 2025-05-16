const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const cache = require('../middlewares/cache');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken); // Toutes les routes sont protégées

// Soumettre un score
router.post('/', scoreController.submitScore);

// Récupérer les meilleurs scores (classement général)
router.get('/leaderboard', scoreController.getLeaderboard);

// Récupérer tous les scores d’un joueur spécifique
router.get('/:id', scoreController.getPlayerScores);

module.exports = router;