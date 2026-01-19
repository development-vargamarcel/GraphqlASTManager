# Deployment Guide

## Build Process

To create a production build of the application:

```bash
npm run build
```

This command:
1.  Syncs SvelteKit types.
2.  Compiles the Paraglide messages.
3.  Builds the SvelteKit application using Vite.
4.  Outputs artifacts to the configured adapter's output directory (e.g., `build/` for `adapter-node` or `.vercel/` for `adapter-auto` on Vercel).

## Adapters

The project currently uses `@sveltejs/adapter-auto`. This tries to detect the target environment (Vercel, Netlify, Cloudflare) and chooses the appropriate adapter.

### Node.js Deployment

If you want to deploy to a standard Node.js server (e.g., VPS, Docker):
1.  Install `@sveltejs/adapter-node`:
    ```bash
    npm install -D @sveltejs/adapter-node
    ```
2.  Update `svelte.config.js` to use `adapter-node`.
3.  Build: `npm run build`.
4.  Run: `node build`.

## Environment Variables

In production, ensure you set the required environment variables:

-   `DATABASE_URL`: Path to the SQLite DB or connection string.
-   `ORIGIN`: The full URL of your site (required by SvelteKit for CSRF protection in some adapters).
-   `BODY_SIZE_LIMIT`: (Optional) Limit for request body size.

## Database in Production

If using SQLite in production:
1.  Ensure the persistent volume for the database file exists.
2.  Run migrations on the production database before starting the app:
    ```bash
    npm run db:migrate
    ```
