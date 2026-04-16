import { HttpResponse, delay, http } from 'msw';
import type { MockHandlerMap } from '../core/types';

/**
 * PROPERTIES DOMAIN — reference example for the workshop.
 *
 * The app consumes `/properties` as if it were a real backend route.
 * When mock mode is ON, these handlers intercept the requests and
 * serve the seed data below. When mock mode is OFF (or this key is
 * listed in VITE_MSW_OMIT_KEYS), the request hits the configured
 * VITE_API_BASE — which in the workshop default is JSONPlaceholder,
 * so the request will 404. That is intentional — it makes "why do
 * we need mocks at all" obvious.
 */

const API = import.meta.env.VITE_API_BASE ?? 'https://jsonplaceholder.typicode.com';

export type PropertyCategory =
  | 'beachfront'
  | 'cabin'
  | 'city'
  | 'tropical'
  | 'mountain'
  | 'design';

export type Property = {
  id: number;
  title: string;
  location: string;
  host: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  category: PropertyCategory;
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

const properties: Property[] = [
  {
    id: 1,
    title: 'Oceanfront Villa with Infinity Pool',
    location: 'Malibu, California',
    host: 'Ada',
    pricePerNight: 642,
    rating: 4.96,
    reviewCount: 214,
    imageUrl: img('prop-malibu'),
    category: 'beachfront',
  },
  {
    id: 2,
    title: 'A-Frame Cabin in the Redwoods',
    location: 'Mendocino, California',
    host: 'Grace',
    pricePerNight: 289,
    rating: 4.88,
    reviewCount: 156,
    imageUrl: img('prop-redwoods'),
    category: 'cabin',
  },
  {
    id: 3,
    title: 'Designer Loft Overlooking the Skyline',
    location: 'Tokyo, Japan',
    host: 'Alan',
    pricePerNight: 412,
    rating: 4.92,
    reviewCount: 389,
    imageUrl: img('prop-tokyo'),
    category: 'city',
  },
  {
    id: 4,
    title: 'Treehouse Bungalow with Jungle Views',
    location: 'Ubud, Bali',
    host: 'Margaret',
    pricePerNight: 178,
    rating: 4.97,
    reviewCount: 512,
    imageUrl: img('prop-ubud'),
    category: 'tropical',
  },
  {
    id: 5,
    title: 'Chalet at 2,100m with Private Sauna',
    location: 'Zermatt, Switzerland',
    host: 'Ada',
    pricePerNight: 533,
    rating: 4.94,
    reviewCount: 98,
    imageUrl: img('prop-zermatt'),
    category: 'mountain',
  },
  {
    id: 6,
    title: 'Mid-Century Glass House in the Desert',
    location: 'Palm Springs, California',
    host: 'Grace',
    pricePerNight: 387,
    rating: 4.91,
    reviewCount: 243,
    imageUrl: img('prop-palm-springs'),
    category: 'design',
  },
  {
    id: 7,
    title: 'Beach Shack Steps from the Reef',
    location: 'Tulum, Mexico',
    host: 'Alan',
    pricePerNight: 198,
    rating: 4.85,
    reviewCount: 321,
    imageUrl: img('prop-tulum'),
    category: 'beachfront',
  },
  {
    id: 8,
    title: 'Log Cabin with Wood-Fired Hot Tub',
    location: 'Banff, Canada',
    host: 'Margaret',
    pricePerNight: 265,
    rating: 4.93,
    reviewCount: 172,
    imageUrl: img('prop-banff'),
    category: 'cabin',
  },
  {
    id: 9,
    title: 'Artist Atelier Near the Seine',
    location: 'Paris, France',
    host: 'Ada',
    pricePerNight: 356,
    rating: 4.89,
    reviewCount: 284,
    imageUrl: img('prop-paris'),
    category: 'city',
  },
  {
    id: 10,
    title: 'Overwater Bungalow with Glass Floor',
    location: 'Bora Bora, French Polynesia',
    host: 'Grace',
    pricePerNight: 1120,
    rating: 4.98,
    reviewCount: 87,
    imageUrl: img('prop-bora-bora'),
    category: 'tropical',
  },
  {
    id: 11,
    title: 'Stone Chalet with Fireplace',
    location: 'Dolomites, Italy',
    host: 'Alan',
    pricePerNight: 298,
    rating: 4.87,
    reviewCount: 146,
    imageUrl: img('prop-dolomites'),
    category: 'mountain',
  },
  {
    id: 12,
    title: 'Brutalist Concrete Retreat',
    location: 'Oaxaca, Mexico',
    host: 'Margaret',
    pricePerNight: 224,
    rating: 4.9,
    reviewCount: 131,
    imageUrl: img('prop-oaxaca'),
    category: 'design',
  },
];

export const propertiesHandlers: MockHandlerMap = {
  GET_PROPERTIES: http.get(`${API}/properties`, async () => {
    await delay(400);
    return HttpResponse.json(properties);
  }),

  GET_PROPERTY: http.get(`${API}/properties/:id`, async ({ params }) => {
    await delay(200);
    const id = Number(params.id);
    const property = properties.find((record) => record.id === id);
    if (!property) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(property);
  }),

  CREATE_PROPERTY: http.post(`${API}/properties`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as Omit<Property, 'id'>;
    const created: Property = { ...body, id: properties.length + 1 };
    properties.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
};
