# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, report it responsibly by emailing:

`viktorserhiienko12@gmail.com`

Please include enough detail to reproduce the issue safely. Reports are reviewed as quickly as possible, and valid issues will be handled privately before public disclosure.

## Supported Versions

Security fixes are applied to the latest maintained version of the project. If you are running an older revision, upgrade before requesting support.

## Secure Usage

- Set a strong `JWT_SECRET`.
- Use HTTPS in any deployed environment.
- Rotate API keys when you suspect exposure.
- Restrict `CORS_ORIGIN` to trusted frontends.
- Keep MariaDB, Redis, and Node.js updated with current security patches.
