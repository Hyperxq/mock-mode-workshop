import type { Host } from '../domains/hosts/types';
import { useHosts } from '../domains/hosts/useHosts';

const AVATAR_BG = [
  'bg-rose-200 text-rose-900',
  'bg-amber-200 text-amber-900',
  'bg-emerald-200 text-emerald-900',
  'bg-sky-200 text-sky-900',
  'bg-violet-200 text-violet-900',
  'bg-teal-200 text-teal-900',
  'bg-orange-200 text-orange-900',
  'bg-indigo-200 text-indigo-900',
];

function initialsColor(id: number): string {
  return AVATAR_BG[id % AVATAR_BG.length] ?? AVATAR_BG[0];
}

function HostCard({ host }: { host: Host }) {
  const initial = host.name.charAt(0).toUpperCase();

  return (
    <article className="flex w-20 shrink-0 flex-col items-center gap-2">
      <div className="relative">
        {host.avatarUrl ? (
          <img
            src={host.avatarUrl}
            alt={host.name}
            loading="lazy"
            className="size-14 rounded-full object-cover"
          />
        ) : (
          <div
            className={
              'flex size-14 items-center justify-center rounded-full text-lg font-semibold ' +
              initialsColor(host.id)
            }
            aria-hidden
          >
            {initial}
          </div>
        )}
        {host.isSuperhost ? (
          <span
            className="absolute -right-1 -bottom-1 inline-flex size-5 items-center justify-center rounded-full bg-rausch text-white"
            title="Superhost"
            aria-label="Superhost"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
              className="size-3"
            >
              <path d="m12 2 3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 9.5l7-.5z" />
            </svg>
          </span>
        ) : null}
      </div>
      <p className="w-full truncate text-center text-xs font-semibold text-ink">
        {host.name}
      </p>
    </article>
  );
}

function Skeleton() {
  return (
    <div
      className="no-scrollbar flex gap-6 overflow-x-auto pb-2"
      aria-hidden
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex w-20 shrink-0 flex-col items-center gap-2">
          <div className="size-14 animate-pulse rounded-full bg-surface-alt" />
          <div className="h-3 w-14 animate-pulse rounded-full bg-surface-alt" />
        </div>
      ))}
    </div>
  );
}

export function HostsSection() {
  const { state } = useHosts();

  // When the real API fails (or mock is off AND the real endpoint
  // is down), just hide the section quietly — don't spam the user.
  if (state.status === 'error') return null;

  return (
    <section className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Meet your hosts</h2>
          <span className="text-xs text-ink-muted">
            {state.status === 'success'
              ? `${state.hosts.length} host${state.hosts.length === 1 ? '' : 's'}`
              : 'loading…'}
          </span>
        </header>
        {state.status === 'success' ? (
          <div className="no-scrollbar flex gap-6 overflow-x-auto pb-2">
            {state.hosts.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        ) : (
          <Skeleton />
        )}
      </div>
    </section>
  );
}
