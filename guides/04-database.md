# Database Guide

## Overview

The project uses **SQLite** as the database engine, interacting via **Better-SQLite3** driver and **Drizzle ORM**.

## Schema

The schema is defined in `src/lib/server/db/schema.ts`.

### Tables

1.  **User (`user`)**
    -   `id`: Text, Primary Key (Random 120-bit ID).
    -   `username`: Text, Unique, Lowercase.
    -   `passwordHash`: Text.
    -   `age`: Integer (Optional).

2.  **Session (`session`)**
    -   `id`: Text, Primary Key (SHA256 hash of token).
    -   `userId`: Text, Foreign Key to `user.id`.
    -   `expiresAt`: Timestamp (Integer).
    -   **Indexes**: explicit index on `userId` for faster lookups.

## Migrations

We use **Drizzle Kit** to manage schema changes.

1.  **Modify Schema**: Edit `src/lib/server/db/schema.ts`.
2.  **Generate Migration**:
    ```bash
    npm run db:generate
    ```
    This creates SQL files in the `drizzle/` folder.
3.  **Apply Migration**:
    ```bash
    npm run db:migrate
    ```
    This applies the changes to your local database file.

## Accessing Database

Use the exported `db` instance from `src/lib/server/db/index.ts`.

```typescript
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Example: Fetch a user
const result = await db.select().from(table.user).where(eq(table.user.username, 'alice'));
```
