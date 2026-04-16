import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useMockStore } from '../../stores/mock.store';
import type { Post } from './types';

type PostsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; posts: Post[] }
  | { status: 'error'; message: string };

/**
 * Fetches `/posts` from the REAL JSONPlaceholder API.
 *
 * Deliberately there is NO handler for this route in `mocks/domains/`.
 * That means:
 *   - Mock OFF: request hits the real network (obvious).
 *   - Mock ON : the worker sees a request it has no handler for,
 *               so `onUnhandledRequest: 'bypass'` lets it pass
 *               straight through to the real network.
 *
 * In other words, MSW only intercepts what you tell it to intercept.
 * Unmocked endpoints are automatically hybrid. This is an important
 * mental model — "mock ON" does NOT mean "mock everything".
 */
export function usePosts(limit = 4) {
  const [state, setState] = useState<PostsState>({ status: 'idle' });
  // Kept as a dep so toggling mock mode re-fetches and instructors
  // can show in the network tab that this request never hits MSW.
  const isMockEnabled = useMockStore((store) => store.isEnabled);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    api<Post[]>(`/posts?_limit=${limit}`)
      .then((posts) => {
        if (!cancelled) setState({ status: 'success', posts });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: 'error', message: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [limit, isMockEnabled]);

  return { state };
}
