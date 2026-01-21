# Setup Guide

## Prerequisites

- Node.js (v20 or later)
- npm (v10 or later)

## Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Copy the example environment file to create your local configuration:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` and set the `DATABASE_URL`. For local development with SQLite, you can use:
    ```
    DATABASE_URL=local.db
    ```

## Database Initialization

Before running the app, you need to set up the database schema.

1.  **Generate migrations**:

    ```bash
    npm run db:generate
    ```

2.  **Apply migrations**:
    ```bash
    npm run db:migrate
    ```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.
