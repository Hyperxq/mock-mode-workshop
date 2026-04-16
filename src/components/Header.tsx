import { MockToggle } from './MockToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <a href="/" className="flex items-center gap-2 text-rausch">
          <svg
            viewBox="0 0 32 32"
            aria-hidden
            className="size-7"
            fill="currentColor"
          >
            <path d="M16 1c3.5 0 6.3 2.4 6.3 5.6 0 1.3-.5 2.6-1.3 4L16 19l-5-8.4c-.9-1.4-1.3-2.7-1.3-4C9.7 3.4 12.5 1 16 1zm0 3c-1.7 0-2.9 1.1-2.9 2.7 0 .7.2 1.4.8 2.3L16 13l2.1-4c.6-.9.8-1.6.8-2.3C18.9 5.1 17.7 4 16 4zM9.3 16.9c4.5 7.6 5.9 10.2 5.9 12.2 0 1-.8 1.8-1.8 1.8s-1.7-.7-1.8-1.6c-.8 1-1.9 1.6-3.2 1.6-2.3 0-4.1-1.9-4.1-4.2 0-2 1-3.2 3.6-4.4 1.2-.5 1.5-.8 1.5-1.3 0-.4-.3-.7-.8-.7-.7 0-1.4.3-2.1.9l-1.3-1.8c1-.9 2.3-1.4 3.6-1.4.8 0 1.5.2 2.1.7-.1-.6-.2-1.2-.2-1.8l-1.4 0zm12.2 0c0 .6-.1 1.2-.2 1.8.6-.5 1.3-.7 2.1-.7 1.3 0 2.6.5 3.6 1.4l-1.3 1.8c-.7-.6-1.4-.9-2.1-.9-.5 0-.8.3-.8.7 0 .5.3.8 1.5 1.3 2.6 1.2 3.6 2.4 3.6 4.4 0 2.3-1.8 4.2-4.1 4.2-1.3 0-2.4-.6-3.2-1.6-.1.9-.8 1.6-1.8 1.6s-1.8-.8-1.8-1.8c0-2 1.4-4.6 5.9-12.2h-1.4z" />
          </svg>
          <span className="hidden text-lg font-bold text-ink sm:inline">
            stayvibe
          </span>
        </a>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 shadow-float">
            <label htmlFor="stayvibe-search" className="sr-only">
              Search destinations
            </label>
            <input
              id="stayvibe-search"
              type="search"
              placeholder="Where to? · Any week · Add guests"
              className="flex-1 border-0 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="button"
              aria-label="Search"
              className="inline-flex size-8 items-center justify-center rounded-full bg-rausch text-white transition hover:bg-rausch-dark"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="size-4"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MockToggle />
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-hairline bg-surface px-2 transition hover:shadow-float"
            aria-label="Account"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
              className="size-4 text-ink"
            >
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
              A
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
