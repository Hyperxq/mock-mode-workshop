import type { HttpHandler } from 'msw';

/**
 * Unique identifier for every mocked HTTP route in the application.
 *
 * Why have keys at all? Because we want to:
 *   1. Enable HYBRID MODE — at runtime we can opt specific routes out
 *      of the mock layer and let them hit the real backend. That is
 *      driven by VITE_MSW_OMIT_KEYS (see core/omit.ts).
 *   2. Give each handler a stable, discoverable name so tests can
 *      reference them individually instead of indexing into an array.
 *
 * Extend this union as you add new domains.
 */
export type MockRouteKey =
  | 'GET_PROPERTIES'
  | 'GET_PROPERTY'
  | 'CREATE_PROPERTY'
  | 'GET_HOSTS';

/**
 * A record of mock handlers keyed by route. Using Partial<Record<...>>
 * lets each domain file declare only the keys it owns.
 */
export type MockHandlerMap = Partial<Record<MockRouteKey, HttpHandler>>;
