import {
  authenticateUser,
  createUser,
  findUserByUsername,
  getUserWithScoreById,
} from "../models/userModel.js";
import { log } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { DEFAULT_TEST_JWT_SECRET } from "../config/testDefaults.js";

dotenv.config();

function createJwtToken(user) {
  const jwtSecret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "test" ? DEFAULT_TEST_JWT_SECRET : "");

  if (!jwtSecret) {
    throw new Error("JWT secret is not configured.");
  }

  return jwt.sign({ id: user.id, username: user.username }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}

export async function register(req, res) {
  const { username, password } = req.body;

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username is already in use." });
    }

    await createUser(username, password);

    return res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    log.error(`Registration error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createJwtToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user,
    });
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function getCurrentUser(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthenticated user." });
    }

    const user = await getUserWithScoreById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    log.error(`Failed to load authenticated user: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
}
