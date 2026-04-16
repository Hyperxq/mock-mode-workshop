import { useState } from 'react';
import { CategoryPills } from './components/CategoryPills';
import { Header } from './components/Header';
import { HostsSection } from './components/HostsSection';
import { PropertyGrid } from './components/PropertyGrid';
import { StoriesSection } from './components/StoriesSection';
import type { CategoryFilter } from './domains/properties/types';

export default function App() {
  const [category, setCategory] = useState<CategoryFilter>('all');

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <CategoryPills active={category} onChange={setCategory} />
      <HostsSection />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <PropertyGrid category={category} />
      </main>
      <StoriesSection />
      <footer className="mt-16 border-t border-hairline bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-ink-muted">
          <span>stayvibe is a workshop reference app.</span>{' '}
          <span>
            Data served by MSW v2 mocks — see <code className="font-mono">WORKSHOP.md</code>.
          </span>
        </div>
      </footer>
    </div>
  );
}
