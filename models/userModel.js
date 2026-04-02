import db from "../db.js";
import bcrypt from "bcryptjs";

export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db
    .promise()
    .query("INSERT INTO players (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

  return result;
}

export async function authenticateUser(username, password) {
  const [rows] = await db
    .promise()
    .query("SELECT id, username, password FROM players WHERE username = ?", [
      username,
    ]);

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return { id: user.id, username: user.username };
}

export async function getUserById(id) {
  const [rows] = await db
    .promise()
    .query("SELECT id, username FROM players WHERE id = ? LIMIT 1", [id]);

  return rows[0] ?? null;
}

export async function findUserByUsername(username) {
  const [rows] = await db
    .promise()
    .query("SELECT id, username FROM players WHERE username = ? LIMIT 1", [
      username,
    ]);

  return rows[0] ?? null;
}

export async function getUserWithScoreById(id) {
  const [rows] = await db.promise().query(
    `
    SELECT players.id, players.username, scores.score, scores.updated_at
    FROM players
    LEFT JOIN scores ON players.id = scores.player_id
    WHERE players.id = ?
    LIMIT 1
  `,
    [id],
  );

  return rows[0] ?? null;
}
