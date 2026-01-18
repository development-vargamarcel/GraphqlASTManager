# Developer Guide

## Overview

This project is a SvelteKit application using Drizzle ORM, Lucia (implemented manually via `auth.ts`), and Paraglide for localization.

## Architecture

-   **Frontend**: SvelteKit with Tailwind CSS.
-   **Backend**: SvelteKit Server Actions and Load functions.
-   **Database**: SQLite via Better-SQLite3 and Drizzle ORM.
-   **Auth**: Custom session-based authentication using Argon2 for password hashing.
    -   Session tokens are stored in cookies (`auth-session`).
    -   Sessions slide (renew) automatically if active.
-   **Logging**: Custom `Logger` utility in `src/lib/server/logger.ts`.
-   **User Management**:
    -   Usernames are case-insensitive (stored as lowercase).
    -   Validation allows alphanumeric, hyphens, and underscores.

## Database Schema

-   **User**: `id` (text, PK), `username` (text, unique), `passwordHash` (text), `age` (int).
-   **Session**: `id` (text, PK), `userId` (text, FK), `expiresAt` (int/timestamp).

## Key Flows

### Authentication

1.  User submits login form.
2.  Input validation (username/password).
3.  Username is normalized to lowercase.
4.  Server verifies password hash against stored hash.
5.  `createSession` is called to generate a token and store session in DB.
6.  Cookie is set via `setSessionTokenCookie`.

### Rate Limiting

-   **Global**: Applied in `src/hooks.server.ts` (100 req/min per IP).
-   **Login/Register**: Stricter limit applied in route actions (5 req/min per IP).

## Setup Instructions

1.  Install dependencies: `npm install`
2.  Set up environment variables: Copy `.env.example` to `.env`.
    -   Ensure `DATABASE_URL` is set (e.g., `local.db`).
3.  Generate database: `npm run db:generate`
4.  Migrate database: `npm run db:migrate`
5.  Start dev server: `npm run dev`

## Testing

-   Unit tests: `npm run test:unit` (or `npm run test:unit -- src/lib/server/` for server-only).
-   E2E tests: `npm run test:e2e` (requires Playwright browsers: `npx playwright install`).

## Conventions

-   Use `Logger` for server-side logging.
-   Wrap DB operations in try-catch blocks.
-   Use `check` script before committing.
-   Usernames are always processed as lowercase in backend logic.
