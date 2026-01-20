# Contribution Guide

## Overview

We welcome contributions to improve the project. Please follow these guidelines to ensure a smooth workflow.

## Code Style

-   **TypeScript**: Use strict typing. Avoid `any`.
-   **Svelte 5**: Use Runes (`$state`, `$derived`, `$effect`) instead of legacy stores where possible.
-   **Formatting**: We use Prettier. Run `npm run format` before committing.
-   **Linting**: We use ESLint. Run `npm run lint` to check for issues.

## Branching Strategy

-   **Main Branch**: `main` (or `master`) contains the stable code.
-   **Feature Branches**: Create branches from `main` for new features or fixes.
    -   Naming convention: `feature/your-feature-name` or `fix/your-fix-name`.

## Commit Messages

Use conventional commits:
-   `feat: add user profile page`
-   `fix: resolve login error`
-   `docs: update readme`
-   `chore: update dependencies`

## Pull Request Process

1.  Fork the repository (if external) or create a branch.
2.  Make your changes.
3.  Add tests for your changes.
4.  Run tests locally: `npm run test` (unit and e2e).
5.  Submit a Pull Request to `main`.
6.  Describe your changes in detail in the PR description.

## Development Workflow

1.  **Start Dev Server**: `npm run dev`
2.  **Database Changes**:
    -   Modify `schema.ts`.
    -   `npm run db:generate`
    -   `npm run db:migrate`
3.  **Localization**:
    -   Add keys to `messages/en.json`.
    -   Paraglide will auto-generate types.

## Reporting Issues

If you find a bug, please open an issue with:
-   Steps to reproduce.
-   Expected vs actual behavior.
-   Screenshots (if applicable).
