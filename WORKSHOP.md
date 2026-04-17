# Workshop — Mock Mode with MSW v2

**Duration:** 1 hour 
· **Format:** in-person, instructor walking the room

This file is the **script**. It takes you from a half-wired project
to a fully working one, then sets you loose on adding a brand-new
mocked endpoint.

**Ground rule for every phase:** You do NOT touch any React file
*except* `src/main.tsx` in Phase 2. Everything else the workshop
changes lives under `mocks/`. That's the promise — this workshop
is about mocking, not about rebuilding components.

If you haven't read `README.md` yet, do that first. It covers Node
setup, the scripts, and the architecture map.

---

## The progression at a glance

| Phase | You do                                                         | You see                                           |
| ----- | -------------------------------------------------------------- | ------------------------------------------------- |
| 0     | `npm install`, `npm run dev`                                   | Hosts from real API, properties broken, pill disabled |
| 1     | `npm run dev:mock`                                             | Pill turns red — but page is still broken         |
| 2     | Uncomment `await initMocking()` in `src/main.tsx` *(only React change)* | Properties + mocked hosts appear                  |
| 3     | Click the mock pill                                            | Hosts swap between mocked and real                |
| 4     | `npm run dev:hybrid`                                           | Hosts turn real again, properties stay mocked     |
| 5     | Observe the "Travel stories" section                           | Same data regardless of the pill (unmocked)       |
| 6     | Add the `/amenities` mock under `mocks/`                       | Chips appear on every property card               |
| 7     | Write `mocks/domains/amenities.mock.spec.ts`                   | `vitest run` stays green                          |

---

## Phase 0 — Bootstrap (5 min)

```bash
git clone https://github.com/Hyperxq/mock-mode-workshop.git
cd mock-mode-workshop
nvm use          # reads .nvmrc → Node 22
npm install
npm run dev
```

### Observe

- Header pill: **"Mock unavailable"** with a lock icon.
- **Hosts strip** shows ten users with coloured initials: Leanne
  Graham, Ervin Howell, Clementine Bauch, … — those are real
  JSONPlaceholder users because nothing is intercepting.
- **Properties grid**: `Couldn't load properties — Error: 404`.
  JSONPlaceholder doesn't have `/properties`, so the real API
  rejects the request.
- **Travel stories** shows four posts of lorem ipsum — real posts
  from `/posts`.

### Teaching point

Without mocks, fetches go straight to the real backend. Endpoints
that exist give you real data; endpoints that don't exist give
you a 404. Mocks are what give you the freedom to ship the UI
anyway.

---

## Phase 1 — Enable mock mode via env (3 min)

Stop the dev server (`Ctrl+C`). Run:

```bash
npm run dev:mock
```

### Observe

- Pill is now red: **"Mock ON"**.
- The page looks **the same as Phase 0**. Hosts are still the real
  users, properties still 404.

### Teaching point

`VITE_ENABLE_MOCKING=true` tells the Zustand store the worker
*should* be available, but nothing has actually registered it. The
flag alone doesn't do the work. Open `src/main.tsx` and look for
the `TODO (Phase 2)` comments — we're about to flip them.

---

## Phase 2 — Start the worker (5 min) · **only React change of the workshop**

Open `src/main.tsx`. It looks like this:

```tsx
// TODO (Phase 2) — uncomment the import AND the bootstrap call
// below so the MSW worker is started when VITE_ENABLE_MOCKING=true.
//
// import { initMocking } from '../mocks/core/init';
...
async function bootstrap() {
  // TODO (Phase 2) — uncomment along with the import above.
  // await initMocking();
  ...
}
```

Uncomment **both** lines. Save. Vite hot-reloads.

### Observe

- Properties grid populates with 12 stayvibe cards.
- Hosts strip swaps: the ten real users disappear, replaced by
  **Ada Lovelace, Alan Turing, Grace Hopper, Margaret Hamilton**,
  three of them with a red Superhost ★ badge.
- Network tab: `GET /properties` and `GET /users` have an
  `x-powered-by: msw` response header.

### Teaching point

That single `await initMocking()` does four things:

1. Reads `VITE_ENABLE_MOCKING`; if not `true`, returns immediately.
   Vite inlines the env var at build time, so in production that
   early return is the only reachable branch and Rollup
   tree-shakes the entire MSW import graph out of the bundle.
2. Dynamically imports `mocks/browser` and `mocks/handlers` (so
   the chunks are split and only loaded when mocks run).
3. Calls `worker.start(...)` once.
4. Calls `worker.use(...createHandlers(config, baseUrl))` to
   register every domain's handlers in one shot.

---

## Phase 3 — Runtime toggle (4 min) · mouse-only

Click the **Mock ON** pill in the header.

### Observe

- Pill turns grey: **"Mock OFF"**.
- Properties grid returns to the 404 error.
- Hosts strip re-fetches and shows the ten real JSONPlaceholder
  users again.

Click the pill again. Everything comes back.

### Teaching point

The pill calls `useMockStore.toggle()`, which internally:

- On OFF: calls `worker.resetHandlers()` — handlers wiped, every
  subsequent request falls through to `onUnhandledRequest: 'bypass'`
  and hits the real network.
- On ON: calls `worker.use(...createHandlers(config, baseUrl))`
  again.

Critically, we do **not** call `worker.stop()` or
`worker.start()` mid-session — that sequence is fragile and lets
in-flight requests slip through un-mocked. Swapping handlers on
the live worker is the reliable pattern.

---

## Phase 4 — Hybrid mode (5 min) · no code, only a script

Stop the dev server. Run:

```bash
npm run dev:hybrid
```

Look at `package.json`. The script literally is

```
cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS vite
```

### Observe

- Pill still says **"Mock ON"** — the global flag is on.
- Properties grid is still mocked (12 stayvibe listings).
- Hosts strip now shows the **real** JSONPlaceholder users even
  though mocks are on globally.
- Network tab: `GET /properties` has the `x-powered-by: msw`
  header; `GET /users` does not.

### Teaching point

`VITE_MSW_OMIT_KEYS` is parsed into `config.omittedKeys` in
`mocks/core/mock.config.ts`. The `GET_HOSTS` handler calls
`shouldMock(config, 'GET_HOSTS')` before doing anything, and
when the key is omitted it returns `passthrough()` — which tells
MSW to let the request continue.

The rest of the app doesn't know the difference. Exactly what you
want when the real backend starts delivering endpoints one by one.

---

## Phase 5 — Observe the unmocked endpoint (3 min) · read-only

Scroll down to the **Travel stories** section. Toggle the mock
pill on and off a few times. Then try `npm run dev` (no mocks at
all). Then `npm run dev:mock`.

### Observe

The Travel stories cards **never change**. They always come from
the real `/posts` endpoint on JSONPlaceholder.

### Teaching point

Open `mocks/handlers.ts`. There is no `postHandlers(...)` spread.
The app's `/posts` endpoint is deliberately NOT mocked. When the
worker sees a request with no matching handler, its
`onUnhandledRequest: 'bypass'` setting (in `mocks/core/init.ts`)
tells it to let the request continue to the real network.

So "mock ON" does NOT mean "mock everything". Unmocked endpoints
are automatically hybrid — but by absence, not by configuration.

---

## Phase 6 — Add the `/amenities` mock (25 min, hands-on)

This is the exercise. The goal: make the amenity chips appear on
every property card.

**What's already there, ready for you:**

- The type: `src/domains/amenities/types.ts`.
- The hook: `src/domains/amenities/useAmenities.ts` — already
  fetches `/amenities`.
- The UI: `PropertyCard` already renders chips if it receives
  amenities, and `PropertyGrid` already calls `useAmenities()`
  and forwards the data down.

**What's missing and what you write:**

Everything lives under `mocks/`. Use `skills/msw-route/SKILL.md`
as the blueprint — it has the exact code you need. The four
files you touch:

1. `mocks/core/types.ts` — add `'GET_AMENITIES'` to the
   `MockRouteKey` union.
2. `mocks/domains/amenities.mock.ts` — create the file; export
   `amenityHandlers(config, baseUrl)`.
3. `mocks/handlers.ts` — import and spread the new factory inside
   `createHandlers()`.
4. *(Optional)* `mocks/domains/amenities.mock.spec.ts` — a quick
   sanity spec.

### Target shape for the mock data

```ts
interface Amenity {
  id: number;
  name: string;         // "WiFi", "Pool", "Kitchen", ...
  icon: string;         // emoji or single glyph
  propertyIds: number[]; // which properties offer this amenity
}
```

Seed 6–8 amenities with mixed `propertyIds` so different cards
show different chips.

### Observe at the end

Every property card shows 2–4 amenity chips under the price. Flip
the mock pill off — chips disappear (real API has no `/amenities`,
the hook silently errors, cards render without them).

### Hybrid drill (bonus, 2 min)

Edit the `dev:hybrid` script in `package.json`:

```
cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS,GET_AMENITIES vite
```

Restart. Properties still mocked, hosts AND amenities now go to
the real API (and amenities disappear, because the real API 404s).

### If you get stuck

```bash
git switch solution
```

Diff against `main` to see exactly the four files the exercise
asks you to write.

---

## Phase 7 — Handler spec for amenities (5 min)

The MSW server is wired globally via `mocks/setup-test-mocking.ts`
(`setupFiles` in `vite.config.ts`). That means this spec is tiny —
no `setupServer`, no `beforeAll/afterAll`, no lifecycle noise.

Create `mocks/domains/amenities.mock.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { TEST_BASE_URL } from '../setup-test-mocking';

describe('amenityHandlers', () => {
  it('GET /amenities returns the seeded list', async () => {
    const response = await fetch(`${TEST_BASE_URL}/amenities`);
    expect(response.status).toBe(200);

    const data = (await response.json()) as Array<{ propertyIds: number[] }>;
    expect(data.length).toBeGreaterThan(0);
  });

  it('every amenity declares at least one property', async () => {
    const response = await fetch(`${TEST_BASE_URL}/amenities`);
    const data = (await response.json()) as Array<{ propertyIds: number[] }>;

    for (const amenity of data) {
      expect(amenity.propertyIds.length).toBeGreaterThan(0);
    }
  });
});
```

Run:

```bash
npm run test:run
```

The full suite (including the new file) stays green.

---

## Common gotchas

| Symptom                                     | Cause                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------- |
| Pill shows "Mock unavailable"               | You ran `npm run dev` (no flag). Use `dev:mock` or `dev:hybrid`.      |
| Pill says "Mock ON" but properties 404      | `initMocking()` is still commented in `src/main.tsx`. Uncomment it.   |
| `mockServiceWorker.js → 404` in console     | File missing from `public/`. Re-run `npx msw init public/`.           |
| Unhandled-request error in tests            | Handler URL doesn't match — confirm `joinUrl(baseUrl, path)`.         |
| Hybrid omit doesn't take effect             | You changed the script but didn't restart. Env is read at boot only.  |
| Mocks don't hot-reload                      | Service workers cache. `Ctrl+Shift+R` or kill + restart the dev server. |

---

## Cheatsheet

```ts
// A handler factory
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

// Per-script hybrid
// package.json
"dev:hybrid": "cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS vite"

// Runtime toggle
useMockStore.getState().toggle();

// Per-test override
server.use(
  http.get(`${API}/amenities`, () => HttpResponse.json([])),
);
```

That's it. You now know how to ship UI without waiting for the backend.
