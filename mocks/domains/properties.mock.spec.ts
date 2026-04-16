import { describe, expect, it } from 'vitest';

const API =
  import.meta.env.VITE_API_BASE ?? 'https://jsonplaceholder.typicode.com';

describe('properties mock handlers', () => {
  it('GET /properties returns the seeded properties', async () => {
    const response = await fetch(`${API}/properties`);
    expect(response.ok).toBe(true);

    const data = (await response.json()) as Array<{ title: string }>;
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toMatchObject({ title: 'Oceanfront Villa with Infinity Pool' });
  });

  it('GET /properties/:id returns the matching property', async () => {
    const response = await fetch(`${API}/properties/3`);
    expect(response.ok).toBe(true);

    const data = (await response.json()) as { location: string };
    expect(data).toMatchObject({ location: 'Tokyo, Japan' });
  });

  it('GET /properties/:id returns 404 when the id does not exist', async () => {
    const response = await fetch(`${API}/properties/9999`);
    expect(response.status).toBe(404);
  });

  it('POST /properties creates a new property and returns it with a generated id', async () => {
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

    const response = await fetch(`${API}/properties`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(201);

    const data = (await response.json()) as { id: number; title: string };
    expect(data.title).toBe(payload.title);
    expect(data.id).toBeGreaterThan(0);
  });
});
