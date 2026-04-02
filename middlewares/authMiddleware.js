import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { DEFAULT_TEST_JWT_SECRET } from "../config/testDefaults.js";

dotenv.config();

export function authenticateToken(req, res, next) {
  const authHeader = req.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing bearer token." });
  }

  const jwtSecret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "test" ? DEFAULT_TEST_JWT_SECRET : "");

  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT secret is not configured." });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    req.user = user;
    return next();
  });
}

export default authenticateToken;
