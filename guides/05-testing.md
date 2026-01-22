# Testing Guide

We use a combination of Unit Tests (Vitest) and End-to-End Tests (Playwright).

## Unit Tests

Unit tests are located alongside the source files or in `src/**/*.spec.ts`.

- **Runner**: Vitest
- **Environment**:
  - Server-side logic: Node.js environment.
  - Components: Browser environment (via Playwright provider).

### Running Unit Tests

```bash
npm run test:unit
```

### Writing Component Tests

We use `vitest-browser-svelte` to render components in a real browser environment (headless).

Example `Header.svelte.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import Header from './Header.svelte';

vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/') }
}));

describe('Header', () => {
	it('renders correctly', async () => {
		render(Header);
		await expect.element(page.getByText('Home')).toBeInTheDocument();
	});
});
```

## End-to-End (E2E) Tests

E2E tests are located in the `e2e/` directory. They test the application flow from a user's perspective.

### Prerequisites

Install Playwright browsers:

```bash
npx playwright install
```

### Running E2E Tests

```bash
npm run test:e2e
```

### Writing E2E Tests

Refer to [Playwright documentation](https://playwright.dev/) for syntax.
Note: Ensure the development server or production build is running, or let Playwright start it (configured in `playwright.config.ts`).
