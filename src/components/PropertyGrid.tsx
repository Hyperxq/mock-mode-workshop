import { useProperties } from '../domains/properties/useProperties';
import type { CategoryFilter } from '../domains/properties/types';
import { PropertyCard } from './PropertyCard';

type Props = {
  category: CategoryFilter;
};

export function PropertyGrid({ category }: Props) {
  const { state, refetch } = useProperties();

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse flex-col gap-3"
            aria-hidden
          >
            <div className="aspect-[4/3] rounded-card bg-surface-alt" />
            <div className="h-4 w-3/4 rounded-full bg-surface-alt" />
            <div className="h-3 w-1/2 rounded-full bg-surface-alt" />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-card border border-hairline bg-surface p-6 text-center shadow-card">
        <p className="text-sm font-semibold text-ink">
          Couldn&apos;t load properties
        </p>
        <p className="mt-1 text-xs text-ink-muted">Error: {state.message}</p>
        <p className="mt-3 text-xs text-ink-muted">
          Tip: run <code className="rounded bg-surface-alt px-1.5 py-0.5 font-mono">npm run dev:mock</code>{' '}
          or flip the{' '}
          <span className="font-semibold text-ink">Mock</span> toggle in the header.
        </p>
        <button
          type="button"
          onClick={refetch}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-ink-muted"
        >
          Try again
        </button>
      </div>
    );
  }

  const visible =
    category === 'all'
      ? state.properties
      : state.properties.filter((record) => record.category === category);

  if (visible.length === 0) {
    return (
      <div className="rounded-card border border-hairline bg-surface p-8 text-center">
        <p className="text-sm font-semibold text-ink">No matches</p>
        <p className="mt-1 text-xs text-ink-muted">
          Try a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {visible.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
