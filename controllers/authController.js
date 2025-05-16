const playerModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

// Inscription
async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Champs manquants.' });
  }

  try {
    playerModel.findByEmail(email, async (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
      if (results.length > 0) {
        return res.status(409).json({ message: 'Email déjà utilisé.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      playerModel.create(username, email, hashedPassword, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

function getMe(req, res) {
  const { id, username, email } = req.user;
  res.status(200).json({ id, username, email });
}

// Connexion
function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Champs manquants.' });
  }

  playerModel.findByEmail(email, async (err, users) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    if (users.length === 0) return res.status(401).json({ message: 'Identifiants invalides.' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Identifiants invalides.' });

    const token = generateToken(user);

    res.status(200).json({
      message: 'Connexion réussie.',
      token,
      player: { id: user.id, username: user.username, email: user.email },
    });
  });
}

module.exports = {
  register,
  login,
  getMe
};