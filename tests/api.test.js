import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import {
  DEFAULT_TEST_API_KEY,
  DEFAULT_TEST_JWT_SECRET,
} from "../config/testDefaults.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || DEFAULT_TEST_JWT_SECRET;
process.env.TEST_API_KEY = process.env.TEST_API_KEY || DEFAULT_TEST_API_KEY;

const mockUserModel = {
  authenticateUser: jest.fn(),
  createUser: jest.fn(),
  findUserByUsername: jest.fn(),
  getUserWithScoreById: jest.fn(),
};

const mockScoreModel = {
  saveUserScore: jest.fn(),
  getTopScores: jest.fn(),
  getScoresByUser: jest.fn(),
};

const mockCacheStore = new Map();
const mockDbQuery = jest.fn();

jest.unstable_mockModule("../models/userModel.js", () => mockUserModel);
jest.unstable_mockModule("../models/scoreModel.js", () => mockScoreModel);
jest.unstable_mockModule("../db.js", () => ({
  default: {
    promise() {
      return {
        query: mockDbQuery,
      };
    },
  },
}));
jest.unstable_mockModule("../redisClient.js", () => ({
  connectRedis: async () => null,
  isRedisReady: () => false,
  getCacheValue: jest.fn(async (key) => mockCacheStore.get(key) ?? null),
  setCacheValue: jest.fn(async (key, _ttlSeconds, value) => {
    mockCacheStore.set(key, value);
  }),
  deleteCacheKey: jest.fn(async (key) => {
    mockCacheStore.delete(key);
  }),
  deleteCacheByPrefix: jest.fn(async (prefix) => {
    for (const key of [...mockCacheStore.keys()]) {
      if (key.startsWith(prefix)) {
        mockCacheStore.delete(key);
      }
    }
  }),
  default: {},
}));

const { register, login, getCurrentUser } = await import(
  "../controllers/authController.js"
);
const { submitScore, getLeaderboard, getUserScores } = await import(
  "../controllers/scoreController.js"
);
const { authenticateToken } = await import("../middlewares/authMiddleware.js");
const { default: apiKeyMiddleware } = await import(
  "../middlewares/apiKeyAuth.js"
);
const { buildCacheKey, cache } = await import("../middlewares/cache.js");
const { registerValidator, loginValidator } = await import(
  "../middlewares/validators/authValidator.js"
);

function createResponse() {
  return {
    body: undefined,
    headers: {},
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
  };
}

function createRequest(overrides = {}) {
  const headers = Object.fromEntries(
    Object.entries(overrides.headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  );

  return {
    body: {},
    headers,
    method: "GET",
    originalUrl: "/resource",
    params: {},
    query: {},
    user: undefined,
    get(name) {
      return this.headers[name.toLowerCase()];
    },
    ...overrides,
    headers,
  };
}

async function runValidators(validators, req) {
  for (const validator of validators) {
    await validator.run(req);
  }

  return validationResult(req);
}

describe("Auth controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a user when the username is available", async () => {
    mockUserModel.findUserByUsername.mockResolvedValue(null);
    mockUserModel.createUser.mockResolvedValue({ insertId: 1 });

    const req = createRequest({
      body: { username: "testuser", password: "Password123!" },
    });
    const res = createResponse();

    await register(req, res);

    expect(mockUserModel.createUser).toHaveBeenCalledWith(
      "testuser",
      "Password123!",
    );
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created successfully.");
  });

  it("rejects duplicate usernames during registration", async () => {
    mockUserModel.findUserByUsername.mockResolvedValue({ id: 1 });

    const req = createRequest({
      body: { username: "testuser", password: "Password123!" },
    });
    const res = createResponse();

    await register(req, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Username is already in use.");
  });

  it("returns a token and user payload on login", async () => {
    mockUserModel.authenticateUser.mockResolvedValue({
      id: 7,
      username: "testuser",
    });

    const req = createRequest({
      body: { username: "testuser", password: "Password123!" },
    });
    const res = createResponse();

    await login(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toEqual({ id: 7, username: "testuser" });
  });

  it("returns the authenticated user's profile", async () => {
    mockUserModel.getUserWithScoreById.mockResolvedValue({
      id: 7,
      username: "testuser",
      score: 123,
    });

    const req = createRequest({ user: { id: 7 } });
    const res = createResponse();

    await getCurrentUser(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("testuser");
  });
});

describe("Score controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheStore.clear();
  });

  it("rejects score submission for another player", async () => {
    const req = createRequest({
      body: { playerId: 2, score: 50 },
      user: { id: 1 },
    });
    const res = createResponse();

    await submitScore(req, res);

    expect(res.statusCode).toBe(403);
  });

  it("records a new score for the authenticated user", async () => {
    mockScoreModel.saveUserScore.mockResolvedValue("created");

    const req = createRequest({
      body: { score: 50 },
      user: { id: 1 },
    });
    const res = createResponse();

    await submitScore(req, res);

    expect(mockScoreModel.saveUserScore).toHaveBeenCalledWith(1, 50);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Score recorded successfully.");
  });

  it("clamps leaderboard queries to the configured upper bound", async () => {
    mockScoreModel.getTopScores.mockResolvedValue([]);

    const req = createRequest({ query: { limit: "500" } });
    const res = createResponse();

    await getLeaderboard(req, res);

    expect(mockScoreModel.getTopScores).toHaveBeenCalledWith(100);
    expect(res.statusCode).toBe(200);
  });

  it("rejects access to another user's score history", async () => {
    const req = createRequest({
      params: { id: "2" },
      user: { id: 1 },
    });
    const res = createResponse();

    await getUserScores(req, res);

    expect(res.statusCode).toBe(403);
  });
});

describe("Middlewares", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheStore.clear();
  });

  it("authenticates a valid bearer token", () => {
    const token = jwt.sign({ id: 5 }, DEFAULT_TEST_JWT_SECRET);
    const req = createRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(5);
  });

  it("accepts the configured test API key", async () => {
    const req = createRequest({
      headers: { "x-api-key": DEFAULT_TEST_API_KEY },
    });
    const res = createResponse();
    const next = jest.fn();

    await apiKeyMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.apiPlan).toBe("admin");
    expect(res.headers["RateLimit-Limit"]).toBe("10000");
  });

  it("rejects an invalid API key", async () => {
    mockDbQuery.mockResolvedValue([[], undefined]);

    const req = createRequest({
      headers: { "x-api-key": "invalid-key" },
    });
    const res = createResponse();
    const next = jest.fn();

    await apiKeyMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it("returns cached responses for GET requests", async () => {
    const payload = { ok: true };
    const req = createRequest({
      method: "GET",
      originalUrl: "/scores/leaderboard?limit=10",
    });
    const res = createResponse();
    const next = jest.fn();

    mockCacheStore.set(buildCacheKey(req), JSON.stringify(payload));

    await cache(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.body).toEqual(payload);
  });
});

describe("Validation rules", () => {
  it("rejects invalid registration payloads", async () => {
    const req = createRequest({
      body: { username: "<script>", password: "short" },
    });

    const errors = await runValidators(registerValidator, req);

    expect(errors.isEmpty()).toBe(false);
  });

  it("accepts valid login payloads", async () => {
    const req = createRequest({
      body: { username: "testuser", password: "Password123!" },
    });

    const errors = await runValidators(loginValidator, req);

    expect(errors.isEmpty()).toBe(true);
  });
});
