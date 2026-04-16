import { useMockStore } from '../stores/mock.store';

export function MockToggle() {
  const isEnabled = useMockStore((store) => store.isEnabled);
  const isAvailable = useMockStore((store) => store.isAvailable);
  const toggle = useMockStore((store) => store.toggle);

  // When VITE_ENABLE_MOCKING is not "true" at boot, the worker is
  // never registered. We render the control as a disabled pill so
  // the user can see mocking exists as a concept and how to turn
  // it on — without giving a false affordance.
  if (!isAvailable) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-alt px-3 py-1.5 text-xs font-semibold text-ink-muted opacity-80"
        title="Mock mode is unavailable. Set VITE_ENABLE_MOCKING=true in .env.mock (or run `npm run dev:mock`) and restart to enable."
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="size-3.5"
          fill="currentColor"
        >
          <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2zm-7-2a3 3 0 0 1 6 0v2h-6V7zm7 12H7V11h10v8z" />
        </svg>
        Mock unavailable
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        void toggle();
      }}
      className={
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ' +
        (isEnabled
          ? 'bg-rausch text-white hover:bg-rausch-dark'
          : 'bg-surface-alt text-ink hover:bg-ink/10')
      }
      aria-pressed={isEnabled}
      title={isEnabled ? 'MSW is intercepting requests' : 'Click to enable MSW'}
    >
      <span
        className={
          'size-1.5 rounded-full ' + (isEnabled ? 'bg-white' : 'bg-ink-soft')
        }
        aria-hidden
      />
      Mock {isEnabled ? 'ON' : 'OFF'}
    </button>
  );
}
