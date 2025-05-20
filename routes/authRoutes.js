import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import {
  registerValidator,
  loginValidator,
} from "../middlewares/validators/authValidator.js";
import { validationResult } from "express-validator";
import authenticateToken from "../middlewares/authMiddleware.js";
import apiKeyMiddleware from "../middlewares/apiKeyAuth.js";

const router = express.Router();
router.use(apiKeyMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authenticateToken, getMe);

export default router;
