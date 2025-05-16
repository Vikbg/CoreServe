// controllers/authController.js
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

function toPromise(fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Inscription
async function register(req, res) {
  // Validation des champs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Vérifie si username existe déjà (créons une fonction findUserByUsername dans userModel)
    const existingUser = await toPromise(userModel.findUserByUsername, username);
    if (existingUser) {
      return res.status(409).json({ message: 'Nom d’utilisateur déjà utilisé.' });
    }

    // Crée l’utilisateur (hash inside createPlayer)
    await toPromise(userModel.createPlayer, username, password);

    return res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// Connexion
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await toPromise(userModel.loginPlayer, username, password);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      player: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// Récupérer infos joueur connecté
async function getMe(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    const user = await toPromise(userModel.getPlayerById, req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
};