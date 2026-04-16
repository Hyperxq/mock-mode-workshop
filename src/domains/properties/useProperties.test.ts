import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { api, ApiError } from '../../api/client';
import type { Property } from './types';
import { useProperties } from './useProperties';

/**
 * HOOK UNIT TEST.
 *
 * The `api` module is mocked at the IMPORT boundary. That way
 * the hook's behaviour is tested in isolation — no MSW, no
 * network, no service worker. Delete `mocks/` tomorrow and this
 * file still passes.
 */

vi.mock('../../api/client', async () => {
  // Re-use the real ApiError class — its shape is part of the public
  // contract the hook depends on.
  const actual =
    await vi.importActual<typeof import('../../api/client')>('../../api/client');
  return {
    ...actual,
    api: vi.fn(),
  };
});

// The store is mocked too so the hook doesn't try to read Zustand
// internals at import time. `isEnabled` false is irrelevant for the
// hook logic, it just prevents the effect from re-running.
vi.mock('../../stores/mock.store', () => ({
  useMockStore: (selector: (state: { isEnabled: boolean }) => unknown) =>
    selector({ isEnabled: false }),
}));

const fixture: Property[] = [
  {
    id: 1,
    title: 'Oceanfront Villa',
    location: 'Malibu, California',
    host: 'Ada',
    pricePerNight: 642,
    rating: 4.96,
    reviewCount: 214,
    imageUrl: 'https://example.invalid/a.jpg',
    category: 'beachfront',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useProperties', () => {
  it('starts in "loading" and transitions to "success" with the fetched data', async () => {
    vi.mocked(api).mockResolvedValue(fixture);

    const { result } = renderHook(() => useProperties());

    expect(result.current.state.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    if (result.current.state.status !== 'success') {
      throw new Error('Expected success state');
    }
    expect(result.current.state.properties).toEqual(fixture);
  });

  it('transitions to "error" when `api` rejects', async () => {
    vi.mocked(api).mockRejectedValue(new ApiError(500, 'Server Error'));

    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });

    if (result.current.state.status !== 'error') {
      throw new Error('Expected error state');
    }
    expect(result.current.state.message).toContain('500');
  });

  it('refetch triggers a second call to api', async () => {
    vi.mocked(api).mockResolvedValue(fixture);

    const { result } = renderHook(() => useProperties());
    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    result.current.refetch();

    await waitFor(() => {
      expect(vi.mocked(api)).toHaveBeenCalledTimes(2);
    });
  });
});
