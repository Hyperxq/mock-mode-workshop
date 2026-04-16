import { HttpResponse, delay, http } from 'msw';
import type { MockHandlerMap, MockRouteKey } from './types';

export type CrudFactoryOptions<T extends { id: number }> = {
  /** Full base URL, e.g. `${API}/users` */
  baseUrl: string;
  /** Route keys produced by this factory */
  keys: {
    list: MockRouteKey;
    getById: MockRouteKey;
    create: MockRouteKey;
  };
  /** Initial seed data (kept in-memory for the session) */
  seed: T[];
  /** Simulated latency in ms. Defaults to 300ms. */
  delayMs?: number;
};

/**
 * ADVANCED — generates a REST CRUD handler map from a seed array.
 *
 * Useful when a domain has no special logic and you just want the
 * standard list / get-by-id / create shape. For anything custom,
 * write handlers by hand (see `mocks/domains/users.mock.ts`).
 *
 * Workshop note: we do NOT use this factory for the users domain
 * on purpose — the manual version is easier to read the first time
 * you see MSW. Teach the manual version, mention the factory as a
 * natural next step once they understand the primitives.
 */
export function createCrudHandlers<T extends { id: number }>(
  options: CrudFactoryOptions<T>,
): MockHandlerMap {
  const { baseUrl, keys, seed, delayMs = 300 } = options;
  const store: T[] = [...seed];
  const wait = async () => {
    if (delayMs > 0) await delay(delayMs);
  };

  return {
    [keys.list]: http.get(baseUrl, async () => {
      await wait();
      return HttpResponse.json(store);
    }),
    [keys.getById]: http.get(`${baseUrl}/:id`, async ({ params }) => {
      await wait();
      const id = Number(params.id);
      const record = store.find((item) => item.id === id);
      if (!record) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json(record);
    }),
    [keys.create]: http.post(baseUrl, async ({ request }) => {
      await wait();
      const body = (await request.json()) as Omit<T, 'id'>;
      const next = { ...body, id: store.length + 1 } as T;
      store.push(next);
      return HttpResponse.json(next, { status: 201 });
    }),
  };
}
