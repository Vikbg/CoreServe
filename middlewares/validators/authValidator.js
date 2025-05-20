import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Le nom d’utilisateur est requis.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 caractères.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Uniquement lettres, chiffres et underscores."),

  body("password")
    .notEmpty()
    .withMessage("Mot de passe requis.")
    .isLength({ min: 6 })
    .withMessage("Minimum 6 caractères."),
];

export const loginValidator = [
  body("username").notEmpty().withMessage("Nom d’utilisateur requis."),
  body("password").notEmpty().withMessage("Mot de passe requis."),
];
