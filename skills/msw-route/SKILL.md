---
name: msw-route
description: >
  MSW v2 patterns + the step-by-step recipe for adding a new mocked
  route (domain) to this workshop project. Trigger: when the user
  wants to add a new endpoint, new mock handler, or new domain
  following the stayvibe conventions.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

# MSW v2 — Adding a route in the stayvibe workshop

## Before anything — MSW v2 vs v1

```ts
// ❌ DEAD — MSW v1 API. If you see `res(ctx.*)`, rewrite it.
res(ctx.json({ data: 'x' }));
res(ctx.status(401));

// ✅ MSW v2 — the only correct syntax
HttpResponse.json({ data: 'x' });
HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

---

## Which MSW surface am I on?

| Scenario                            | Use                                 |
| ----------------------------------- | ----------------------------------- |
| Browser dev mode                    | `setupWorker` from `msw/browser`    |
| Unit / section tests in Node        | `setupServer` from `msw/node`       |
| One-off per-test override           | `server.use(...)` inside the test   |
| Route should hit the real network   | `return passthrough()`              |
| Route is genuinely unmocked in app  | Don't write a handler at all        |

---

## This project's architecture (60-second tour)

```
mocks/
├── core/
│   ├── backend.ts        ← single source of VITE_API_BASE
│   ├── env.d.ts          ← types for import.meta.env.VITE_*
│   ├── errors.ts         ← notFound() / badRequest() / serverError()
│   ├── init.ts           ← initMocking() — dynamic import (tree-shakable)
│   ├── mock.config.ts    ← MockConfig + resolveMockConfig() + shouldMock()
│   ├── types.ts          ← MockRouteKey union — EXTEND IT for new routes
│   └── url.ts            ← joinUrl() / normalizeBaseUrl() / normalizePath()
├── domains/
│   ├── properties.mock.ts       ← propertyHandlers(config, baseUrl)
│   ├── hosts.mock.ts            ← hostHandlers(config, baseUrl)
│   └── <your new domain>.mock.ts
├── browser.ts            ← export const worker = setupWorker()  (no initial handlers)
└── handlers.ts           ← createHandlers(config, baseUrl?)  ← REGISTER YOUR DOMAIN
```

### Key rules

- Handlers define ONLY paths (`/amenities`). The base URL is injected
  via `joinUrl(baseUrl, path)`.
- Every domain is a **factory function**: takes `MockConfig` and
  `baseUrl`, returns `HttpHandler[]`.
- Per-key `passthrough()` via `shouldMock(config, key)` enables
  hybrid mode at handler granularity.
- Extend `MockRouteKey` for every new route you add — that union is
  the contract between the mocks and the rest of the app.

---

## Recipe — adding a new domain from zero

Assume you need to add `/amenities` returning a list of amenities
(WiFi, Pool, etc).

### Step 1 — Extend `MockRouteKey`

`mocks/core/types.ts`:

```ts
export type MockRouteKey =
  | 'GET_PROPERTIES'
  | 'GET_PROPERTY'
  | 'CREATE_PROPERTY'
  | 'GET_HOSTS'
  | 'GET_AMENITIES';   // ← add this line
```

Without this line, TypeScript will reject the new handler key.

### Step 2 — Create the domain file

`mocks/domains/amenities.mock.ts`:

```ts
import { HttpResponse, delay, http, passthrough } from 'msw';
import { shouldMock, type MockConfig } from '../core/mock.config';
import { joinUrl } from '../core/url';

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  propertyIds: number[];
}

const seed: Amenity[] = [
  { id: 1, name: 'WiFi',        icon: '📶', propertyIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { id: 2, name: 'Pool',        icon: '🏊', propertyIds: [1, 6, 7, 10] },
  { id: 3, name: 'Kitchen',     icon: '🍳', propertyIds: [2, 4, 5, 8, 9, 11] },
  // ...add more
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
```

Patterns to notice:

- The factory returns **an array of handlers**, never a single one.
- Each handler starts with `if (!shouldMock(...)) return passthrough()`.
  Omit it and hybrid mode silently fails for that route.
- Use `delay(ms)` to simulate realistic latency — it makes skeleton
  states visible in dev.
- For 404s use `notFound(msg)` from `mocks/core/errors.ts`, not
  `new HttpResponse(null, { status: 404 })`.

### Step 3 — Register the factory in `handlers.ts`

`mocks/handlers.ts`:

```ts
import { amenityHandlers } from './domains/amenities.mock';  // ← add

export function createHandlers(config: MockConfig, baseUrl: string = BACKEND_BASE_URL): HttpHandler[] {
  const base = normalizeBaseUrl(baseUrl);
  return [
    ...propertyHandlers(config, base),
    ...hostHandlers(config, base),
    ...amenityHandlers(config, base),   // ← add
  ];
}
```

That's it — the worker (browser) and the test servers (Node) both
consume the same `createHandlers` output, so the new route is live
in dev AND testable.

### Step 4 — (Optional) Handler spec

`mocks/domains/amenities.mock.spec.ts` — test the mock itself:

```ts
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import type { MockConfig } from '../core/mock.config';
import { amenityHandlers } from './amenities.mock';

const BASE_URL = 'https://api.test.local';
const config: MockConfig = { omittedKeys: new Set(), onUnhandled: 'error' };

const server = setupServer(...amenityHandlers(config, BASE_URL));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers(...amenityHandlers(config, BASE_URL)));
afterAll(() => server.close());

describe('amenityHandlers', () => {
  it('GET /amenities returns the seeded list', async () => {
    const response = await fetch(`${BASE_URL}/amenities`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });
});
```

### Step 5 — Consume it from the app

`src/domains/amenities/types.ts` and `src/domains/amenities/useAmenities.ts`
follow the same shape as the existing `src/domains/properties/` and
`src/domains/hosts/`.

---

## Response cheat sheet

```ts
// JSON
HttpResponse.json(data);
HttpResponse.json(data, { status: 201 });

// Error via domain helpers
import { notFound, badRequest, serverError } from '../core/errors';
return notFound(`Amenity ${params.id} not found`);
return badRequest('Missing body');
return serverError();

// Plain text
HttpResponse.text('OK');

// Empty body (204)
new HttpResponse(null, { status: 204 });

// Let the real network answer
return passthrough();
```

---

## Runtime override (per-test)

Inside a test, `server.use(...)` prepends handlers only for that
case. `afterEach(() => server.resetHandlers())` wipes overrides.

```ts
server.use(
  http.get(`${API}/amenities`, () =>
    new HttpResponse(null, { status: 500 }),
  ),
);
```

---

## Common mistakes

| Mistake                                              | Fix                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `res(ctx.json(...))`                                 | Use `HttpResponse.json(...)`                                        |
| Static `import { setupWorker } from 'msw/browser'`   | Only `setupWorker()` inside `mocks/browser.ts`. Everything else dynamic. |
| Forgot to add the new key to `MockRouteKey`          | Add it — otherwise `shouldMock(config, 'GET_X')` is a TS error.     |
| Handler hard-codes full URL (`https://api...`)       | Use `joinUrl(baseUrl, '/path')` — tests use their own `baseUrl`.    |
| No `passthrough()` guard                             | Add the `if (!shouldMock(...)) return passthrough()` line.          |
| `worker.stop()` + `worker.start()` mid-session       | Use `worker.use()` / `worker.resetHandlers()` (see `mock.store.ts`). |
| Test file didn't reset handlers in `afterEach`       | Add `afterEach(() => server.resetHandlers(...))`. Order-dependent bugs are brutal. |

---

## Keywords

msw, mock service worker, http, mocking, handlers, setupServer,
setupWorker, HttpResponse, passthrough, testing, request
interception, browser mocks, node mocks, service worker, hybrid
mode, MockRouteKey, shouldMock, createHandlers, new domain, new
route, new endpoint, amenities, stayvibe
