# Weblogger

A real-time production logging tool for film and TV sets. Log events with timecodes, tag them for filtering, and export to industry-standard formats — all synchronized live across all connected clients.

## Features

- **Timecode-aware logging** — every log entry is tied to an HH:MM:SS:FF timecode, stored both as a structured object and a sortable string
- **Auto-tagging** — uppercase words (e.g. `CAM`, `SFX`, `VFX`) are automatically extracted as tags; words followed by `:` (e.g. `CAM:`) become colored markers
- **Real-time sync** — Socket.IO broadcasts updates to all clients in the same project room instantly
- **Multi-project, multi-user** — users are assigned to projects; controllers and admins have elevated access
- **LTC timecode input** — supports Linear Timecode reader input for hardware sync
- **Exports** — download logs as AVID, CSV, DOCX, PDF, Final Cut Pro XML, or plain text
- **Search & filtering** — filter by tag, date, timecode range, or exclude tags
- **Project statistics** — busiest days, top contributors, most-used tags
- **Soft-delete** — deleted logs are hidden from regular users but visible to admins and controllers

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | SvelteKit 5 + Tailwind CSS 4 + DaisyUI 5 |
| Backend | Express + Socket.IO |
| Database | MongoDB (replica set) via Prisma 6 |
| Auth | JWT stored in `AuthorizationToken` cookie |
| Containerization | Docker + Docker Compose |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB replica set (required by Prisma for transactions)
- `.env` file (see [Environment Variables](#environment-variables))

### Docker (recommended)

The easiest way to run the full stack including a MongoDB replica set:

```bash
cp .env.example .env   # fill in PRIVATE_JWT_ACCESS_SECRET
docker compose up --build
```

The app will be available at `http://localhost:5173`. A default admin user is seeded on first start by `addAdminUser.js`.

### Local development

```bash
npm install
npx prisma generate
npx prisma db push      # sync schema to your MongoDB instance
npm run dev             # Vite dev server with Socket.IO injected via plugin
```

### Production

```bash
npm run build           # vite build + svelte-kit sync + svelte-package + publint
npm run server          # node -r dotenv/config server.js
```

`server.js` wraps the SvelteKit build with Express and mounts Socket.IO. The startup script in Docker runs `prisma db push && node addAdminUser.js && npm run server`.

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=mongodb://localhost:27017/weblogger?replicaSet=rs0&directConnection=true
PRIVATE_JWT_ACCESS_SECRET=your-secret-here
PORT=3000
```

Sentry configuration goes in `.env.sentry-build-plugin`.

## Project Structure

```
src/
  routes/
    api/
      log/            # CRUD + delete/restore/search/single/many
      project/        # Project management + user assignment
      user/           # Auth, profile, project selection
      upload/         # File upload
      exports/
        avid/         # Avid Log Exchange (.ale)
        csv/          # Comma-separated values
        docx/         # Word document
        pdf/          # PDF via pdfmake
        ppro/         # Premiere Pro markers (XML)
        text/         # Plain text
    logger/           # Main logging interface
    viewer/           # Read-only log viewer
    live/             # Live timecode display
    postlogger/       # Post-production logging view
    controller/       # Project controller interface
    admin/            # Admin panel
    search/           # Cross-project search
    import/           # Log import
    profile/          # User profile
    login/            # Auth pages
  lib/
    db.js                           # Singleton PrismaClient
    Models/Log.js                   # Zod schema for log validation
    helpers/
      getLogsWithFilters.js         # Shared log query builder (used by all exports)
      editColors.js                 # Color enum → CSS class mapping
    socket.js                       # Client-side Socket.IO singleton store
```

## Data Model

### Log

Each log entry records:
- `body` — free-text note
- `timecode` — structured `{hours, minutes, seconds, frames}`
- `timecodeString` — sortable `HH:MM:SS:FF` string
- `timecodeDateObj` — DateTime used for range queries
- `tags` — auto-extracted uppercase words
- `marker` — optional colored marker word (e.g. `CAM`)
- `localDate` / `localDateString` — production date
- `deleted` — soft-delete flag

### Project

- Contains many `Log` entries and many `User` members (many-to-many)
- `projectDays` — array of date strings for the shooting schedule
- `markerColors` — array of `{text, color}` for custom marker coloring (8 colors available: blue, cyan, green, yellow, red, pink, black, white)

### User

- Assigned to projects via `projectIds`
- `projectController[]` — projects where the user has controller-level access
- `isAdmin` — full admin access
- `selectedProjectId` — the project currently active in the UI

## Authentication & Authorization

Route protection levels:

| Level | Routes |
|---|---|
| Public | `/`, `/login/*`, `/api/user/login` |
| Authenticated | All other routes |
| Controller-only | `/controller` |
| Admin-only | `/admin` |

`src/hooks.server.js` validates the JWT on every request and attaches the resolved user to `event.locals.user`.

## Real-Time Updates

Socket.IO rooms are keyed by `projectId`. When a log is written, the client emits `newData`; all clients in the same room receive `fetchNewData` and re-fetch logs.

## Running Tests

```bash
npm run test
```

Tests use Vitest.

## Export Formats

All exports use the `getLogsWithFilters` helper and support filtering by date, tag, and timecode range:

| Format | Use case |
|---|---|
| CSV | General-purpose spreadsheet |
| DOCX | Word-compatible report |
| PDF | Print-ready document |
| AVID | Avid Media Composer log exchange |
| Premiere Pro | Adobe Premiere Pro marker import |
| Text | Plain text for any editor |
