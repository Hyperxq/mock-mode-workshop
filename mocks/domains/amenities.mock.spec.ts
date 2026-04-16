import { describe, expect, it } from 'vitest';
import { TEST_BASE_URL } from '../setup-test-mocking';

/**
 * Handler spec for the amenities domain.
 *
 * The MSW server is registered globally in
 * `mocks/setup-test-mocking.ts`; this file just calls `fetch`
 * and asserts the canned responses.
 */
describe('amenityHandlers', () => {
  it('GET /amenities returns the seeded list', async () => {
    const response = await fetch(`${TEST_BASE_URL}/amenities`);
    expect(response.status).toBe(200);

    const data = (await response.json()) as Array<{
      name: string;
      propertyIds: number[];
    }>;
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toMatchObject({ name: 'WiFi' });
    expect(data[0].propertyIds).toContain(1);
  });

  it('every amenity declares at least one property', async () => {
    const response = await fetch(`${TEST_BASE_URL}/amenities`);
    const data = (await response.json()) as Array<{ propertyIds: number[] }>;

    for (const amenity of data) {
      expect(amenity.propertyIds.length).toBeGreaterThan(0);
    }
  });
});
