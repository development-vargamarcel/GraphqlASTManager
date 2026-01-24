# Authentication Guide

## Overview

Authentication is implemented using a custom session-based system. It relies on secure cookies and database storage for sessions.

## Components

- **Libraries**:
  - `@node-rs/argon2`: For secure password hashing.
  - `@oslojs/crypto` & `@oslojs/encoding`: For generating secure session tokens and IDs.

- **Database Tables**:
  - `user`: Stores user credentials (hashed password) and profile data.
  - `session`: Stores active sessions, linked to users.

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
  - Auth endpoints: Stricter limits can be applied to login/register actions.
- **CSRF Protection**: SvelteKit's native CSRF protection is enabled for form actions.
- **Cookie Security**: Cookies are configured to be inaccessible to client-side JS (`httpOnly`).

## User Dashboard Features

The dashboard (`/demo/lucia`) provides authenticated users with account management tools:

- **Profile Management**: Users can update their profile information (e.g., Age).
- **Copy User ID**: A convenient button next to the User ID allows users to quickly copy their unique identifier to the clipboard.
- **Security Settings**:
  - **Change Password**: Users can update their password. This requires entering the current password for verification.
  - **Password Visibility**: Both "New Password" and "Current Password" fields include a toggle to show/hide the password text for better usability.
  - **Password Strength**: A real-time strength meter provides feedback on the new password complexity.
- **Danger Zone**: Users can permanently delete their account. This action requires an explicit confirmation by typing "DELETE".
