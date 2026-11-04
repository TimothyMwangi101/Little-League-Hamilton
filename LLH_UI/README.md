# Hamilton Little League UI

The UI is a React and TypeScript single-page application built with Vite. It provides the navigation, account, authentication, map, and search pages for Hamilton Little League.

## Requirements

- Node.js and npm
- The project backend, when using API features

## Getting started

From the `LLH_UI` directory, install dependencies and start the development server:

```sh
npm install
npm run dev
```

Vite serves the UI locally (by default at `http://localhost:5173`). Create an `.env` file in `LLH_UI` for the backend and Google Maps settings:

```dotenv
SERVER_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_MAPS_MAP_ID=your-google-maps-map-id
```

`SERVER_URL` is the backend origin used by Vite's `/api` development proxy. If it is not set, the proxy targets `http://localhost:3000`. Google Maps values are made available to the client bundle, so use a browser key restricted to the appropriate APIs and websites; do not put server-side secrets here.

## How the UI connects to the backend

[`src/client.ts`](./src/client.ts) creates a typed Hono client rooted at the current page's origin plus `/api`. During development, Vite forwards requests under `/api` to `SERVER_URL`.
## Useful commands

Run these from `LLH_UI`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production build in `dist`. |
| `npm run preview` | Preview the production build locally. Run `npm run build` first. |
| `npm run lint` | Check the code with Oxlint. |
| `npm run lint:fix` | Apply automatic Oxlint fixes. |

## Application routes

Routes are registered in `src/main.tsx`:

| Path | Page |
| --- | --- |
| `/` | Home |
| `/login` | Authentication |
| `/account` | Account |
| `/map` | Map |
| `/search` | Search |

## Project structure

```text
LLH_UI/
├── index.html                 # HTML entry point used by Vite
├── vite.config.ts             # React/Tailwind plugins, Maps build values, and API proxy
├── package.json               # Dependencies and npm scripts
└── src/
    ├── App.tsx                # Home page component
    ├── client.ts              # Typed Hono client for the backend API
    ├── main.tsx               # React entry point and route setup
    ├── index.css              # Global styles and Tailwind CSS entry point
    ├── vite-env.d.ts          # Vite client type declarations
    ├── data/
    │   └── Parks.json         # Park data used by the UI
    └── components/
        ├── Nav.tsx            # Shared site navigation
        ├── account/           # Account page and account-related components
        ├── auth/              # Authentication pages, forms, and API 
        ├── map/               # Map page and map-related UI
        └── search/            # Search page and search-related UI
```
