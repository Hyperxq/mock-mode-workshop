import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useMockStore } from '../../stores/mock.store';
import type { Amenity } from './types';

type AmenitiesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; amenities: Amenity[] }
  | { status: 'error'; message: string };

type AmenitiesResult = {
  state: AmenitiesState;
};

export function useAmenities(): AmenitiesResult {
  const [state, setState] = useState<AmenitiesState>({ status: 'idle' });
  // Re-fetch when mock mode toggles so the UI reacts instantly.
  const isMockEnabled = useMockStore((store) => store.isEnabled);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    api<Amenity[]>('/amenities')
      .then((amenities) => {
        if (!cancelled) setState({ status: 'success', amenities });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: 'error', message: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [isMockEnabled]);

  return { state };
}
