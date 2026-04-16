import type { ImportMeta } from './env';

/**
 * The ONE place that reads the real API URL from the environment.
 *
 * Everything in `mocks/` that needs the base URL imports it from here.
 * That way handler files don't each duplicate the `VITE_API_BASE ?? '...'`
 * fallback and there's a single choke point if the env key ever changes.
 */
const FALLBACK = 'https://jsonplaceholder.typicode.com';

export const BACKEND_BASE_URL: string =
  (import.meta as unknown as ImportMeta).env.VITE_API_BASE ?? FALLBACK;
