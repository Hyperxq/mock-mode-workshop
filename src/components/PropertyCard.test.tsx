import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { Property } from '../domains/properties/types';
import { PropertyCard } from './PropertyCard';

/**
 * PURE COMPONENT UNIT TEST.
 *
 * `PropertyCard` takes a `Property` prop and renders it. Zero
 * dependencies on the mock layer — delete `mocks/` tomorrow and
 * this file still passes.
 */

const property: Property = {
  id: 1,
  title: 'Oceanfront Villa with Infinity Pool',
  location: 'Malibu, California',
  host: 'Ada',
  pricePerNight: 642,
  rating: 4.96,
  reviewCount: 214,
  imageUrl: 'https://example.invalid/photo.jpg',
  category: 'beachfront',
};

describe('PropertyCard', () => {
  it('renders the location as the heading and the host below it', () => {
    render(<PropertyCard property={property} />);

    expect(
      screen.getByRole('heading', { name: 'Malibu, California' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hosted by Ada')).toBeInTheDocument();
  });

  it('shows the price and rating', () => {
    render(<PropertyCard property={property} />);

    expect(screen.getByText('$642')).toBeInTheDocument();
    expect(screen.getByText('4.96')).toBeInTheDocument();
  });

  it('uses imageUrl + title as the image alt', () => {
    render(<PropertyCard property={property} />);

    const image = screen.getByRole('img', { name: property.title });
    expect(image).toHaveAttribute('src', property.imageUrl);
  });

  it('toggles the wishlist button aria-pressed state when clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyCard property={property} />);

    const heart = screen.getByRole('button', { name: /add to wishlist/i });
    expect(heart).toHaveAttribute('aria-pressed', 'false');

    await user.click(heart);

    expect(
      screen.getByRole('button', { name: /remove from wishlist/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
