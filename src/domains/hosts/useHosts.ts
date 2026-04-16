import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useMockStore } from '../../stores/mock.store';
import type { Host } from './types';

type HostsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; hosts: Host[] }
  | { status: 'error'; message: string };

type HostsResult = {
  state: HostsState;
  refetch: () => void;
};

export function useHosts(): HostsResult {
  const [state, setState] = useState<HostsState>({ status: 'idle' });
  const [nonce, setNonce] = useState(0);
  // Re-fetch whenever mock mode is toggled so the UI reacts instantly.
  const isMockEnabled = useMockStore((store) => store.isEnabled);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    // The path is `/users` — the real JSONPlaceholder endpoint. When
    // mock mode is ON the MSW worker intercepts it and returns the
    // curated host list; when OFF the request hits the real network.
    api<Host[]>('/users')
      .then((hosts) => {
        if (!cancelled) setState({ status: 'success', hosts });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: 'error', message: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [nonce, isMockEnabled]);

  return {
    state,
    refetch: () => setNonce((value) => value + 1),
  };
}
