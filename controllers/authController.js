// controllers/authController.js
import {
  findUserByUsername,
  createPlayer,
  loginPlayer,
  getPlayerById,
} from "../models/userModel.js";
import { log } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import dotenv from "dotenv";
dotenv.config();

function toPromise(fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Inscription
export async function register(req, res) {
  // Validation des champs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Vérifie si username existe déjà
    const existingUser = await toPromise(findUserByUsername, username);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Nom d’utilisateur déjà utilisé." });
    }

    // Crée l’utilisateur (hash inside createPlayer)
    await toPromise(createPlayer, username, password);

    return res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

// Connexion
export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await toPromise(loginPlayer, username, password);
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );

    return res.status(200).json({
      message: "Connexion réussie.",
      token,
      player: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

// Récupérer infos joueur connecté
export async function getMe(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const user = await toPromise(getPlayerById, req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    return res.status(200).json(user);
  } catch (err) {
    log.error("GetMe error:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}
