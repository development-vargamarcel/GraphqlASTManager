# Architecture Guide

## Overview

This project is a full-stack web application built with:

- **SvelteKit**: The meta-framework for Svelte, handling routing, server-side rendering (SSR), and API endpoints.
- **Svelte 5**: Utilizing the latest "Runes" reactivity model.
- **Drizzle ORM**: For type-safe database interactions.
- **Tailwind CSS v4**: For utility-first styling.
- **Paraglide JS**: For internationalization (i18n).

## Directory Structure

```
src/
├── lib/                 # Shared code (components, server logic, utils)
│   ├── components/      # Reusable UI components (Header, Footer)
│   ├── server/          # Server-only logic (DB, Auth, Logging)
│   └── paraglide/       # Generated localization files
├── routes/              # File-system based routing
│   ├── demo/            # Demo pages
│   ├── +layout.svelte   # Root layout
│   └── +page.svelte     # Home page
├── hooks.server.ts      # Server hooks (Auth, Rate Limiting, Logging)
└── app.html             # HTML template
```

## Key Modules

### Server Logic (`src/lib/server`)

- **`auth.ts`**: Handles session creation, validation, and password hashing.
- **`db/`**: Contains database configuration and schema definitions.
- **`logger.ts`**: A structured logger for consistent server-side logging.
- **`rate-limiter.ts`**: In-memory rate limiting utility.
- **`validation.ts`**: Input validation helpers.

### Hooks (`src/hooks.server.ts`)

The `hooks.server.ts` file intercepts every request to the server. It performs the following in order:

1.  **Logging**: Logs request details (method, path, status, duration).
2.  **Security Headers**: Adds headers like `X-Frame-Options` and `CSP`.
3.  **Rate Limiting**: Checks if the IP has exceeded the global limit.
4.  **Paraglide**: Handles localization context.
5.  **Auth**: Validates the session token from cookies and populates `event.locals.user`.

## Frontend

The frontend uses Svelte 5 with Runes (`$state`, `$derived`, `$effect`).
Global styles are defined in `src/app.css` using Tailwind CSS.
