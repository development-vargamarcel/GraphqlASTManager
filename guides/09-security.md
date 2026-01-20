# Security Guide

## Overview

Security is a top priority. This guide outlines the security measures implemented in the application.

## HTTP Headers

We set strict security headers in `src/hooks.server.ts` to protect against common attacks.

-   **X-Content-Type-Options**: `nosniff` (Prevents MIME sniffing).
-   **X-Frame-Options**: `DENY` (Prevents clickjacking by disabling iframes).
-   **X-XSS-Protection**: `1; mode=block` (Legacy browser XSS protection).
-   **Referrer-Policy**: `strict-origin-when-cross-origin` (Privacy protection).
-   **Content-Security-Policy (CSP)**:
    -   `default-src 'self'`: Only load resources from the same origin by default.
    -   `script-src 'self' 'unsafe-inline'`: Allow local scripts and inline scripts (required for some SvelteKit functionality, consider tightening in strict environments).
    -   `style-src 'self' 'unsafe-inline'`: Allow local styles and inline styles (required for Tailwind/Svelte).
    -   `img-src 'self' data:`: Allow local images and data URIs.
    -   `object-src 'none'`: Disable plugins like Flash.
    -   `frame-ancestors 'none'`: Prevent embedding in frames.

## Authentication

-   **Algorithm**: Argon2id is used for password hashing (`@node-rs/argon2`).
-   **Sessions**:
    -   Stored in database.
    -   Tokens are high-entropy random strings.
    -   Cookies are `httpOnly`, `Secure` (in production), and `SameSite=Lax`.
-   **Rate Limiting**:
    -   Login and Register endpoints have strict rate limits to prevent brute-force.
    -   Global rate limiting protects the application from DoS.

## Input Validation

-   All user inputs are validated on the server side using helper functions in `src/lib/server/validation.ts`.
-   Database queries use parameterized statements (via Drizzle/Better-SQLite3) to prevent SQL Injection.

## CSRF Protection

-   SvelteKit's built-in CSRF protection is enabled.
-   `ORIGIN` environment variable must be set in production to verify the origin of requests.
