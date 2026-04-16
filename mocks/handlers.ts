import { applyOmitList } from './core/omit';
import { propertiesHandlers } from './domains/properties.mock';

/**
 * Central handler registry.
 *
 * Each domain owns a MockHandlerMap (keyed by MockRouteKey) and we
 * compose them here. `applyOmitList` runs at module-load time and
 * filters out any routes listed in VITE_MSW_OMIT_KEYS, so those
 * requests pass through to the real API.
 *
 * When adding a new domain:
 *   1. Create mocks/domains/<name>.mock.ts
 *   2. Add its keys to MockRouteKey (mocks/core/types.ts)
 *   3. Spread its map into the object below
 */
const map = applyOmitList({
  ...propertiesHandlers,
});

export const handlers = Object.values(map);
