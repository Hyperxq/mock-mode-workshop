# Workshop — Mock Mode with MSW v2

**Duration:** 1 hour · **Audience:** mid-level frontend engineers

> The repo you're in has mocking wired for three domains and an
> intentionally-unmocked fourth endpoint. Between them they cover
> every real-world mocking scenario in under 30 minutes of live
> demo. Your job is then to **replicate the pattern for a fifth
> domain** (`amenities`) — see Exercise below.

---

## Before the workshop (5 min on your own)

```bash
git clone https://github.com/Hyperxq/mock-mode-workshop.git
cd mock-mode-workshop
npm install

# default run — NO mocks, the Mock pill is disabled
npm run dev

# with mocks
npm run dev:mock

# hybrid mode (Mock ON but /users passes through)
npm run dev:hybrid

# tests
npm run test:run
```

Open [http://localhost:5173](http://localhost:5173) and keep the
browser **Network tab** open — half of the workshop happens there.

---

## Scripts cheat sheet

All mock-related flags are injected per-script via `cross-env` in
`package.json`. There is only one env file — `.env.development` —
and it only carries the base API URL. Flags live next to the
script they belong to, which makes CI/pipeline overrides obvious.

| Script              | What it does                                                                      |
| ------------------- | --------------------------------------------------------------------------------- |
| `dev`               | Plain `vite`. No mock flag. Pill shows "Mock unavailable" (disabled).             |
| `dev:mock`          | `cross-env VITE_ENABLE_MOCKING=true vite`. Worker registered, pill is the toggle. |
| `dev:hybrid`        | `cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS vite`.           |
| `build`             | Prod build WITHOUT mocks. MSW is DCE-ed out of the bundle.                        |
| `build:mock`        | `cross-env VITE_ENABLE_MOCKING=true vite build`. For bundle-size comparison.      |
| `test:run`          | Vitest + msw/node runs handler specs AND hook integration tests.                  |

---

## Agenda (60 min)

### 1 · Why (10 min) — whiteboard

- The pain: "waiting for the backend to start".
- Alternatives (json-server, mirage) and why MSW wins: same contract
  in dev + tests, no extra server process, one API surface.
- The magic: MSW is **transparent**. Your app does
  `fetch('/properties')`. It doesn't know it's being mocked.

### 2 · The four scenarios (20 min) — live demo

Every real project hits these. Show each one with the Network tab
open so attendees *see* the difference.

---

#### Scenario 1 · "The backend doesn't exist yet"

**App fetches `/properties`, JSONPlaceholder has no such endpoint.**

1. `npm run dev:mock`. Properties render.
2. Click the `Mock ON` pill → `Mock OFF`.
3. Properties grid shows `Couldn't load properties — Error: 404`.
4. Network tab: `GET /properties → 404` hitting
   `jsonplaceholder.typicode.com`.
5. Click the pill again → properties come back.

**Point:** mocks let you ship UI *before* the backend exists.

---

#### Scenario 2 · "Same endpoint, different data"

**App fetches `/users`, JSONPlaceholder *has* it. Our mock overrides it.**

1. With `Mock ON`: hosts strip shows **Ada, Alan, Grace, Margaret**
   with photo avatars and Superhost ★ badges.
2. Click `Mock ON` → `Mock OFF`.
3. Hosts strip refreshes. Now you see **Leanne Graham, Ervin Howell,
   Clementine Bauch, …** — ten real JSONPlaceholder users, no
   avatars, no badges.
4. Network tab: mocked responses have `x-powered-by: msw`, real
   ones don't.

**Point:** mocks aren't only for missing endpoints — they shape
data for demos, tests, edge-case reproduction, deterministic UI
screenshots.

---

#### Scenario 3 · "Hybrid mode — mock some, pass through others"

**Mock ON globally, one route exempted and hits the real API.**

1. `Ctrl+C` the dev server.
2. `npm run dev:hybrid` (same as `dev:mock` but the script injects
   `VITE_MSW_OMIT_KEYS=GET_HOSTS` via `cross-env`).
3. Properties still come from the mock (12 stayvibe listings).
4. Hosts strip now shows Leanne, Ervin, Clementine, … **even
   though `Mock ON` is lit**.
5. Network tab confirms: `/properties` intercepted by the worker,
   `/users` flies to the real API.

**Point:** when the real backend delivers endpoints one by one, you
mock what's missing and point the rest at the real thing. One env
variable, zero code changes.

---

#### Scenario 4 · "No handler = automatic passthrough"

**Scroll down to "Travel stories" — pulled from `/posts`, a real
JSONPlaceholder endpoint WITHOUT a mock handler defined.**

1. Open the Network tab.
2. `GET /posts?_limit=4` fires.
3. The MSW worker sees a request it doesn't know about.
   `onUnhandledRequest: 'bypass'` in `mocks/core/init.ts` lets it
   continue to the network. The request lands at JSONPlaceholder.
4. Toggle mock ON/OFF — the `Travel stories` cards don't change.
   They always come from the real API.

**Point:** mocks are opt-in per route. "Mock ON" does NOT mean
"mock everything". Endpoints without a handler pass through.
Hybrid mode is the explicit version of the same idea.

---

### 3 · The payoff: unit tests (5 min)

Open `src/domains/properties/useProperties.test.ts`. It tests the
React hook using the **same handlers** as the browser demo, via
`msw/node` registered in `tests/setup.ts`:

```ts
server.use(
  http.get(`${API}/properties`, () => HttpResponse.json([])),
);
const { result } = renderHook(() => useProperties());
await waitFor(() => {
  expect(result.current.state.status).toBe('success');
});
```

Three tests demonstrate:

1. Happy path — handler returns the seed data.
2. Empty state — `server.use()` overrides with `[]`.
3. Error state — `server.use()` overrides with `500`.

**Point:** write the contract ONCE (handlers), exercise it in
browser dev AND node tests. No fetch mocks, no dependency
injection, no separate fake HTTP client.

---

### 4 · Tree-shaking proof (3 min)

```bash
# default production build (mocks OFF)
npm run build
```
→ 1 chunk, 34 modules, **206 KB**.
No `browser`, no `handlers`, no `HttpResponse` in `dist/`.

```bash
# production build WITH mocks enabled
npm run build:mock
```
→ 4 chunks, 261 modules, **456 KB** total. The MSW surface
(browser + handlers + HttpResponse) adds ~229 KB uncompressed /
~88 KB gzipped.

The diff is paid for dynamically. In a real production build we
ship the 206 KB bundle. MSW is a dev-and-test tool that weighs
**zero** bytes in prod — as long as you keep the
`if (import.meta.env.VITE_ENABLE_MOCKING !== 'true') return;` guard
at the top of every dynamic-import site (see
`src/stores/mock.store.ts` and `mocks/core/init.ts`). Vite inlines
`import.meta.env.VITE_*` at build time, Rollup DCE-s the
unreachable `await import(...)` calls, and the chunks are never
emitted.

**Point:** mocking is not a dev-only hack you have to rip out
before shipping. Written correctly, it's invisible to production.

---

### 5 · Hands-on (20 min)

> **Exercise — add the `amenities` domain.**

Every property card should display its amenities as small chips
(e.g. `WiFi`, `Pool`, `Kitchen`). Shape:

```ts
type Amenity = {
  id: number;
  name: string;     // "WiFi", "Pool", "Kitchen", ...
  icon: string;     // emoji or glyph
  propertyIds: number[];
};
```

Steps:

1. Create `mocks/domains/amenities.mock.ts` exporting
   `amenitiesHandlers`.
2. Add `GET_AMENITIES` to `MockRouteKey` in `mocks/core/types.ts`.
3. Seed a handful of amenities.
4. Spread into `mocks/handlers.ts`.
5. Write `amenities.mock.spec.ts` — two tests is enough.
6. Build `useAmenities` + render chips on `PropertyCard`.
7. **Hybrid-mode drill:** either edit the `dev:hybrid` script to
   add `,GET_AMENITIES` to the `VITE_MSW_OMIT_KEYS` value, OR add
   a brand-new script (`dev:hybrid2`) with
   `cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS,GET_AMENITIES vite`.
   Run it and prove in the network tab that `/amenities` and
   `/users` both hit the real API while `/properties` stays mocked.

Instructor tip: keep the solution on a `solution/` branch. Don't
show it until the last 5 minutes.

---

## Common gotchas

| Symptom                                | Cause                                                                 |
| -------------------------------------- | --------------------------------------------------------------------- |
| Pill is disabled ("Mock unavailable")  | You ran `npm run dev`. Run `npm run dev:mock` or `dev:hybrid`.        |
| Requests hit the real API              | `VITE_ENABLE_MOCKING` isn't `true`, or you didn't restart Vite.       |
| `mockServiceWorker.js` 404             | File missing from `public/`. Run `npx msw init public/ --save`.       |
| Tests fail with "unhandled request"    | Handler URL doesn't match (forgot the base URL in the handler).       |
| Hybrid omit doesn't take effect        | You changed a script env var but didn't restart the dev server.       |
| Mocks don't hot-reload                 | Service workers cache. Hard-reload (Ctrl+Shift+R) after editing.      |

---

## Cheatsheet

```ts
// A handler
http.get(`${API}/amenities`, async () => {
  await delay(300);
  return HttpResponse.json(amenities);
});

// Per-test override (in Node)
server.use(
  http.get(`${API}/properties`, () => new HttpResponse(null, { status: 500 })),
);

// Pass-through a specific key (hybrid mode) — injected by the script
// package.json
"dev:hybrid": "cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS vite"

// Runtime toggle
useMockStore.getState().toggle();
```

That's it. You now know how to ship UI without waiting for the backend.
