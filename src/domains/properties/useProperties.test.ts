import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { MockConfig } from '../../../mocks/core/mock.config';
import { createHandlers } from '../../../mocks/handlers';
import { useProperties } from './useProperties';

/**
 * HOOK INTEGRATION TESTS
 *
 * Same handlers as the browser demo, run in Node via `msw/node`.
 * We scope the server to this file — no global setup — so every
 * test file stays self-contained and easy to reason about.
 *
 * Per-test overrides use `server.use(...)` which prepends handlers
 * ahead of the default ones. `afterEach` resets back to the
 * configured default handler list.
 */

// Must match whatever `api/client.ts` resolves `VITE_API_BASE` to.
// The workshop defaults to JSONPlaceholder.
const API = 'https://jsonplaceholder.typicode.com';

const config: MockConfig = {
  omittedKeys: new Set(),
  onUnhandled: 'error',
};

const server = setupServer(...createHandlers(config, API));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers(...createHandlers(config, API)));
afterAll(() => server.close());

describe('useProperties', () => {
  it('starts in "loading" and transitions to "success" with mocked data', async () => {
    const { result } = renderHook(() => useProperties());

    expect(result.current.state.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    if (result.current.state.status !== 'success') {
      throw new Error('Expected success state');
    }
    expect(result.current.state.properties).toHaveLength(12);
    expect(result.current.state.properties[0]).toMatchObject({
      title: 'Oceanfront Villa with Infinity Pool',
    });
  });

  it('renders the empty state when the API returns no properties', async () => {
    server.use(
      http.get(`${API}/properties`, () => HttpResponse.json([])),
    );

    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    if (result.current.state.status !== 'success') {
      throw new Error('Expected success state');
    }
    expect(result.current.state.properties).toEqual([]);
  });

  it('transitions to "error" when the API returns 500', async () => {
    server.use(
      http.get(`${API}/properties`, () =>
        new HttpResponse(null, { status: 500, statusText: 'Server Error' }),
      ),
    );

    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });

    if (result.current.state.status !== 'error') {
      throw new Error('Expected error state');
    }
    expect(result.current.state.message).toContain('500');
  });
});
