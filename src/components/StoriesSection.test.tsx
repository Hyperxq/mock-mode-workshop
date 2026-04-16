import { render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { StoriesSection } from './StoriesSection';

/**
 * SECTION TEST — StoriesSection hits `/posts`, which is the
 * UNMOCKED endpoint in the app (it bypasses the worker in the
 * browser and hits the real API).
 *
 * In tests we can't let it hit the real network, so we register
 * a scoped handler here via `server.use()`. Note that this fixture
 * lives in the test file — not in `mocks/domains/` — because the
 * endpoint is deliberately unmocked at the app layer. That is the
 * right place for test-only fixtures.
 */

const API = 'https://jsonplaceholder.typicode.com';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const fakePosts = [
  { userId: 1, id: 1, title: 'Mountain mornings in Zermatt', body: 'Ipsum body one.' },
  { userId: 1, id: 2, title: 'Why Bora Bora is worth it', body: 'Ipsum body two.' },
  { userId: 2, id: 3, title: 'Night skies over Banff', body: 'Ipsum body three.' },
  { userId: 3, id: 4, title: 'A weekend in Oaxaca', body: 'Ipsum body four.' },
];

describe('StoriesSection', () => {
  it('renders the four post titles returned by the endpoint', async () => {
    server.use(
      http.get(`${API}/posts`, () => HttpResponse.json(fakePosts)),
    );

    render(<StoriesSection />);

    await waitFor(() => {
      expect(
        screen.getByText('Mountain mornings in Zermatt'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Why Bora Bora is worth it')).toBeInTheDocument();
    expect(screen.getByText('Night skies over Banff')).toBeInTheDocument();
    expect(screen.getByText('A weekend in Oaxaca')).toBeInTheDocument();
  });

  it('renders nothing (returns null) when the API errors', async () => {
    server.use(
      http.get(`${API}/posts`, () => new HttpResponse(null, { status: 500 })),
    );

    const { container } = render(<StoriesSection />);

    // Wait a tick for the rejected promise to settle.
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
