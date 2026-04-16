import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useMockStore } from '../../stores/mock.store';
import type { Property } from './types';

type PropertiesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; properties: Property[] }
  | { status: 'error'; message: string };

type PropertiesResult = {
  state: PropertiesState;
  refetch: () => void;
};

export function useProperties(): PropertiesResult {
  const [state, setState] = useState<PropertiesState>({ status: 'idle' });
  const [nonce, setNonce] = useState(0);
  // Re-fetch whenever mock mode is toggled so the UI reacts instantly.
  const isMockEnabled = useMockStore((store) => store.isEnabled);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    api<Property[]>('/properties')
      .then((properties) => {
        if (!cancelled) setState({ status: 'success', properties });
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
