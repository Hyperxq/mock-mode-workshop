import { describe, expect, it } from 'vitest';

const API =
  import.meta.env.VITE_API_BASE ?? 'https://jsonplaceholder.typicode.com';

describe('hosts mock handlers', () => {
  it('GET /users returns the curated mocked hosts', async () => {
    const response = await fetch(`${API}/users`);
    expect(response.ok).toBe(true);

    const data = (await response.json()) as Array<{
      name: string;
      isSuperhost?: boolean;
    }>;
    expect(data.length).toBe(4);
    expect(data[0]).toMatchObject({ name: 'Ada Lovelace', isSuperhost: true });
  });

  it('mocked hosts carry the isSuperhost flag (absent in real API)', async () => {
    const response = await fetch(`${API}/users`);
    const data = (await response.json()) as Array<{ isSuperhost?: boolean }>;

    const superhosts = data.filter((host) => host.isSuperhost);
    expect(superhosts.length).toBeGreaterThan(0);
  });
});
