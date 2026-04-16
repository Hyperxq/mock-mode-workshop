import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../tests/setup';
import { useProperties } from './useProperties';

const API = 'https://jsonplaceholder.typicode.com';

/**
 * HOOK INTEGRATION TESTS
 *
 * These tests show the VALUE of MSW for unit tests: the same
 * handlers that drive the browser demo also drive the Node test
 * runner, so hooks and components can be tested against a realistic
 * network boundary — no fetch mock, no fake HTTP client, no
 * dependency injection.
 *
 * For per-test customization we import the shared `server` from
 * `tests/setup.ts` and call `server.use(...)` to prepend handlers
 * that override the default ones. `afterEach` in the setup file
 * resets them automatically.
 */
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
    // Override for this test only. The afterEach in tests/setup.ts
    // resets handlers back to the default map.
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
