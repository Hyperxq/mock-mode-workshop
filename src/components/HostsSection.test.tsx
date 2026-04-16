import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { HostsSection } from './HostsSection';

/**
 * SECTION TEST — HostsSection renders whatever the MSW `/users`
 * handler returns. Server is wired globally in
 * `mocks/setup-test-mocking.ts`.
 */
describe('HostsSection', () => {
  it('renders the four mocked hosts served by the /users handler', async () => {
    render(<HostsSection />);

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });

    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Margaret Hamilton')).toBeInTheDocument();
    expect(screen.getByText('4 hosts')).toBeInTheDocument();
  });
});
