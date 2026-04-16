import { HttpResponse, delay, http, passthrough } from 'msw';
import { notFound } from '../core/errors';
import { shouldMock, type MockConfig } from '../core/mock.config';
import { joinUrl } from '../core/url';

/**
 * PROPERTIES DOMAIN — the reference factory.
 *
 * Every mock domain is exported as a *function* that takes the
 * shared `MockConfig` and the base URL, and returns an array of
 * MSW `HttpHandler`s. Two benefits fall out of that shape:
 *
 *   1. Testing is trivial — `tests/setup.ts` builds its own config
 *      and plugs it in, no env reads at import time.
 *   2. Hybrid mode works at handler granularity: a handler whose
 *      key is in `config.omittedKeys` returns `passthrough()`, so
 *      only THAT handler lets the request escape to the real API.
 *
 * Handlers only carry PATHS. The base URL is joined at composition
 * time via `joinUrl`, which keeps the domain file independent from
 * whatever env the app is running under.
 */

export type PropertyCategory =
  | 'beachfront'
  | 'cabin'
  | 'city'
  | 'tropical'
  | 'mountain'
  | 'design';

export interface Property {
  id: number;
  title: string;
  location: string;
  host: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  category: PropertyCategory;
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

const seed: Property[] = [
  { id: 1, title: 'Oceanfront Villa with Infinity Pool', location: 'Malibu, California', host: 'Ada', pricePerNight: 642, rating: 4.96, reviewCount: 214, imageUrl: img('prop-malibu'), category: 'beachfront' },
  { id: 2, title: 'A-Frame Cabin in the Redwoods', location: 'Mendocino, California', host: 'Grace', pricePerNight: 289, rating: 4.88, reviewCount: 156, imageUrl: img('prop-redwoods'), category: 'cabin' },
  { id: 3, title: 'Designer Loft Overlooking the Skyline', location: 'Tokyo, Japan', host: 'Alan', pricePerNight: 412, rating: 4.92, reviewCount: 389, imageUrl: img('prop-tokyo'), category: 'city' },
  { id: 4, title: 'Treehouse Bungalow with Jungle Views', location: 'Ubud, Bali', host: 'Margaret', pricePerNight: 178, rating: 4.97, reviewCount: 512, imageUrl: img('prop-ubud'), category: 'tropical' },
  { id: 5, title: 'Chalet at 2,100m with Private Sauna', location: 'Zermatt, Switzerland', host: 'Ada', pricePerNight: 533, rating: 4.94, reviewCount: 98, imageUrl: img('prop-zermatt'), category: 'mountain' },
  { id: 6, title: 'Mid-Century Glass House in the Desert', location: 'Palm Springs, California', host: 'Grace', pricePerNight: 387, rating: 4.91, reviewCount: 243, imageUrl: img('prop-palm-springs'), category: 'design' },
  { id: 7, title: 'Beach Shack Steps from the Reef', location: 'Tulum, Mexico', host: 'Alan', pricePerNight: 198, rating: 4.85, reviewCount: 321, imageUrl: img('prop-tulum'), category: 'beachfront' },
  { id: 8, title: 'Log Cabin with Wood-Fired Hot Tub', location: 'Banff, Canada', host: 'Margaret', pricePerNight: 265, rating: 4.93, reviewCount: 172, imageUrl: img('prop-banff'), category: 'cabin' },
  { id: 9, title: 'Artist Atelier Near the Seine', location: 'Paris, France', host: 'Ada', pricePerNight: 356, rating: 4.89, reviewCount: 284, imageUrl: img('prop-paris'), category: 'city' },
  { id: 10, title: 'Overwater Bungalow with Glass Floor', location: 'Bora Bora, French Polynesia', host: 'Grace', pricePerNight: 1120, rating: 4.98, reviewCount: 87, imageUrl: img('prop-bora-bora'), category: 'tropical' },
  { id: 11, title: 'Stone Chalet with Fireplace', location: 'Dolomites, Italy', host: 'Alan', pricePerNight: 298, rating: 4.87, reviewCount: 146, imageUrl: img('prop-dolomites'), category: 'mountain' },
  { id: 12, title: 'Brutalist Concrete Retreat', location: 'Oaxaca, Mexico', host: 'Margaret', pricePerNight: 224, rating: 4.9, reviewCount: 131, imageUrl: img('prop-oaxaca'), category: 'design' },
];

export function propertyHandlers(config: MockConfig, baseUrl: string) {
  const properties = [...seed];
  let nextId = properties.length + 1;
  const url = (path: string) => joinUrl(baseUrl, path);

  return [
    // GET /properties — list every property
    http.get(url('/properties'), async () => {
      if (!shouldMock(config, 'GET_PROPERTIES')) return passthrough();
      await delay(400);
      return HttpResponse.json(properties);
    }),

    // GET /properties/:id — fetch a single property
    http.get(url('/properties/:id'), async ({ params }) => {
      if (!shouldMock(config, 'GET_PROPERTY')) return passthrough();
      await delay(200);
      const property = properties.find((record) => record.id === Number(params.id));
      if (!property) return notFound(`Property ${String(params.id)} not found`);
      return HttpResponse.json(property);
    }),

    // POST /properties — add a new one to the in-memory list
    http.post(url('/properties'), async ({ request }) => {
      if (!shouldMock(config, 'CREATE_PROPERTY')) return passthrough();
      await delay(300);
      const body = (await request.json()) as Omit<Property, 'id'>;
      const created: Property = { ...body, id: nextId++ };
      properties.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),
  ];
}
