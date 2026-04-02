# CoreServe Architecture

## Overview

CoreServe uses a modular Express architecture inspired by MVC separation:

- `routes/` maps HTTP endpoints to handlers.
- `controllers/` contains request orchestration and response shaping.
- `models/` owns database reads and writes.
- `middlewares/` handles cross-cutting concerns such as authentication, API key enforcement, validation, and caching.
- `utils/` contains reusable support code such as logging.

## Request Flow

1. A request enters the Express app through `index.js`.
2. Global middleware applies security headers, CORS rules, and JSON parsing.
3. Route modules attach endpoint-specific middleware.
4. Controllers validate assumptions, call model functions, and return JSON responses.
5. Models interact with MariaDB through the shared connection pool in `db.js`.
6. Cache reads and writes are routed through `redisClient.js` when Redis is available.

## Data Layer

- `db.js` exports a MariaDB connection pool for concurrent access.
- `models/userModel.js` manages user creation, lookup, and authentication helpers.
- `models/scoreModel.js` manages leaderboard and per-user score persistence.

## Security Layers

- `middlewares/apiKeyAuth.js` validates API keys, applies plan-based rate limits, and rejects temporarily banned keys.
- `middlewares/authMiddleware.js` verifies JWT bearer tokens.
- `middlewares/validators/authValidator.js` validates registration and login payloads.
- `helmet` and `cors` are configured at application startup.

## Runtime Behavior

- `index.js` exports the Express app for tests and starts the HTTP server only when the file is executed directly.
- `redisClient.js` degrades gracefully when Redis is unavailable, so the API can still serve traffic without cached responses.
