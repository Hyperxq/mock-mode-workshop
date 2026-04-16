import { HttpResponse, delay, http } from 'msw';
import type { MockHandlerMap } from '../core/types';

/**
 * HOSTS DOMAIN — demonstrates Scenario 2 of the workshop:
 * "same endpoint, different data depending on mock state".
 *
 * The handler path is `/users`, which is a REAL endpoint on
 * JSONPlaceholder. That is intentional:
 *
 *   - Mock ON  -> this handler serves 4 curated hosts (computer
 *                 science pioneers). These names are obviously
 *                 not real users.
 *   - Mock OFF -> the request flies past MSW and hits
 *                 https://jsonplaceholder.typicode.com/users, which
 *                 returns 10 fake-but-realistic users (Leanne Graham,
 *                 Ervin Howell, ...). Different data, same fetch.
 *
 * In the Network tab the difference is obvious: mocked responses
 * have an `x-powered-by: msw` header; real ones don't.
 */

const API = import.meta.env.VITE_API_BASE ?? 'https://jsonplaceholder.typicode.com';

export type Host = {
  id: number;
  name: string;
  username: string;
  email: string;
  /** Present in mocked data, absent in real JSONPlaceholder users. */
  isSuperhost?: boolean;
  /** Present in mocked data, absent in real JSONPlaceholder users. */
  avatarUrl?: string;
};

const hosts: Host[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    username: 'ada',
    email: 'ada@analytical.engine',
    isSuperhost: true,
    avatarUrl: 'https://picsum.photos/seed/host-ada/120/120',
  },
  {
    id: 2,
    name: 'Alan Turing',
    username: 'alan',
    email: 'alan@bletchley.uk',
    isSuperhost: false,
    avatarUrl: 'https://picsum.photos/seed/host-alan/120/120',
  },
  {
    id: 3,
    name: 'Grace Hopper',
    username: 'grace',
    email: 'grace@cobol.navy',
    isSuperhost: true,
    avatarUrl: 'https://picsum.photos/seed/host-grace/120/120',
  },
  {
    id: 4,
    name: 'Margaret Hamilton',
    username: 'margaret',
    email: 'margaret@apollo.nasa',
    isSuperhost: true,
    avatarUrl: 'https://picsum.photos/seed/host-margaret/120/120',
  },
];

export const hostsHandlers: MockHandlerMap = {
  GET_HOSTS: http.get(`${API}/users`, async () => {
    await delay(400);
    return HttpResponse.json(hosts);
  }),
};
