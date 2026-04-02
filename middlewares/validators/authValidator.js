import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .isString()
    .withMessage("Username must be a string.")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username may only contain letters, numbers, and underscores.",
    ),

  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters."),
];

export const loginValidator = [
  body("username")
    .isString()
    .withMessage("Username must be a string.")
    .trim()
    .notEmpty()
    .withMessage("Username is required."),
  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .notEmpty()
    .withMessage("Password is required."),
];
