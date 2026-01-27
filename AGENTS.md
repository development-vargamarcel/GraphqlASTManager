# Developer Guide

## Overview

This project is a SvelteKit application using Drizzle ORM, custom authentication logic, and Paraglide for localization. It follows a clean architecture with clear separation of concerns between client and server.

## Architecture

- **Frontend**: SvelteKit (Svelte 5) with Tailwind CSS v4.
- **Backend**: SvelteKit Server Actions and Load functions.
- **Database**: SQLite via Better-SQLite3 and Drizzle ORM.
- **Auth**: Custom session-based authentication using:
  - `@node-rs/argon2` for password hashing.
  - `@oslojs/crypto` & `@oslojs/encoding` for token generation.
  - Session tokens are stored in `httpOnly` cookies (`auth-session`).
  - Sliding window sessions (renew automatically if active and within renewal threshold).
- **Logging**: Structured JSON logging via `src/lib/server/logger.ts`.
- **Validation**: Centralized validation in `src/lib/server/validation.ts`.

## Database Schema

- **User**: `id` (text, PK), `username` (text, unique), `passwordHash` (text), `age` (int), `bio` (text).
- **Session**: `id` (text, PK), `userId` (text, FK), `expiresAt` (int/timestamp).
- **Note**: `id` (text, PK), `userId` (text, FK), `title` (text), `content` (text), `createdAt` (timestamp), `updatedAt` (timestamp).

## Key Flows

### Authentication

1.  **Login/Register**:
    - User submits form.
    - Rate limiter checks IP (20 req/min).
    - Input validation (length, allowed chars).
    - **Register**:
      - Username is normalized to lowercase.
      - User created in DB. Unique constraint handled.
      - Session created & cookie set.
    - **Login**:
      - Username lookup (lowercase).
      - Password verification (Argon2).
      - Session created & cookie set.

2.  **Session Management**:
    - `hooks.server.ts` validates session on every request.
    - Expired sessions are deleted.
    - Sessions nearing expiration (halfway through validity) are automatically renewed (expiry extended).

### User Dashboard

The dashboard (`/demo/lucia`) allows authenticated users to manage their account.

1.  **Profile**:
    - View basic user info (ID, Username).
    - Update Age.
    - Update Bio.

2.  **Security**:
    - Change password. Requires current password verification.
    - New password must meet validation criteria.
    - Revoke Sessions: Terminate individual sessions or sign out everywhere (revoke all sessions).

3.  **Danger Zone**:
    - Delete account.
    - Requires user to type "DELETE" to confirm the action.

4.  **Data Export**:
    - "Download My Data" button in the Profile tab.
    - Exports user profile and session history as a JSON file.

5.  **Personal Notes**:
    - Manage personal notes.
    - Create, Edit, and Delete notes.
    - Notes are private to the user.

### Rate Limiting

- **Global**: Applied in `src/hooks.server.ts` (100 req/min per IP) to protect the app.
- **Auth Routes**: Stricter limit (20 req/min per IP) in login/register actions to prevent brute-force attacks.
- **Headers**: Responses include rate limit information:
  - `X-RateLimit-Limit`: Maximum requests allowed in the window.
  - `X-RateLimit-Remaining`: Remaining requests.
  - `X-RateLimit-Reset`: Unix timestamp when the limit resets.

### Observability

- **Request ID**: Every request is assigned a unique `X-Request-ID` header for tracing.
- **System Status**: A visual indicator in the footer checks the `/api/health` endpoint.

## Setup Instructions

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Environment Setup**:
    - Copy `.env.example` to `.env`.
    - Set `DATABASE_URL` (e.g., `local.db`).

3.  **Database Initialization**:

    ```bash
    npm run db:generate
    npm run db:migrate
    ```

4.  **Development**:
    ```bash
    npm run dev
    ```

## Testing

- **Unit Tests**:

  ```bash
  npm run test:unit
  ```

  To test server logic only: `npm run test:unit -- src/lib/server/`

- **End-to-End Tests**:
  ```bash
  npx playwright install # First time only
  npm run test:e2e
  ```

## Conventions

- **Logging**: Use `Logger` class. Log errors with full context (params, error object).
- **Error Handling**: Return user-friendly error messages in actions. Log technical details.
- **Database**: Usernames are always stored and queried in lowercase.
- **Security**: `hooks.server.ts` handles Security Headers (CSP, X-Frame-Options, etc.).
- **UI/UX**:
  - Use `toastState` (Svelte 5 Rune) for client-side notifications (success/error).
  - Authentication forms use `autofocus` on the username field.
- **Documentation**: All exported functions and actions must have JSDoc comments.
