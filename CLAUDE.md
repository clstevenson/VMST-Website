# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

VMST Communication Website — a MERN-stack (MongoDB/Express/React/Node) site for the Virginia Masters Swim Team. It lets visitors learn about the team, lets members manage communication preferences, and lets coaches/leaders email members, manage workout groups, and upload meet rosters for relay-building and meet communication. Built around a USMS membership database that must be periodically uploaded (CSV) by a "membership" role since USMS prohibits direct email sharing.

## Commands

Run from the repo root unless noted.

- `npm run install` — installs both `server` and `client` dependencies (root has no deps of its own besides `concurrently`)
- `npm run develop` — runs server (nodemon, via `cd server && npm run watch`) and client (Vite dev server) concurrently
- `npm run build` — builds the client (`cd client && npm run build`) into `client/dist`
- `npm start` — runs the production server only (`node server/server.js`); expects `client/dist` to already be built and serves it as static assets when `NODE_ENV=production`
- `npm run seed` — seeds the database (`cd server && npm run seed`, i.e. `node seeders/seed.js`)

Client-only (run from `client/`):
- `npm run dev` — Vite dev server on port 3000, proxies `/graphql` to `http://localhost:3001`
- `npm run lint` — ESLint over `.js`/`.jsx`, zero warnings allowed
- `npm run build` / `npm run preview`

Server-only (run from `server/`):
- `npm run watch` — nodemon dev server
- `npm run seed` — `node seeders/seed.js`

There is no test suite in this repo (no test runner configured, no `*.test.js` files).

### Environment

Both `server/.env` and `client/.env.development` / `client/.env.production` are required and are gitignored. The server needs at least `MONGODB_URI` and `SECRET_KEY` (JWT signing secret); see `server/config/connection.js` and `server/utils/auth.js`. Other utils (`emailHandler.js`, `get-flickr-photos.js`) likely need their own API credentials (nodemailer/SMTP, Flickr).

## Architecture

### Server (`server/`)

Express + Apollo Server (GraphQL) on top of Mongoose/MongoDB. `server/server.js` is the entry point: it builds the Apollo server from `server/schemas` (`typeDefs.js` + `resolvers.js`, combined in `schemas/index.js`), mounts it at `/graphql` with `authMiddleware` as context, and — only when `NODE_ENV=production` — serves `client/dist` as a SPA fallback.

- **Auth**: JWT-based. `server/utils/auth.js` exports `signToken` (encodes `{ role, _id, group }`), `authMiddleware` (pulls the bearer token off the request, verifies it, and attaches `req.user`), and a shared `AuthenticationError`. Resolvers check `context.user` / `context.user.role` themselves — there's no centralized directive-based authorization, so any new mutation/query that needs restricting must add its own role check in the resolver.
- **Models** (`server/models/`): `Users` (site accounts: roles `user`, `leader`, `coach`, `membership`, `webmaster`; password hashed via bcrypt `pre('save')` hook), `Members` (the USMS/VMST membership roster, uploaded by the `membership` role), `Posts` (blog posts with embedded comments), `Meets` and `Competitors` (meet rosters with embedded swimmer/relay subdocuments — note `Meets.js` and `Competitors.js` independently define similar-but-not-identical embedded meet/relay schemas; check which one is actually current before assuming they're interchangeable). `server/models/index.js` only re-exports `Competitor`, `Member`, `Post`, `User` (not `Meet` — it's required directly where needed).
- **Schema** (`server/schemas/typeDefs.js`, `resolvers.js`): all data access goes through a single GraphQL endpoint; there are no REST routes. Mutations cover auth (`login`, `addUser`, `editUser`, `resetPassword`, `changePassword`), posts, meets/rosters (`addMeet`/`editMeet`/`deleteMeet`, `uploadMembers`), and email sending (`emailLeaders`, `emailWebmaster`, `emailLeadersWebmaster`, `emailGroup`).
- **Role model** (defined in comments at the top of `server/models/Users.js`): `user` (basic, comments only), `leader` (board members; can post, email all members, upload meet rosters), `coach` (emails their own workout group only), `webmaster` (changes roles, moderates comments — "hidden" admin role), `membership` (uploads the USMS roster CSV — the only role with access to raw member emails). New features touching members/email should respect this hierarchy.
- **Email** (`server/utils/emailHandler.js`) and **USMS matching**: meet roster competitors are matched to `Member` records by name/gender (not by USMS ID directly, since rosters come from an external CSV export) — see client-side `matchUSMS.js` for the matching logic that's reviewed/confirmed by leaders before a meet becomes usable for communication.
- **Seeders** (`server/seeders/`): `seed.js` loads `members.json`, `competitors.json`, `posts.json` and `comments.js`/`post-photos.js` helpers into MongoDB for local dev.

### Client (`client/`)

Vite + React 18, React Router v6 (routes declared in `client/src/main.jsx`, wrapping everything in `App.jsx`'s `<Outlet/>`), Apollo Client for GraphQL, styled-components for styling, Radix UI primitives for accessible interactive components (dialog, tabs, popover, etc.), react-hook-form for forms, react-quill for rich text (used by leaders/coaches composing emails and blog posts).

- **Apollo Client setup** lives in `App.jsx`: an `authLink` reads the JWT from `localStorage` (`id_token`) and attaches it as a Bearer token on every GraphQL request.
- **Auth** (`client/src/utils/auth.js`): a singleton `AuthService` class wrapping `jwt-decode` — `loggedIn()`, `getProfile()` (decodes role/_id/group out of the token), `login()`/`logout()` (manage `localStorage` and force a full page redirect rather than a router navigation).
- **GraphQL operations** are centralized in `client/src/utils/queries.js` and `mutations.js` rather than being inlined per-component.
- **Pages** (`client/src/pages/`) are route-level views; **components** (`client/src/components/`) are organized with feature subfolders for `Communication`, `Meets`, `Membership`, `NavBar`, `PhotoGallery`, and a `Styled` folder for shared styled-components primitives.
- **Photo gallery**: backed by Flickr via `server/utils/get-flickr-photos.js` and `client/src/utils/post-photos.js`/`banner-photos.js`, exposed through GraphQL (`getAlbums`, `getAlbumPhotos`, `getFeaturedPhotos`, `getPhotos`, etc. in the typeDefs `Query` type).
- **Dev proxy**: `vite.config.js` proxies `/graphql` to `http://localhost:3001`, so the client and server must both be running locally (`npm run develop` from root handles this).

## Deployment

Single Render service deploys from this monorepo: `render-build` (`npm install && npm run build`) installs both server and client deps and builds the client, then `npm start` runs the Express/Apollo server, which in production also serves `client/dist` as static files for all non-`/graphql` routes (SPA catch-all in `server/server.js`).
