import type { MockHandlerMap, MockRouteKey } from './types';

/**
 * Reads VITE_MSW_OMIT_KEYS (comma-separated list of MockRouteKey values)
 * and returns a new map WITHOUT the omitted routes. Omitted routes are
 * not registered with the worker, so their requests pass through to the
 * real backend — that is "hybrid mode".
 *
 * Example:
 *   VITE_MSW_OMIT_KEYS="GET_USERS,CREATE_USER"
 *
 * Teaching moment for the workshop: hybrid mode is what makes MSW useful
 * in real projects. You mock the endpoints that don't exist yet, and let
 * the real backend serve the ones that do.
 */
export function applyOmitList(map: MockHandlerMap): MockHandlerMap {
  const raw = import.meta.env.VITE_MSW_OMIT_KEYS ?? '';
  if (!raw) return map;

  const omit = new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean) as MockRouteKey[],
  );

  const next: MockHandlerMap = {};
  for (const [key, handler] of Object.entries(map)) {
    if (!omit.has(key as MockRouteKey)) {
      next[key as MockRouteKey] = handler;
    }
  }
  return next;
}
