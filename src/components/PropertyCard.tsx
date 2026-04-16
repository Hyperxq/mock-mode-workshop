import { useState } from 'react';
import type { Amenity } from '../domains/amenities/types';
import type { Property } from '../domains/properties/types';

type Props = {
  property: Property;
  /**
   * Optional — full list of amenities; the card filters by
   * `property.id` internally so the grid can fetch the list once
   * and hand the same array to every card.
   */
  amenities?: Amenity[];
};

const MAX_CHIPS = 4;

export function PropertyCard({ property, amenities }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const chips =
    amenities
      ?.filter((amenity) => amenity.propertyIds.includes(property.id))
      .slice(0, MAX_CHIPS) ?? [];

  return (
    <article className="group flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-card bg-surface-alt">
        <img
          src={property.imageUrl}
          alt={property.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <button
          type="button"
          onClick={() => setIsWishlisted((current) => !current)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full text-white transition hover:scale-110"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden
            className="size-6 drop-shadow"
            fill={isWishlisted ? '#ff385c' : 'rgba(0,0,0,0.5)'}
            stroke="white"
            strokeWidth="2"
          >
            <path d="M16 28C16 28 4 20 4 11.5C4 7.36 7.36 4 11.5 4C14 4 16 5.5 16 5.5C16 5.5 18 4 20.5 4C24.64 4 28 7.36 28 11.5C28 20 16 28 16 28Z" />
          </svg>
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink leading-tight">
          {property.location}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm text-ink">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="size-3.5"
            fill="currentColor"
          >
            <path d="m12 2 3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 9.5l7-.5z" />
          </svg>
          {property.rating.toFixed(2)}
        </span>
      </div>

      <p className="-mt-2 text-sm text-ink-muted leading-tight">
        Hosted by {property.host}
      </p>
      <p className="-mt-2 text-sm text-ink-muted leading-tight">
        {property.title}
      </p>

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {chips.map((amenity) => (
            <li
              key={amenity.id}
              className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] text-ink-muted"
            >
              <span aria-hidden>{amenity.icon}</span>
              {amenity.name}
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-ink">
        <span className="font-semibold">${property.pricePerNight}</span>
        <span className="text-ink-muted"> night</span>
      </p>
    </article>
  );
}
