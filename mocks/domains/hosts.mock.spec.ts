import { describe, expect, it } from 'vitest';
import { TEST_BASE_URL } from '../setup-test-mocking';

/**
 * Handler spec for the hosts domain.
 *
 * The MSW server is registered globally in
 * `mocks/setup-test-mocking.ts`; this file just calls `fetch` and
 * asserts the canned responses.
 */
describe('hostHandlers', () => {
  it('GET /users returns the curated mocked hosts', async () => {
    const response = await fetch(`${TEST_BASE_URL}/users`);
    expect(response.status).toBe(200);

    const data = (await response.json()) as Array<{
      name: string;
      isSuperhost?: boolean;
    }>;
    expect(data).toHaveLength(4);
    expect(data[0]).toMatchObject({ name: 'Ada Lovelace', isSuperhost: true });
  });

  it('mocked hosts carry the isSuperhost flag (absent in real API)', async () => {
    const response = await fetch(`${TEST_BASE_URL}/users`);
    const data = (await response.json()) as Array<{ isSuperhost?: boolean }>;

    const superhosts = data.filter((host) => host.isSuperhost);
    expect(superhosts.length).toBeGreaterThan(0);
  });
});
