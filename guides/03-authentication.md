# Authentication Guide

## Overview

Authentication is implemented using a custom session-based system. It relies on secure cookies and database storage for sessions.

## Components

- **Libraries**:
  - `@node-rs/argon2`: For secure password hashing.
  - `@oslojs/crypto` & `@oslojs/encoding`: For generating secure session tokens and IDs.

- **Database Tables**:
  - `user`: Stores user credentials (hashed password) and profile data.
  - `session`: Stores active sessions, linked to users, including metadata (IP, User Agent).

## Authentication Flow

### Registration

1.  User submits username and password.
2.  Server validates input (length, allowed characters).
3.  Server checks if username (normalized to lowercase) already exists.
4.  Password is hashed using Argon2id.
5.  New user is inserted into the `user` table.
6.  A new session is created and a session cookie is set.

### Login

1.  User submits username and password.
2.  Server looks up user by username (lowercase).
3.  Server verifies password against the stored hash.
4.  If valid, a new session is created and a session cookie is set.

### Session Management

- **Session Token**: A random string stored in an `httpOnly`, `Secure` (in prod), `SameSite=Lax` cookie named `auth-session`.
- **Validation**: On every request, `hooks.server.ts` validates the token against the database.
- **Expiration**: Sessions are valid for 30 days.
- **Sliding Window**: If a user is active and the session is more than 15 days old (halfway to expiration), the expiration is automatically extended by another 30 days.

## Security Measures

- **Rate Limiting**:
  - Global limit: 100 requests/minute per IP.
  - Auth endpoints: Stricter limits (20 requests/minute) are applied to login/register actions.
- **CSRF Protection**: SvelteKit's native CSRF protection is enabled for form actions.
- **Cookie Security**: Cookies are configured to be inaccessible to client-side JS (`httpOnly`).

## User Dashboard Features

The dashboard (`/demo/lucia`) provides authenticated users with account management tools:

- **Profile Management**: Users can update their profile information (e.g., Age, Bio).
- **Copy User ID**: A convenient button next to the User ID allows users to quickly copy their unique identifier to the clipboard.
- **Security Settings**:
  - **Change Password**: Users can update their password. This requires entering the current password for verification.
  - **Password Visibility**: Both "New Password" and "Current Password" fields include a toggle to show/hide the password text for better usability.
  - **Password Strength**: A real-time strength meter provides feedback on the new password complexity.
  - **Active Sessions**: Users can view a list of all active sessions, including IP address and User Agent. They can revoke any session other than the current one.
  - **Revoke All Sessions**: Users can sign out from all devices simultaneously (including the current session) by using "Sign out everywhere".
- **Danger Zone**: Users can permanently delete their account. This action requires an explicit confirmation by typing "DELETE".

## Password Reset

A "Forgot Password" flow allows users to regain access to their account.

1.  **Request**: User enters their username on the `/demo/lucia/login/forgot` page.
2.  **Token Generation**: If the user exists, a secure, short-lived (15 minutes) token is generated and stored in the database.
3.  **Delivery**: In this demo environment, the reset link (containing the token) is logged to the server console. In production, this would be emailed.
4.  **Reset**: The user visits the link, enters a new password.
5.  **Completion**: The password is updated, all existing sessions are invalidated (security measure), and the user is automatically logged in with a new session.

## API Access

Users can generate **Personal Access Tokens (PATs)** to access the API programmatically.

- **Token Generation**: Users can create named tokens in the "API Access" tab. Tokens are displayed only once upon creation.
- **Usage**: Tokens must be included in the `Authorization` header as a Bearer token (`Authorization: Bearer <token>`).
- **Endpoints**: Authenticated API requests can be made to endpoints starting with `/api/v1/`.
- **Revocation**: Users can revoke specific tokens at any time, immediately invalidating them.
