# Body Works API

Body Works API is a TypeScript + Express backend for fitness data and personalized user features.

It provides:

- Exercise and routine discovery
- Category metadata (body parts, target muscles, equipments)
- JWT authentication with refresh-token rotation
- User profile/settings management
- User body stats logging with pagination

## Tech Stack

- Framework: Express.js + TypeScript
- Database: MongoDB (Prisma ORM)
- Auth: JWT (access token + refresh token via HTTP-only cookie)
- Validation: Zod
- Security and DX: Helmet, CORS, rate limiting, Winston logger

## Base URLs

- Production API: `https://api.bodyworks.akshatjaiswal.me/api/v1`
- Local API (default): `http://localhost:8000/api/v1`

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in project root:

```env
NODE_ENV=development
PORT=8000
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run the server

```bash
npm run dev
```

Server starts on `http://localhost:8000` by default.

## NPM Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build TypeScript to `dist/`
- `npm run start` - Start production build from `dist/server.js`
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix lint issues
- `npm run typecheck` - TypeScript type check
- `npm run format:check` - Prettier check
- `npm run format:write` - Prettier write

## Health and Root Endpoints

- `GET /health` - Service health check with timestamp
- `GET /` - API welcome metadata

## Authentication Model

Protected endpoints require:

```http
Authorization: Bearer <access_token>
```

Refresh flow details:

- Refresh token is stored in HTTP-only cookie: `refreshToken`
- Cookie path: `/api/v1/auth`
- Rotation enabled: each refresh call invalidates previous refresh token
- On suspicious refresh-token reuse, all user sessions are revoked

## API Reference

All endpoints below are prefixed with `/api/v1`.

### Auth

#### `POST /auth/register`

Register a new user.

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+919876543210",
  "password": "strongpassword"
}
```

Validation notes:

- `name`: 2 to 50 chars
- `email`: valid email
- `phone_number`: valid phone number
- `password`: 8 to 16 chars

Success response (201):

```json
{
  "data": {
    "id": "<user-id>",
    "name": "John Doe",
    "email": "john@example.com",
    "accessToken": "<jwt-access-token>"
  },
  "message": "user created successfully."
}
```

#### `POST /auth/login`

Login an existing user.

Request body:

```json
{
  "email": "john@example.com",
  "password": "strongpassword"
}
```

Success response (200):

```json
{
  "data": {
    "id": "<user-id>",
    "name": "John Doe",
    "email": "john@example.com",
    "accessToken": "<jwt-access-token>"
  }
}
```

Also sets HTTP-only `refreshToken` cookie.

#### `POST /auth/refresh-token`

Issue a new access token using refresh token cookie.

Success response (200):

```json
{
  "id": "<user-id>",
  "accessToken": "<jwt-access-token>"
}
```

Also rotates and resets `refreshToken` cookie.

#### `POST /auth/logout`

Logout current refresh-token session.

Success response (200):

```json
{
  "message": "Logged out successfully."
}
```

### Exercises

#### `GET /exercises` (Authenticated)

Get paginated exercises with optional filters.

Query params:

- `page` (default: `1`)
- `limit` (default: `10`)
- `bodyPart`
- `equipment`
- `target`
- `search` (matches multiple fields like name/title/target/muscles/bodyPart/equipment/blog/keywords)

Success response (200):

```json
{
  "totalExercises": 170,
  "totalPages": 17,
  "count": 10,
  "page": 1,
  "limit": 10,
  "data": []
}
```

#### `GET /exercises/:id`

Get a single exercise by ID (supports numeric value like `1`, internally padded to `0001`).

Success response (200):

```json
{
  "data": {}
}
```

### Routines

#### `GET /routines`

Get paginated routines with optional filters.

Query params:

- `page` (default: `1`)
- `limit` (default: `10`)
- `goal`
- `type`
- `level`
- `duration`
- `days_per_week`
- `time`
- `equipment`
- `gender`
- `category`
- `search`

Success response (200):

```json
{
  "totalRoutines": 120,
  "totalPages": 12,
  "count": 10,
  "offset": 0,
  "limit": 10,
  "data": []
}
```

#### `GET /routines/:id`

Get routine by numeric routine ID.

Success response (200):

```json
{
  "data": {}
}
```

#### `GET /routines/filters`

Get available values for a specific routine filter.

Query params:

- `filter` (required)
- Allowed values: `category`, `days_per_week`, `duration`, `equipment`, `gender`, `level`, `main_goal`, `workout_type`

Success response (200) example:

```json
{
  "totalRoutinesFilter": 8,
  "count": 8,
  "data": {
    "level": []
  }
}
```

### Category Metadata

Common query params for all category endpoints:

- `limit` (default: `10`)
- `offset` (default: `0`)

#### `GET /bodyParts`

Success response (200):

```json
{
  "totalBodyParts": 10,
  "count": 10,
  "offset": 0,
  "limit": 10,
  "data": []
}
```

#### `GET /equipments`

Success response (200):

```json
{
  "totalEquipments": 20,
  "count": 10,
  "offset": 0,
  "limit": 10,
  "data": []
}
```

#### `GET /targetMuscles`

Success response (200):

```json
{
  "totalTargetMuscles": 15,
  "count": 10,
  "offset": 0,
  "limit": 10,
  "data": []
}
```

### Users (Authenticated)

#### `GET /users/me`

Get current authenticated user profile, settings, and metadata.

#### `PATCH /users/me/profile`

Update user profile fields.

Request body (all fields optional, but at least one required):

```json
{
  "heightCm": 180,
  "goal": "muscle_gain",
  "experienceLevel": "intermediate",
  "gender": "male",
  "dateOfBirth": "1995-01-01T00:00:00.000Z"
}
```

Accepted enum values:

- `goal`: `fat_loss`, `muscle_gain`, `strength`, `general_fitness`
- `experienceLevel`: `beginner`, `intermediate`, `advanced`
- `gender`: `male`, `female`, `other`

#### `PATCH /users/me/settings`

Update user settings.

Request body (at least one required):

```json
{
  "unitPreference": "metric"
}
```

Accepted enum values:

- `unitPreference`: `metric`, `imperial`

#### `POST /users/me/stats`

Create a body stats log entry.

Request body:

```json
{
  "weightKg": 75.5,
  "bodyFatPct": 15.2,
  "loggedAt": "2024-03-20T10:00:00.000Z"
}
```

Validation notes:

- `weightKg` required and must be `> 0`
- `bodyFatPct` optional, range `0-100`
- `loggedAt` optional ISO datetime

#### `GET /users/me/stats`

Get paginated body stats history for current user.

Query params:

- `page` (default: `1`)
- `limit` (default: `20`, min `1`, max `100`)

Success response (200):

```json
{
  "data": [],
  "count": 20,
  "total": 65,
  "totalPages": 4,
  "page": 1,
  "limit": 20
}
```

## HTTP Status Codes

Common status codes returned by the API:

- `200` Success
- `201` Resource created
- `400` Validation/client error
- `401` Missing auth credentials
- `403` Invalid/expired token
- `404` Resource not found
- `409` Conflict (for example, user already exists)
- `500` Server error
