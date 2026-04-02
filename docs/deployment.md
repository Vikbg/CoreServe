# Deployment Guide

## Environment Variables

Configure these values before deploying:

```dotenv
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=1h
PORT=3000
HOST=0.0.0.0
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://your-frontend.example
JSON_LIMIT=10kb
```

## Recommended Production Setup

- Run the app behind a reverse proxy such as Nginx or Caddy.
- Terminate TLS at the proxy and forward traffic over a private network.
- Use a managed MariaDB/MySQL instance or a secured private database host.
- Keep Redis on a private network if you enable caching.
- Store secrets in your hosting platform's secret manager instead of committing them.

## Startup

Install dependencies and launch the service:

```bash
pnpm install --frozen-lockfile
pnpm start
```

## Operational Notes

- Use a process manager such as `systemd`, PM2, Docker, or your platform's native supervisor.
- Monitor HTTP error rates and Redis availability.
- Rotate JWT secrets and API keys during incident response.
