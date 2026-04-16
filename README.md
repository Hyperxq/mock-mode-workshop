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

# real API
npm run dev

# with mocks
npm run dev:mock

# tests
npm run test
```

Open [http://localhost:5173](http://localhost:5173).

When `VITE_ENABLE_MOCKING=true`, the `MockToggle` in the header lets
you turn the MSW worker on and off at runtime without reloading.

---

## Architecture

```
mocks/
  core/
    types.ts             # MockRouteKey union + MockHandlerMap
    omit.ts              # VITE_MSW_OMIT_KEYS -> hybrid mode filter
    init.ts              # initMocking() - dynamic import (tree-shakable)
    factory.ts           # createCrudHandlers - advanced, optional
  domains/
    properties.mock.ts   # the reference example
    properties.mock.spec.ts
  handlers.ts            # composes domain maps, applies omit list
  browser.ts             # setupWorker instance
src/
  api/client.ts          # fetch wrapper with VITE_API_BASE
  components/            # Header, CategoryPills, PropertyCard, PropertyGrid, MockToggle
  domains/properties/    # useProperties hook + Property type + CATEGORIES
  stores/                # useMockStore (runtime toggle)
tests/
  setup.ts               # msw/node setupServer - global for all specs
```

### Hybrid mode

Any route listed in `VITE_MSW_OMIT_KEYS` is **not registered** with
the worker, so its requests pass through to the real API:

```bash
# .env.mock
VITE_ENABLE_MOCKING=true
VITE_MSW_OMIT_KEYS=GET_PROPERTIES  # /properties hits the real API, POST is still mocked
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

| Name                    | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `VITE_API_BASE`         | Base URL for the real API. Handlers also use this internally.  |
| `VITE_ENABLE_MOCKING`   | `true` enables the MSW worker. Anything else disables it.      |
| `VITE_MSW_OMIT_KEYS`    | Comma-separated `MockRouteKey` values to pass through.         |

See `.env.example`.
