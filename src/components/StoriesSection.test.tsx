import { render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { server, TEST_BASE_URL } from '../../mocks/setup-test-mocking';
import { StoriesSection } from './StoriesSection';

/**
 * SECTION TEST — StoriesSection hits `/posts`, which is the
 * UNMOCKED endpoint in the app.
 *
 * Because there's no default handler for `/posts`, the test
 * registers one via `server.use(...)`. The global `afterEach`
 * in `setup-test-mocking.ts` resets it back to the default set.
 */
const fakePosts = [
  { userId: 1, id: 1, title: 'Mountain mornings in Zermatt', body: 'Ipsum one.' },
  { userId: 1, id: 2, title: 'Why Bora Bora is worth it', body: 'Ipsum two.' },
  { userId: 2, id: 3, title: 'Night skies over Banff', body: 'Ipsum three.' },
  { userId: 3, id: 4, title: 'A weekend in Oaxaca', body: 'Ipsum four.' },
];

describe('StoriesSection', () => {
  it('renders the four post titles returned by the endpoint', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/posts`, () => HttpResponse.json(fakePosts)),
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

  it('renders nothing when the API errors', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/posts`, () => new HttpResponse(null, { status: 500 })),
    );

    const { container } = render(<StoriesSection />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
