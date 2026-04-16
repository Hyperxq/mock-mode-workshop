# Mock Mode Workshop

An Airbnb-styled listings app built with React 19 + Vite, wired with
**MSW v2** and **Zustand** to demonstrate how to build a frontend
without a backend.

The UI follows the design system captured in [DESIGN.md](./DESIGN.md)
(Rausch Red, three-layer shadows, rounded system font, photo-first
cards). The data comes from mocked `/properties` and `/properties/:id`
routes served by MSW in the browser — with a runtime toggle in the
header to flip mocking on and off.

---

## Why this repo exists

Most teams wait for the backend to start a feature. That's a waste.
With MSW you can:

1. Define the API contract in TypeScript.
2. Serve it from a Service Worker (browser) or Node interceptor (tests).
3. Ship the UI while the backend catches up.
4. Flip individual routes to the real backend as they come online
   (hybrid mode).

This repo is the reference implementation for a 1-hour hands-on
workshop. See [WORKSHOP.md](./WORKSHOP.md) for the exercise.

---

## Stack

- **React 19** + TypeScript
- **Vite 8** (dev server + build)
- **Tailwind CSS 4** (CSS-first, no `tailwind.config.js`)
- **MSW v2** (browser + node)
- **Zustand 5** (runtime mock toggle)
- **Vitest 4** + `@testing-library/react`

---

## Getting started

```bash
npm install

# no mocks — the header pill is disabled ("Mock unavailable")
npm run dev

# runtime toggle, mocks ON by default
npm run dev:mock

# mocks ON but /users passes through to the real API (hybrid)
npm run dev:hybrid

# handler specs + hook integration tests
npm run test:run

# production bundle WITHOUT mocks (MSW tree-shaken out)
npm run build

# production bundle WITH mocks (for bundle-size comparison)
npm run build:mock
```

Open [http://localhost:5173](http://localhost:5173).

When `VITE_ENABLE_MOCKING=true`, the `MockToggle` in the header lets
you turn the MSW worker on and off at runtime without reloading.

---

## Architecture

```
mocks/
  core/
    backend.ts           # Single source of the real API URL
    env.d.ts             # Typed import.meta.env shape
    errors.ts            # notFound / badRequest / serverError helpers
    init.ts              # initMocking() - dynamic import (tree-shakable)
    mock.config.ts       # MockConfig + resolveMockConfig() + shouldMock()
    types.ts             # MockRouteKey union + HttpMethod
    url.ts               # normalizePath / normalizeBaseUrl / joinUrl
  domains/
    properties.mock.ts   # propertyHandlers(config, baseUrl)  ← factory
    properties.mock.spec.ts
    hosts.mock.ts        # hostHandlers(config, baseUrl)
    hosts.mock.spec.ts
  handlers.ts            # createHandlers(config, baseUrl?) - composes domains
  browser.ts             # setupWorker() (no initial handlers)
src/
  api/client.ts          # fetch wrapper with VITE_API_BASE
  components/            # Header, CategoryPills, HostsSection, PropertyCard, PropertyGrid, StoriesSection, MockToggle
  domains/properties/    # useProperties hook + Property type + useProperties.test.ts
  domains/hosts/         # useHosts hook + Host type
  domains/posts/         # usePosts hook (calls /posts with NO mock handler)
  stores/                # useMockStore (runtime toggle)
```

### The domain factory pattern

Every domain file exports a **function** like
`propertyHandlers(config, baseUrl): HttpHandler[]`. Two wins:

- **Testable** — specs feed in their own `MockConfig` and a throwaway
  base URL, no env reads at import time.
- **Per-handler hybrid mode** — each handler calls `passthrough()` if
  its `MockRouteKey` is in `config.omittedKeys`, so an omitted route
  escapes to the real network at handler granularity.

### The four scenarios

| # | Endpoint      | Mock ON                                | Mock OFF / hybrid                                 |
| - | ------------- | -------------------------------------- | ------------------------------------------------- |
| 1 | `/properties` | 12 curated stayvibe listings           | 404 (real API has no such route)                  |
| 2 | `/users`      | 4 CS pioneers with avatars + Superhost | 10 real JSONPlaceholder users, no avatars         |
| 3 | hybrid        | `npm run dev:hybrid`                   | `/properties` mocked, `/users` hits real API      |
| 4 | `/posts`      | real API (no mock handler)             | real API (unchanged — auto-passthrough)           |

Plus:

- **Unit tests** — `src/domains/properties/useProperties.test.ts`
  shows how the same handlers power the browser demo AND the hook
  integration tests (override handlers per-test with `server.use()`).
- **Tree-shaking proof** — `npm run build` emits 1 chunk / 206 KB,
  `npm run build:mock` emits 4 chunks / 456 KB. The 229 KB diff is
  paid for dynamically. Prod bundles with mocks OFF carry **zero**
  MSW bytes.

See [WORKSHOP.md](./WORKSHOP.md) for the live-demo script.

### Hybrid mode

Any route listed in `VITE_MSW_OMIT_KEYS` is **not registered** with
the worker, so its requests pass through to the real API:

```bash
# .env.mock
VITE_ENABLE_MOCKING=true
VITE_MSW_OMIT_KEYS=GET_HOSTS  # /users hits the real API, everything else stays mocked
```

### Tree-shaking guarantee

`mocks/core/init.ts` uses a **dynamic `import()`** to load MSW only
when the flag is on. In production builds with mocks off, the entire
MSW surface (worker, handlers, factory) is split into a chunk that is
never requested.

---

## Adding a new endpoint

1. Create `mocks/domains/<name>.mock.ts` exporting a `MockHandlerMap`.
2. Add the new route keys to `MockRouteKey` in `mocks/core/types.ts`.
3. Spread the map into `mocks/handlers.ts`.
4. Write a `<name>.mock.spec.ts` next to it.
5. Consume the endpoint from a component using `api()` from `src/api/client.ts`.

Done. No code outside of those four files changes.

---

## Environment variables

| Name                    | Purpose                                                        | Source                           |
| ----------------------- | -------------------------------------------------------------- | -------------------------------- |
| `VITE_API_BASE`         | Base URL for the real API. Handlers also use this internally.  | `.env.development` (committed)   |
| `VITE_ENABLE_MOCKING`   | `true` enables the MSW worker. Anything else disables it.      | Injected by script via cross-env |
| `VITE_MSW_OMIT_KEYS`    | Comma-separated `MockRouteKey` values to pass through.         | Injected by script via cross-env |

Only `VITE_API_BASE` lives in a file. Every mock-related flag is
visible at the top of `package.json` next to the script that uses
it — the same way a CI pipeline would set them.

Per-machine overrides go in `.env.development.local` (gitignored).
