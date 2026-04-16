import { CATEGORIES, type CategoryFilter } from '../domains/properties/types';

type Props = {
  active: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
};

export function CategoryPills({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Categories"
      className="no-scrollbar sticky top-[73px] z-10 overflow-x-auto border-b border-hairline bg-surface/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-7xl gap-8 px-6 py-4">
        {CATEGORIES.map((category) => {
          const isActive = category.key === active;
          return (
            <li key={category.key}>
              <button
                type="button"
                onClick={() => onChange(category.key)}
                className={
                  'flex min-w-16 flex-col items-center gap-1.5 border-b-2 pb-2 transition ' +
                  (isActive
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink-muted hover:border-hairline hover:text-ink')
                }
                aria-pressed={isActive}
              >
                <span className="text-2xl" aria-hidden>
                  {category.icon}
                </span>
                <span className="text-xs font-semibold whitespace-nowrap">
                  {category.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
