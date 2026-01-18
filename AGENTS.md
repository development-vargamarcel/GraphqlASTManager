# Developer Guide

## Overview

This project is a SvelteKit application using Drizzle ORM, Lucia (implemented manually via `auth.ts`), and Paraglide for localization.

## Architecture

-   **Frontend**: SvelteKit with Tailwind CSS.
-   **Backend**: SvelteKit Server Actions and Load functions.
-   **Database**: SQLite via Better-SQLite3 and Drizzle ORM.
-   **Auth**: Custom session-based authentication using Argon2 for password hashing.
-   **Logging**: Custom `Logger` utility in `src/lib/server/logger.ts`.

## Key Flows

### Authentication

1.  User submits login form.
2.  Server verifies password hash.
3.  `createSession` is called to generate a token and store session in DB.
4.  Cookie is set via `setSessionTokenCookie`.

### Rate Limiting

Global rate limiting is applied in `src/hooks.server.ts` using `RateLimiter` class. It tracks requests in-memory.

## Setup Instructions

1.  Install dependencies: `npm install`
2.  Set up environment variables: Copy `.env.example` to `.env`.
3.  Generate database: `npm run db:generate`
4.  Migrate database: `npm run db:migrate`
5.  Start dev server: `npm run dev`

## Testing

-   Unit tests: `npm run test:unit`
-   E2E tests: `npm run test:e2e`

## Conventions

-   Use `Logger` for server-side logging.
-   Wrap DB operations in try-catch blocks.
-   Use `check` script before committing.
