import request from "supertest";
import app from "../index.js";
import db from "../db.js";
// tests/api.test.js
// ... (imports) ...

beforeAll(async () => {
  // Supprime les données sensibles avant de lancer les tests
  await new Promise((resolve, reject) => {
    // 1. Delete from 'scores' table FIRST
    db.query("DELETE FROM scores", (err) => {
      if (err) {
        console.error("Error deleting from scores:", err); // Add logging for debugging
        return reject(err);
      }
      // 2. Then delete from 'players' table
      db.query("DELETE FROM players", (err2) => {
        if (err2) {
          console.error("Error deleting from players:", err2); // Add logging
          return reject(err2);
        }
        resolve();
      });
    });
  });
});

let token = "";
let userId = "";

describe("API Endpoints Tests", () => {
  const validUser = {
    username: "testuser",
    password: "Password123!",
  };

  // 1. TEST REGISTER
  describe("POST /players/register", () => {
    it("should create a user with valid data", async () => {
      const res = await request(app).post("/players/register").send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toMatch(/créé avec succès/i);
    });

    it("should fail with missing fields", async () => {
      const res = await request(app)
        .post("/players/register")
        .send({ username: "", password: "" });

      expect(res.statusCode).toBe(400);
    });
  });

  // 2. TEST LOGIN
  describe("POST /players/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/players/login")
        .send({ username: validUser.username, password: validUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      token = res.body.token;
      userId = res.body.player.id;
    });

    it("should fail login with wrong password", async () => {
      const res = await request(app)
        .post("/players/login")
        .send({ username: validUser.username, password: "wrongpassword" });

      expect(res.statusCode).toBe(401);
    });

    it("should fail login with missing fields", async () => {
      const res = await request(app)
        .post("/players/login")
        .send({ username: "", password: "" });

      expect(res.statusCode).toBe(400);
    });
  });

  // 3. TEST GET /players/me (Protected)
  describe("GET /players/me", () => {
    it("should return user info with valid token", async () => {
      const res = await request(app)
        .get("/players/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe(validUser.username);
    });

    it("should fail without token", async () => {
      const res = await request(app).get("/players/me");

      expect(res.statusCode).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const res = await request(app)
        .get("/players/me")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.statusCode).toBe(401);
    });
  });

  // 4. TEST /scores/leaderboard routes (example with GET and POST protected)
  describe("Protected /scores/leaderboard routes", () => {
    it("should fail GET /scores/leaderboard without token", async () => {
      const res = await request(app).get("/scores/leaderboard");
      expect(res.statusCode).toBe(401);
    });

    it("should succeed GET /scores/leaderboard with token", async () => {
      const res = await request(app)
        .get("/scores/leaderboard")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should fail POST /scores without token", async () => {
      const res = await request(app)
        .post("/scores")
        .send({ playerId: userId, score: 123 });

      expect(res.statusCode).toBe(401);
    });

    it("should succeed POST /scores with token", async () => {
      const res = await request(app)
        .post("/scores")
        .set("Authorization", `Bearer ${token}`)
        .send({ playerId: userId, score: 123 });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toMatch(/score enregistré/i);
    });
  });

  // 5. TEST SQL INJECTION / XSS
  describe("Security tests", () => {
    it("should not allow SQL injection in email field", async () => {
      const res = await request(app).post("/players/register").send({
        username: "' OR '1'='1",
        password: "Password123!",
      });

      expect([400, 409]).toContain(res.statusCode);
    });

    it("should not allow script tags in username", async () => {
      const res = await request(app).post("/players/register").send({
        username: "<script>alert(1)</script>",
        password: "Password123!",
      });

      expect([201, 400]).toContain(res.statusCode); // Acceptable is to sanitize or reject
    });
  });

  // 6. TEST EDGE CASES
  describe("Edge case tests", () => {
    it("should reject too short password", async () => {
      const res = await request(app).post("/players/register").send({
        username: "shortpass",
        password: "123",
      });
      expect(res.statusCode).toBe(400);
    });

    it("should reject empty body", async () => {
      const res = await request(app).post("/players/register").send({});
      expect(res.statusCode).toBe(400);
    });
  });
});

afterAll(async () => {
  // Ferme proprement la connexion DB après tous les tests
  await new Promise((resolve, reject) => {
    db.end((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
});
