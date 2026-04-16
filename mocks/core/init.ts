/**
 * Initializes the MSW browser worker when mock mode is enabled.
 *
 * CRITICAL DETAIL — the dynamic import:
 *
 *   await import('../browser');
 *
 * When VITE_ENABLE_MOCKING is not "true", this function returns
 * immediately and the `../browser` module is NEVER imported. Because
 * the import is dynamic (not static), the bundler can split MSW into
 * a separate chunk that is only downloaded when mocks are active.
 *
 * That is why in production builds with mocking OFF, the MSW code
 * weighs ZERO bytes in the main bundle. Tree-shaking via dynamic
 * import — a pattern every mid+ frontend dev should know.
 *
 * After starting the worker we register the handlers via
 * `worker.use(...)`. The runtime toggle in `useMockStore` flips them
 * in and out of the live worker without ever stopping it.
 */
export async function initMocking(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKING !== 'true') {
    return;
  }

  const { worker } = await import('../browser');
  const { handlers } = await import('../handlers');

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  worker.use(...handlers);

  // eslint-disable-next-line no-console
  console.info('[MSW] Mock mode ENABLED — worker is intercepting requests');
}
