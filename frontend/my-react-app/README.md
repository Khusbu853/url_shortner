# URL Shortener: Frontend

This is the React (Vite) frontend for the URL shortener. It talks to the Express API in [`../../backend`](../../backend).

## Features

- Shorten any `http`/`https` URL
- Optional custom alias, e.g. `localhost:5000/my-portfolio`
- Optional expiry date
- One-click copy of the short link
- Recent links saved in the browser's `localStorage`
- Responsive layout with automatic light and dark mode

## Getting started

Start the backend first. See [backend/README.md](../../backend/README.md).

```bash
cd frontend/my-react-app
npm install
cp .env.example .env     # set VITE_API_URL if the backend isn't on localhost:5000
npm run dev
```

Open http://localhost:3000.

> The dev server always runs on port **3000** (set in `vite.config.js`), because the backend only accepts requests from the origin in its `CLIENT_URL` setting (`http://localhost:3000`). If you change the port, update `CLIENT_URL` to match.

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL, no trailing slash. Default: `http://localhost:5000` |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Project structure

```
src/
├── api/
│   └── urlApi.js          # All backend calls; add new endpoints here
├── hooks/
│   ├── useCopy.js         # Clipboard copy with a "Copied" state
│   └── useRecentLinks.js  # Recent links kept in localStorage
├── components/
│   ├── ShortenForm.jsx    # URL, custom alias and expiry inputs
│   ├── ResultCard.jsx     # The newly created short link
│   ├── RecentLinks.jsx    # List of previously created links
│   ├── CopyButton.jsx
│   └── Icons.jsx          # Inline SVG icons
├── App.jsx                # Page layout; connects the components
├── main.jsx               # React entry point
└── index.css              # Design tokens (colors, radius) and shared styles
```

Each component that needs its own styles has a `.css` file next to it. Colors and sizes are CSS variables in `index.css`, so changing the theme only means editing one place.

**Adding a feature** usually means three steps:
1. Add a function in `api/urlApi.js`.
2. Build a component in `components/`.
3. Place it in `App.jsx`.
