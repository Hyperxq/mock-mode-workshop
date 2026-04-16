import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { MockConfig } from '../../mocks/core/mock.config';
import { createHandlers } from '../../mocks/handlers';
import { HostsSection } from './HostsSection';

/**
 * SECTION TEST — HostsSection renders what MSW hands it.
 *
 * The whole point of this test is to avoid the "let me hardcode
 * four user objects at the top of the file" trap. The `hostHandlers`
 * factory already knows what a canonical Host list looks like;
 * by feeding those same handlers into `msw/node` we get the real
 * fixture for free. One source of truth — the app uses it in
 * dev, this test uses it in Node.
 *
 * Note: this test IS coupled to the mock layer, on purpose. If
 * you delete `mocks/`, it fails — that's the signal you're also
 * deleting the fixture it leans on.
 */

const API = 'https://jsonplaceholder.typicode.com';

const config: MockConfig = { omittedKeys: new Set(), onUnhandled: 'error' };
const server = setupServer(...createHandlers(config, API));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers(...createHandlers(config, API)));
afterAll(() => server.close());

describe('HostsSection', () => {
  it('renders the four mocked hosts served by the /users handler', async () => {
    render(<HostsSection />);

    // Loading skeleton first, then the data
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });

    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Margaret Hamilton')).toBeInTheDocument();
    expect(screen.getByText('4 hosts')).toBeInTheDocument();
  });
});
