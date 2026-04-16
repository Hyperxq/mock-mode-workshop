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

export type CategoryFilter = PropertyCategory | 'all';

export const CATEGORIES: ReadonlyArray<{
  key: CategoryFilter;
  label: string;
  icon: string;
}> = [
  { key: 'all', label: 'All', icon: '\u2728' },
  { key: 'beachfront', label: 'Beachfront', icon: '\uD83C\uDFD6\uFE0F' },
  { key: 'cabin', label: 'Cabins', icon: '\uD83D\uDD32' },
  { key: 'city', label: 'City', icon: '\uD83C\uDFD9\uFE0F' },
  { key: 'tropical', label: 'Tropical', icon: '\uD83C\uDF34' },
  { key: 'mountain', label: 'Mountain', icon: '\u26F0\uFE0F' },
  { key: 'design', label: 'Design', icon: '\uD83C\uDFDB\uFE0F' },
];
