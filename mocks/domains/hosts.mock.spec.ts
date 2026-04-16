import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import type { MockConfig } from '../core/mock.config';
import { hostHandlers } from './hosts.mock';

const BASE_URL = 'https://api.test.local';

const config: MockConfig = {
  omittedKeys: new Set(),
  onUnhandled: 'error',
};

const server = setupServer(...hostHandlers(config, BASE_URL));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers(...hostHandlers(config, BASE_URL)));
afterAll(() => server.close());

describe('hostHandlers', () => {
  it('GET /users returns the curated mocked hosts', async () => {
    const response = await fetch(`${BASE_URL}/users`);
    expect(response.status).toBe(200);

    const data = (await response.json()) as Array<{
      name: string;
      isSuperhost?: boolean;
    }>;
    expect(data).toHaveLength(4);
    expect(data[0]).toMatchObject({ name: 'Ada Lovelace', isSuperhost: true });
  });

  it('mocked hosts carry the isSuperhost flag (absent in real API)', async () => {
    const response = await fetch(`${BASE_URL}/users`);
    const data = (await response.json()) as Array<{ isSuperhost?: boolean }>;

    const superhosts = data.filter((host) => host.isSuperhost);
    expect(superhosts.length).toBeGreaterThan(0);
  });
});
