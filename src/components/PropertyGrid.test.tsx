import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { PropertyGrid } from './PropertyGrid';

/**
 * SECTION TEST — PropertyGrid rendered against the MSW handlers.
 * Server is wired globally in `mocks/setup-test-mocking.ts`.
 */
describe('PropertyGrid', () => {
  it('renders every property when category is "all"', async () => {
    render(<PropertyGrid category="all" />);

    await waitFor(() => {
      expect(screen.getByText(/Oceanfront Villa/)).toBeInTheDocument();
    });

    expect(screen.getAllByRole('article')).toHaveLength(12);
  });

  it('filters cards when a category is selected', async () => {
    render(<PropertyGrid category="beachfront" />);

    await waitFor(() => {
      expect(screen.getByText('Malibu, California')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Tulum, Mexico')).toBeInTheDocument();
    expect(screen.queryByText('Tokyo, Japan')).not.toBeInTheDocument();
  });
});
