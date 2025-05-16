// controllers/authController.js
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper to wrap a callback-style model method into a promise
function toPromise(fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args, (err, result) => { //ligne 10
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Inscription
async function register(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Champs manquants.' });
  }

  try {
    // 1) Vérifier qu’aucun user n’existe avec cet email
    const existing = await toPromise(userModel.findByEmail, email);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé.' });
    }

    // 2) Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3) Créer l’utilisateur
    await toPromise(userModel.create, username, email, hashedPassword);

    return res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// Connexion
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Champs manquants.' });
  }

  try {
    // 1) Récupérer l’utilisateur
    const users = await toPromise(userModel.findByEmail, email);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }
    const user = users[0];

    // 2) Vérifier le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    // 3) Générer un JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      player: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// controllers/authController.js

async function getMe(req, res) {
  try {
    // Le middleware authenticateToken a déjà ajouté req.user avec les infos décodées du JWT
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    // Optionnel : récupérer les infos utilisateur depuis la base de données pour avoir les données à jour
    const users = await toPromise(userModel.findById, req.user.id);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    const user = users[0];

    // Ne renvoyer que les infos utiles (sans le mot de passe)
    const { id, username, email } = user;

    return res.status(200).json({ user: { id, username, email } });
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