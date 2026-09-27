# URL Shortener: Backend

This is the Express and MongoDB API for the URL shortener. It turns a long URL into a short link, optionally with a custom alias, and redirects visitors from the short link to the original URL.

```
POST /api/url/shorten   { "originalUrl": "https://github.com/yourname", "customAlias": "my-portfolio" }
→ http://localhost:5000/my-portfolio

GET  /my-portfolio      → 302 redirect to https://github.com/yourname
```

## Features

- Short links with a random 7-character code, e.g. `/aB3xK9p`
- Optional custom alias, e.g. `/my-portfolio`
- Optional expiry date: expired links return `410 Gone`
- Click counter for every link
- Only `http` and `https` URLs are accepted, which blocks `javascript:` and `file:` links

## Tech stack

- Node.js 18 or newer
- Express 5
- MongoDB with Mongoose
- `dotenv` for configuration and `cors` for access from the frontend

## Project structure

```
backend/
├── index.js                 # App entry: middleware, routes, error handler, starts the server
├── connectDB.js             # Connects to MongoDB; exits if the connection fails
├── models/
│   └── urlModels.js         # Url schema
├── controllers/
│   └── urlController.js     # createShortUrl, redirectToOriginal
├── routes/
│   └── urlRoutes.js         # Maps URLs to controller functions
├── .env.example             # Template for the environment variables
└── package.json
```

## Getting started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port the server listens on. Default: `3000` |
| `MONGO_URI` | Yes | MongoDB connection string. Put the database name at the end, e.g. `.../urlshortener` |
| `BASE_URL` | No | Used to build the returned `shortUrl`. Defaults to the host of the incoming request |
| `CLIENT_URL` | No | Frontend origin allowed by CORS. Defaults to all origins |

> `.env` holds your database password and is listed in `.gitignore`. Never commit it.

If you use MongoDB Atlas, add your IP address under **Network Access**, or the connection will fail.

### 3. Run the server

```bash
npm run dev    # restarts automatically when files change
npm start      # plain start
```

When the server is ready, you'll see:

```
MongoDB connected
Server is running on port 5000
```

## API reference

### Create a short URL

`POST /api/url/shorten`

**Request body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `originalUrl` | string | Yes | Must be a valid `http://` or `https://` URL |
| `customAlias` | string | No | 3–30 characters: letters, numbers, `-` or `_`. `api` and `health` are reserved |
| `expirationDate` | string (date) | No | Any date `new Date()` can parse, e.g. `"2026-12-31"`. Must be in the future |

**Example**

```bash
curl -X POST http://localhost:5000/api/url/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://github.com/yourname","customAlias":"my-portfolio"}'
```

**Response `201 Created`**

```json
{
  "id": "6ab7b5389cf04d7aa1a7c00a",
  "originalUrl": "https://github.com/yourname",
  "shortCode": "my-portfolio",
  "shortUrl": "http://localhost:5000/my-portfolio",
  "isCustom": true,
  "clicks": 0,
  "expirationDate": null,
  "createdAt": "2026-09-26T12:06:16.820Z"
}
```

**Errors**

| Status | When | `message` |
|---|---|---|
| 400 | `originalUrl` is missing or invalid | `A valid http(s) originalUrl is required` |
| 400 | `expirationDate` is invalid or in the past | `expirationDate must be a valid future date` |
| 400 | `customAlias` has the wrong length or characters | `customAlias must be 3-30 characters: letters, numbers, "-" or "_"` |
| 400 | `customAlias` is `api` or `health` | `This alias is reserved` |
| 409 | `customAlias` is already used | `This alias is already taken` |

### Open a short URL

`GET /:code`

Redirects (`302`) to the original URL and adds 1 to its click count. Open it in a browser, e.g. `http://localhost:5000/my-portfolio`.

| Status | When |
|---|---|
| 302 | Redirect to `originalUrl` |
| 404 | No link has this code |
| 410 | The link has passed its `expirationDate` |

### Health check

`GET /health` → `{ "status": "ok" }`

## Data model

Collection: `urls`

| Field | Type | Notes |
|---|---|---|
| `shortCode` | String | Unique. Holds the random code or the custom alias |
| `originalUrl` | String | The long URL |
| `isCustom` | Boolean | `true` if the user chose the alias |
| `clicks` | Number | Default `0`. Incremented on every redirect |
| `expirationDate` | Date | Default `null`, which means the link never expires |
| `createdAt`, `updatedAt` | Date | Added automatically by Mongoose |

## How it works

**Random codes and custom aliases share one field.** Both are stored in `shortCode`, so the redirect route needs no special case for custom aliases.

**Random codes** are 7 characters from 62 possible characters (a–z, A–Z, 0–9). That gives about 3.5 trillion combinations. They are generated with `crypto.randomInt`, and the app generates another code in the rare case one is already taken.

**Custom aliases are checked in three steps:**
1. Format check with the regex `^[a-zA-Z0-9_-]{3,30}$`
2. Reserved-word check, which ignores case
3. `Url.exists()` check, to return a clear "already taken" message

The **unique index** on `shortCode` is the final guarantee against duplicates. Two requests for the same alias can arrive at the same moment and both pass step 3. When that happens, MongoDB rejects the second insert with error `11000`, and the API returns `409` instead of crashing.

**Clicks are counted atomically** with `$inc`, so clicks that happen at the same moment are never lost.

**Route order matters.** `GET /:code` matches any single path segment, so it is the last route in `routes/urlRoutes.js`. `/health` is defined in `index.js` before the router is mounted.

## Testing manually

1. Start the server with `npm run dev`.
2. In Postman or Thunder Client, send `POST http://localhost:5000/api/url/shorten` with the JSON body `{ "originalUrl": "https://google.com" }`.
3. Open the returned `shortUrl` in a browser. It should take you to Google.
4. Try the error cases in the table above, for example sending the same `customAlias` twice.

From PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/url/shorten `
  -ContentType "application/json" `
  -Body '{"originalUrl":"https://google.com","customAlias":"my-google"}'
```

## Possible improvements

- User accounts, so each person manages their own links
- Rate limiting on `/shorten`, e.g. with `express-rate-limit`
- A TTL index on `expirationDate`, so MongoDB deletes expired links automatically
- Case-insensitive aliases
- Endpoints to list, view and delete links
- Automated tests with Jest and Supertest
