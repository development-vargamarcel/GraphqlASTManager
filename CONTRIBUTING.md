# Contributing Guide

Thank you for your interest in contributing to this project!

## Getting Started

Please refer to the following documents for detailed information about the codebase and development workflow:

- [README.md](./README.md): General overview, setup instructions, and feature list.
- [AGENTS.md](./AGENTS.md): Detailed developer guide, architecture, authentication flows, and conventions.

## Code Quality

We enforce code quality using ESLint, Prettier, and Vitest. Before submitting a pull request, please ensure that your changes pass all verification checks by running:

```bash
npm run verify
```

This command runs:

1. `npm run check`: TypeScript/Svelte checks.
2. `npm run lint`: Prettier formatting and ESLint rules.
3. `npm run test:unit`: Unit tests.

## Development Workflow

1.  Make your changes.
2.  Add tests if applicable.
3.  Run `npm run verify` to ensure everything is correct.
4.  Submit your changes.
