/**
 * Unique identifier for every mocked HTTP route in the application.
 *
 * Why have keys at all? Because we want to:
 *   1. Enable HYBRID MODE — at runtime a specific route can opt out
 *      of mocking and pass through to the real backend. That is
 *      driven by `VITE_MSW_OMIT_KEYS` (see `mock.config.ts`).
 *   2. Give each handler a stable, discoverable name so tests can
 *      reference them individually instead of indexing into an array.
 *
 * Extend this union when you add a new domain.
 */
export type MockRouteKey =
  | 'GET_PROPERTIES'
  | 'GET_PROPERTY'
  | 'CREATE_PROPERTY'
  | 'GET_HOSTS'
  | 'GET_AMENITIES';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
