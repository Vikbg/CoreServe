# CoreServe

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Vikbg/CoreServe/nodejs.yml?branch=main)](https://github.com/Vikbg/CoreServe/actions)

CoreServe is a modular Node.js backend starter designed to give REST API projects a clean, maintainable foundation. It ships with authentication, API key protection, score endpoints, caching hooks, and a straightforward MVC-style structure.

## Features

- Modular MVC-inspired architecture
- JWT-based authentication
- API key authorization with plan-based rate limiting
- MariaDB integration through environment variables
- Redis-backed response caching with graceful fallback
- Jest and Supertest coverage for core HTTP flows

## Requirements

- Node.js 18 or newer
- MariaDB or MySQL
- Redis (optional, but recommended for caching)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Vikbg/CoreServe.git
cd CoreServe
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the project root:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=coreserve
DB_NAME_TEST=coreserve_test
JWT_SECRET=replace_this_with_a_secure_secret
JWT_EXPIRES_IN=1h
PORT=3000
HOST=0.0.0.0
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
JSON_LIMIT=10kb
```

4. Start the server:

```bash
pnpm start
```

The API will be available at `http://localhost:3000` unless you configure a different host or port.

## Scripts

```bash
pnpm start
pnpm dev
pnpm test
pnpm lint
```

## Project Structure

```text
CoreServe/
├── config/             # Shared configuration constants
├── controllers/        # Route handlers and application logic
├── docs/               # Project documentation
├── middlewares/        # Authentication, validation, and caching layers
├── models/             # Database access helpers
├── routes/             # Express route definitions
├── tests/              # Integration test suite
├── utils/              # Shared utilities such as logging
├── db.js               # MariaDB connection pool
├── index.js            # App factory and server bootstrap
├── redisClient.js      # Redis connection and cache helpers
└── package.json        # Scripts and dependencies
```

## API Overview

- `POST /players/register`: Create a new user account
- `POST /players/login`: Authenticate and receive a JWT
- `GET /players/me`: Fetch the authenticated user profile
- `GET /scores/leaderboard`: Fetch the global leaderboard
- `POST /scores`: Submit the authenticated user's score
- `GET /scores/:id`: Fetch the authenticated user's score history

See [docs/api.md](docs/api.md) for full request and response examples.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), keep changes focused, and make sure tests pass before opening a pull request.

## Security

If you discover a security issue, follow the reporting guidance in [SECURITY.md](SECURITY.md).

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
