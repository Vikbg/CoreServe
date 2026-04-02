# API Reference

All endpoints return JSON. Unless noted otherwise, protected routes require both:

- `x-api-key: <your-api-key>`
- `Authorization: Bearer <jwt>`

## Authentication

### `POST /players/register`

Create a user account.

Request body:

```json
{
  "username": "player_one",
  "password": "Password123!"
}
```

Successful response:

```json
{
  "message": "User created successfully."
}
```

### `POST /players/login`

Authenticate a user and return a token.

Request body:

```json
{
  "username": "player_one",
  "password": "Password123!"
}
```

Successful response:

```json
{
  "message": "Login successful.",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "username": "player_one"
  }
}
```

### `GET /players/me`

Return the authenticated user's profile and current score.

## Scores

### `POST /scores`

Submit a score for the authenticated user.

Request body:

```json
{
  "score": 123
}
```

Possible successful responses:

```json
{
  "message": "Score recorded successfully."
}
```

```json
{
  "message": "New personal best recorded."
}
```

```json
{
  "message": "Score was not higher than the current record."
}
```

### `GET /scores/leaderboard`

Return the top scores. Optional query string:

- `limit`: integer between `1` and `100`

### `GET /scores/:id`

Return the authenticated user's score history. Requests for another user's ID are rejected with `403`.
