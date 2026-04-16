import { HttpResponse, delay, http, passthrough } from 'msw';
import { shouldMock, type MockConfig } from '../core/mock.config';
import { joinUrl } from '../core/url';

/**
 * AMENITIES DOMAIN — the exercise solution.
 *
 * Each amenity carries the list of property ids that offer it,
 * letting the UI render chips on every property card without a
 * second round-trip. A real backend would probably split this
 * across two endpoints; for the workshop one list is plenty.
 */

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  propertyIds: number[];
}

const seed: Amenity[] = [
  { id: 1, name: 'WiFi', icon: '\uD83D\uDCF6', propertyIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { id: 2, name: 'Pool', icon: '\uD83C\uDFCA', propertyIds: [1, 6, 7, 10] },
  { id: 3, name: 'Kitchen', icon: '\uD83C\uDF73', propertyIds: [2, 4, 5, 8, 9, 11] },
  { id: 4, name: 'Fireplace', icon: '\uD83D\uDD25', propertyIds: [2, 5, 8, 11] },
  { id: 5, name: 'Hot tub', icon: '\u2668\uFE0F', propertyIds: [5, 8] },
  { id: 6, name: 'Ocean view', icon: '\uD83C\uDF0A', propertyIds: [1, 7, 10] },
  { id: 7, name: 'Mountain view', icon: '\u26F0\uFE0F', propertyIds: [5, 8, 11] },
  { id: 8, name: 'Pet friendly', icon: '\uD83D\uDC3E', propertyIds: [2, 4, 6, 9, 12] },
];

export function amenityHandlers(config: MockConfig, baseUrl: string) {
  const url = (path: string) => joinUrl(baseUrl, path);

  return [
    http.get(url('/amenities'), async () => {
      if (!shouldMock(config, 'GET_AMENITIES')) return passthrough();
      await delay(200);
      return HttpResponse.json(seed);
    }),
  ];
}
