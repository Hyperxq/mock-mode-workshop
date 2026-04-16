import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { MockConfig } from '../../mocks/core/mock.config';
import { createHandlers } from '../../mocks/handlers';
import { PropertyGrid } from './PropertyGrid';

/**
 * SECTION TEST — PropertyGrid rendered against MSW handlers.
 *
 * Instead of crafting twelve fake properties inline (ugly and
 * fragile), this test feeds the component with the real mock
 * data the app sees in dev. When the `propertyHandlers` fixture
 * changes, this test moves with it — no parallel maintenance.
 */

const API = 'https://jsonplaceholder.typicode.com';

const config: MockConfig = { omittedKeys: new Set(), onUnhandled: 'error' };
const server = setupServer(...createHandlers(config, API));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers(...createHandlers(config, API)));
afterAll(() => server.close());

describe('PropertyGrid', () => {
  it('renders every property when category is "all"', async () => {
    render(<PropertyGrid category="all" />);

    await waitFor(() => {
      expect(screen.getByText(/Oceanfront Villa/)).toBeInTheDocument();
    });

    // Category heading text updates from Loading… to the real cards.
    expect(screen.getAllByRole('article')).toHaveLength(12);
  });

  it('filters cards when a category is selected', async () => {
    render(<PropertyGrid category="beachfront" />);

    await waitFor(() => {
      expect(screen.getByText('Malibu, California')).toBeInTheDocument();
    });

    // Only two seeded properties are beachfront — Malibu + Tulum.
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Tulum, Mexico')).toBeInTheDocument();
    expect(screen.queryByText('Tokyo, Japan')).not.toBeInTheDocument();
  });
});
