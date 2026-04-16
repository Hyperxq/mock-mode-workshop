import { usePosts } from '../domains/posts/usePosts';

/**
 * "Travel stories" — pulls /posts from JSONPlaceholder with NO
 * mock handler. Demonstrates that unmocked endpoints bypass the
 * worker automatically (see `onUnhandledRequest: 'bypass'` in
 * `mocks/core/init.ts`).
 */
export function StoriesSection() {
  const { state } = usePosts(4);

  if (state.status === 'error') return null;

  return (
    <section className="border-t border-hairline bg-surface-alt/40">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Travel stories</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Pulled from JSONPlaceholder — no mock handler defined, always
              served by the real API even when mocks are on.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-surface px-2 py-1 text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
            Unmocked
          </span>
        </header>

        {state.status === 'success' ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {state.posts.map((post) => (
              <li
                key={post.id}
                className="rounded-card border border-hairline bg-surface p-4 shadow-card"
              >
                <h3 className="line-clamp-2 text-sm font-semibold text-ink capitalize">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs text-ink-muted">
                  {post.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" aria-hidden>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-card border border-hairline bg-surface-alt"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
