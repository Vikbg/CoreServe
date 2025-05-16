// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Token manquant.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide.' });

    req.user = user; // Ajoute l'utilisateur décodé à la requête
    next();
  });
}

module.exports = authenticateToken;