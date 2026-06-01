# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (with Socket.IO via vite.config.js plugin)

# Production build
npm run build        # vite build + svelte-kit sync + svelte-package + publint
npm run server       # Run production server: node -r dotenv/config server.js

# Tests
npm run test         # Run vitest

# Docker (full stack with MongoDB replica set)
docker compose up --build

# Database schema sync (dev)
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate
```

## Architecture

**Stack**: SvelteKit (adapter-node) + Express + Socket.IO + MongoDB (via Prisma) + Tailwind/DaisyUI.

### Two-server model

- **Dev**: `vite dev` starts the SvelteKit dev server with a Socket.IO server injected via a Vite plugin (`vite.config.js`).
- **Production**: `server.js` wraps the SvelteKit build with an Express server that mounts Socket.IO. The SvelteKit `handler` is used as Express middleware. Entry point is `npm run server`.

### Authentication

JWT-based auth stored in an `AuthorizationToken` cookie (Bearer token). `src/hooks.server.js` validates the cookie on every request, attaches the resolved user (including assigned projects) to `event.locals.user`, and handles redirects for unauthenticated/unauthorized access.

Route protection levels:
- Public: `/`, `/login/*`, `/api/user/login`
- Authenticated: all other routes
- Controller-only: `/controller` (checked against `user.projectController[]`)
- Admin-only: `/admin`

### Data model key concepts

- **Project**: top-level container; users are many-to-many via `userIds`/`assignedUsers`. Has `markerColors` (array of `{text, color}`) and `projectDays` (array of date strings like `YYYY.MM.DD`).
- **Log**: belongs to a project; stores both a structured `timecode` object, a sortable `timecodeString` (`HH:MM:SS:FF`), and a `timecodeDateObj` (DateTime) used for range queries. `deleted` flag is used for soft-delete; only admins and project controllers see deleted logs.
- **Tags & markers**: on log creation/update, uppercase words (`\b[A-Z0-9]{2,}\b`) are auto-extracted as tags. A "marker" is a word followed by `:` (e.g. `CAM:`). Marker colors are resolved from the project's `markerColors` config.

### Real-time updates

Socket.IO rooms are keyed by `projectId`. When a log is written, the client emits `newData` with the projectId; all clients in that room receive `fetchNewData` and re-fetch logs.

### API routes (`src/routes/api/`)

- `GET/POST/PATCH/DELETE /api/log` — main log CRUD
- `/api/log/delete`, `/api/log/restore`, `/api/log/search`, `/api/log/single`, `/api/log/many` — specialized log operations
- `/api/project`, `/api/project/addUserToProject`
- `/api/user`, `/api/user/login`, `/api/user/getMe`, `/api/user/selectProject`
- `/api/upload`
- `/api/exports/{avid,csv,docx,pdf,ppro,text}` — export endpoints that use `getLogsWithFilters` helper and return formatted file downloads

### Key shared helpers

- `src/lib/db.js` — singleton `PrismaClient` instance
- `src/lib/helpers/getLogsWithFilters.js` — shared log query builder used by all export endpoints; supports date, tag filters, timecode range, and exclude-filter
- `src/lib/helpers/editColors.js` — maps color enum values to CSS classes
- `src/lib/Models/Log.js` — Zod schema for validating log input before DB writes
- `src/lib/socket.js` — client-side Socket.IO singleton store

### Environment variables

Required in `.env`:
- `DATABASE_URL` — MongoDB connection string (must be a replica set for Prisma transactions)
- `PRIVATE_JWT_ACCESS_SECRET` — JWT signing secret
- `PORT` — server port (default 3000)
- Sentry config in `.env.sentry-build-plugin`

### Docker / production startup

`startServer.sh` runs: `prisma db push && node addAdminUser.js && npm run server`. `addAdminUser.js` seeds a default admin if none exists. MongoDB must be a replica set (required by Prisma for MongoDB transactions).
