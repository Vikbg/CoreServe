import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const rateLimitMock = jest.fn((options) => {
  let hits = 0;

  return (req, res, next) => {
    hits += 1;

    if (hits > options.max) {
      return options.handler(req, res);
    }

    return next();
  };
});

const queryMock = jest.fn(async () => [
  [{ user_id: 42, plan: "free", banned_until: null }],
]);
const dbQueryMock = jest.fn((_sql, _params, callback) => callback(null));

jest.unstable_mockModule("express-rate-limit", () => ({
  default: rateLimitMock,
}));

jest.unstable_mockModule("../db.js", () => ({
  default: {
    promise: () => ({ query: queryMock }),
    query: dbQueryMock,
  },
}));

jest.unstable_mockModule("../config/rateLimits.js", () => ({
  PLAN_LIMITS: {
    free: { max: 2, windowMs: 60_000 },
  },
}));

const { default: apiKeyMiddleware, limiterCache } = await import(
  "../middlewares/apiKeyAuth.js"
);

describe("apiKeyMiddleware rate limiter caching", () => {
  beforeEach(() => {
    rateLimitMock.mockClear();
    queryMock.mockClear();
    dbQueryMock.mockClear();
    limiterCache.clear();
  });

  it("reuses one limiter per API key and reaches 429 across repeated calls", async () => {
    const app = express();

    app.get("/secure", apiKeyMiddleware, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const first = await request(app).get("/secure").set("x-api-key", "key-123");
    const second = await request(app)
      .get("/secure")
      .set("x-api-key", "key-123");
    const third = await request(app).get("/secure").set("x-api-key", "key-123");

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(third.statusCode).toBe(429);

    expect(rateLimitMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(dbQueryMock).toHaveBeenCalledTimes(1);
  });

  it("keeps independent limiter state for different API keys", async () => {
    const app = express();

    app.get("/secure", apiKeyMiddleware, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const keyOneThird = await request(app)
      .get("/secure")
      .set("x-api-key", "key-1")
      .then(async () => request(app).get("/secure").set("x-api-key", "key-1"))
      .then(async () => request(app).get("/secure").set("x-api-key", "key-1"));

    const keyTwoFirst = await request(app)
      .get("/secure")
      .set("x-api-key", "key-2");

    expect(keyOneThird.statusCode).toBe(429);
    expect(keyTwoFirst.statusCode).toBe(200);
    expect(rateLimitMock).toHaveBeenCalledTimes(2);
  });
});
