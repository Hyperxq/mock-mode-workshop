import { setupWorker } from 'msw/browser';

/**
 * The service-worker-powered MSW instance used at runtime in the
 * browser. Import lazily via `mocks/core/init.ts` so the MSW code
 * is tree-shaken out of production bundles that do not enable
 * mock mode.
 *
 * IMPORTANT: we call `setupWorker()` with NO initial handlers. The
 * handlers are registered at boot via `worker.use(...handlers)` and
 * can be swapped in and out at runtime by `useMockStore.toggle()`.
 *
 * Why? Because `worker.stop()` + `worker.start()` between the same
 * session is fragile — service-worker lifecycle quirks mean some
 * in-flight requests can bypass the mocks. Keeping the worker
 * running at all times and mutating its handler list is the reliable
 * pattern recommended by the MSW docs.
 */
export const worker = setupWorker();
