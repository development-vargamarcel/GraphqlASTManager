# SvelteKit App with Drizzle & Lucia

This is a SvelteKit application featuring custom authentication, SQLite database, and internationalization.

## Features

- **SvelteKit**: Full-stack framework.
- **Drizzle ORM**: Type-safe database interaction with SQLite.
- **Authentication**: Custom session-based auth with Argon2 hashing.
- **Localization**: Paraglide JS.
- **Tailwind CSS**: Utility-first styling.

## Getting Started

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

    _Note: The `prepare` script will automatically run `svelte-kit sync` and `paraglide-js compile`. If you encounter missing module errors, try running `npm run prepare` manually._

2.  **Database Setup**:
    Copy `.env.example` to `.env` and configure `DATABASE_URL`.

    ```bash
    npm run db:generate
    npm run db:migrate
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Testing

- **Unit Tests**: `npm run test:unit`
- **E2E Tests**:
  ```bash
  npx playwright install # First time only
  npm run test:e2e
  ```

## Documentation

See [AGENTS.md](./AGENTS.md) for detailed developer documentation, architecture, and flows.
