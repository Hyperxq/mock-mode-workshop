import { HttpResponse, delay, http, passthrough } from 'msw';
import { shouldMock, type MockConfig } from '../core/mock.config';
import { joinUrl } from '../core/url';

/**
 * HOSTS DOMAIN — the "same endpoint, different data" showcase.
 *
 * The handler path is `/users`, which is a REAL endpoint on
 * JSONPlaceholder. That is intentional:
 *
 *   - When `GET_HOSTS` is mocked, MSW returns four curated
 *     hosts — obviously not real users.
 *   - When `GET_HOSTS` is in `config.omittedKeys` (hybrid mode) OR
 *     mocking is globally off, the handler calls `passthrough()` /
 *     the worker isn't running, and the request flies to the real
 *     API (Leanne Graham, Ervin Howell, …).
 *
 * In the Network tab the difference is obvious: mocked responses
 * have an `x-powered-by: msw` header, real ones don't.
 */

export interface Host {
  id: number;
  name: string;
  username: string;
  email: string;
  /** Present ONLY in mocked data — lets the UI prove the swap. */
  isSuperhost?: boolean;
  /** Present ONLY in mocked data — real JSONPlaceholder users have no avatar. */
  avatarUrl?: string;
}

const seed: Host[] = [
  { id: 1, name: 'Ada Lovelace', username: 'ada', email: 'ada@analytical.engine', isSuperhost: true, avatarUrl: 'https://picsum.photos/seed/host-ada/120/120' },
  { id: 2, name: 'Alan Turing', username: 'alan', email: 'alan@bletchley.uk', isSuperhost: false, avatarUrl: 'https://picsum.photos/seed/host-alan/120/120' },
  { id: 3, name: 'Grace Hopper', username: 'grace', email: 'grace@cobol.navy', isSuperhost: true, avatarUrl: 'https://picsum.photos/seed/host-grace/120/120' },
  { id: 4, name: 'Margaret Hamilton', username: 'margaret', email: 'margaret@apollo.nasa', isSuperhost: true, avatarUrl: 'https://picsum.photos/seed/host-margaret/120/120' },
];

export function hostHandlers(config: MockConfig, baseUrl: string) {
  const url = (path: string) => joinUrl(baseUrl, path);

  return [
    http.get(url('/users'), async () => {
      if (!shouldMock(config, 'GET_HOSTS')) return passthrough();
      await delay(400);
      return HttpResponse.json(seed);
    }),
  ];
}
