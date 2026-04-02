import db from "../db.js";

export async function saveUserScore(userId, score) {
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      "SELECT score FROM scores WHERE player_id = ? LIMIT 1 FOR UPDATE",
      [userId],
    );

    if (existingRows.length === 0) {
      await connection.query(
        "INSERT INTO scores (player_id, score) VALUES (?, ?)",
        [userId, score],
      );
      await connection.commit();
      return "created";
    }

    const currentBestScore = Number(existingRows[0].score);
    if (score <= currentBestScore) {
      await connection.commit();
      return "unchanged";
    }

    await connection.query(
      "UPDATE scores SET score = ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?",
      [score, userId],
    );

    await connection.commit();
    return "updated";
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getTopScores(limit = 10) {
  const [rows] = await db.promise().query(
    `
    SELECT players.id AS playerId, players.username, scores.score, scores.updated_at
    FROM scores
    INNER JOIN players ON scores.player_id = players.id
    ORDER BY scores.score DESC, scores.updated_at ASC
    LIMIT ?
  `,
    [limit],
  );

  return rows;
}

export async function getScoresByUser(userId) {
  const [rows] = await db.promise().query(
    `
    SELECT players.id AS playerId, players.username, scores.score, scores.created_at, scores.updated_at
    FROM scores
    INNER JOIN players ON scores.player_id = players.id
    WHERE scores.player_id = ?
    ORDER BY scores.updated_at DESC, scores.created_at DESC
  `,
    [userId],
  );

  return rows;
}
