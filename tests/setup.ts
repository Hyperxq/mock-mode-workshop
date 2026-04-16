import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { handlers } from '../mocks/handlers';

/**
 * Vitest global setup.
 *
 * MSW works on two surfaces:
 *   - Browser: `setupWorker` + service worker (see mocks/browser.ts).
 *   - Node: `setupServer` + fetch interceptor (this file).
 *
 * We reuse the EXACT same handlers in both places. That is the whole
 * point of MSW — one declaration, two runtimes.
 */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
