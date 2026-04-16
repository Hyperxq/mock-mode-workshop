import { create } from 'zustand';

type MockStore = {
  /** Whether handlers are currently registered with the worker. */
  isEnabled: boolean;
  /** Whether mocking was bootstrapped for this session. */
  isAvailable: boolean;
  /** Swap handlers in or out of the running worker. */
  toggle: () => Promise<void>;
};

const enabledAtBoot = import.meta.env.VITE_ENABLE_MOCKING === 'true';

/**
 * Runtime toggle for MSW.
 *
 * Implementation detail — the worker is started exactly ONCE at app
 * boot (see `mocks/core/init.ts`). Toggling does NOT call
 * `worker.stop()` / `worker.start()` because restarting a service
 * worker mid-session is unreliable (some in-flight requests slip
 * through un-mocked).
 *
 * Instead we mutate the handler list on the live worker:
 *   - Toggle OFF -> `worker.resetHandlers()` wipes all handlers.
 *     With zero handlers registered, everything falls through to
 *     `onUnhandledRequest: 'bypass'` and hits the real network.
 *   - Toggle ON  -> `worker.use(...handlers)` re-registers them.
 *
 * This is the reliable pattern from the MSW docs.
 */
export const useMockStore = create<MockStore>((set, get) => ({
  isEnabled: enabledAtBoot,
  isAvailable: enabledAtBoot,

  toggle: async () => {
    if (!get().isAvailable) return;

    const { worker } = await import('../../mocks/browser');
    const { handlers } = await import('../../mocks/handlers');

    if (get().isEnabled) {
      worker.resetHandlers();
      set({ isEnabled: false });
      // eslint-disable-next-line no-console
      console.info('[MSW] Handlers cleared — requests pass through to network');
      return;
    }

    worker.use(...handlers);
    set({ isEnabled: true });
    // eslint-disable-next-line no-console
    console.info('[MSW] Handlers re-registered — mocking again');
  },
}));
