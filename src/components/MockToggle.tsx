import { useMockStore } from '../stores/mock.store';

export function MockToggle() {
  const isEnabled = useMockStore((store) => store.isEnabled);
  const isAvailable = useMockStore((store) => store.isAvailable);
  const toggle = useMockStore((store) => store.toggle);

  if (!isAvailable) {
    return (
      <span
        className="hidden rounded-full bg-surface-alt px-3 py-1 text-xs text-ink-muted md:inline"
        title="Set VITE_ENABLE_MOCKING=true to enable"
      >
        Mock off
      </span>
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
