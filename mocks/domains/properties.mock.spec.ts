import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import type { MockConfig } from '../core/mock.config';
import { propertyHandlers } from './properties.mock';

/**
 * The spec builds its OWN scoped MSW server from the same factory
 * the app uses. We feed it an explicit `MockConfig` so behaviour
 * is deterministic — no env reads, no shared state leaking in.
 */

const BASE_URL = 'https://api.test.local';

const config: MockConfig = {
  omittedKeys: new Set(),
  onUnhandled: 'error',
};

const server = setupServer(...propertyHandlers(config, BASE_URL));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers(...propertyHandlers(config, BASE_URL)));
afterAll(() => server.close());

describe('propertyHandlers', () => {
  it('GET /properties returns every seeded property', async () => {
    const response = await fetch(`${BASE_URL}/properties`);
    expect(response.status).toBe(200);

    const data = (await response.json()) as Array<{ title: string }>;
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toMatchObject({ title: 'Oceanfront Villa with Infinity Pool' });
  });

  it('GET /properties/:id returns the matching property', async () => {
    const response = await fetch(`${BASE_URL}/properties/3`);
    expect(response.status).toBe(200);

    const data = (await response.json()) as { location: string };
    expect(data).toMatchObject({ location: 'Tokyo, Japan' });
  });

  it('GET /properties/:id returns 404 with a domain error message', async () => {
    const response = await fetch(`${BASE_URL}/properties/9999`);
    expect(response.status).toBe(404);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('9999');
  });

  it('POST /properties creates a new property with a generated id', async () => {
    const payload = {
      title: 'Floating Pod on a Lake',
      location: 'Hallstatt, Austria',
      host: 'Linus',
      pricePerNight: 342,
      rating: 4.9,
      reviewCount: 12,
      imageUrl: 'https://picsum.photos/seed/test-pod/800/600',
      category: 'design' as const,
    };

    const response = await fetch(`${BASE_URL}/properties`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(201);

    const data = (await response.json()) as { id: number; title: string };
    expect(data.title).toBe(payload.title);
    expect(data.id).toBeGreaterThan(0);
  });

  it('returns the expected number of handlers per route key', () => {
    const handlers = propertyHandlers(config, BASE_URL);
    expect(handlers).toHaveLength(3);
  });
});
