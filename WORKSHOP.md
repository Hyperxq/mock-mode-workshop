# Workshop — Mock Mode with MSW v2

**Duration:** 1 hour · **Audience:** mid-level frontend engineers
· **Format:** in-person, paired with the instructor walking the room

This file is the **script**. It takes you from a half-wired project
to a fully working one, then sets you loose on adding a brand-new
mocked endpoint. Each phase says exactly what to change, what to
observe, and what the teaching point is.

If you've not read `README.md` yet, do that first — it covers Node
setup, scripts, and the architecture map.

---

## The progression at a glance

| Phase | You do                                         | You see                                        |
| ----- | ---------------------------------------------- | ---------------------------------------------- |
| 0     | `npm install`, `npm run dev`                   | A broken page — mocks are off                  |
| 1     | `npm run dev:mock`                             | Pill turns red but page still fails            |
| 2     | Uncomment `await initMocking()` in `main.tsx`  | Properties load                                |
| 3     | Uncomment `HostsSection` in `App.tsx`          | Four mocked hosts with superhost badges        |
| 4     | Uncomment `StoriesSection` in `App.tsx`        | Four travel stories from the real API          |
| 5     | `npm run dev:hybrid`                           | Hosts switch to real users, properties stay mocked |
| 6     | Create `amenities` domain (the exercise)       | Chips on every property card                   |
| 7     | Write a section test for your new domain       | `vitest run` stays green                       |

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

- Header pill says **"Mock unavailable"** (with a lock icon) — this
  is the disabled state because `VITE_ENABLE_MOCKING` isn't set.
- The properties grid shows `Couldn't load properties — Error: 404`.
- There is **no** "Meet your hosts" strip and **no** "Travel stories"
  section yet.

### Teaching point

The app is intentionally half-wired. With mocks off, the real API
(`jsonplaceholder.typicode.com`) doesn't have `/properties`, so the
request 404s. Mocks are what will make this work.

---

## Phase 1 — Enable mock mode via env (3 min)

Stop the dev server with `Ctrl+C`. Run:

```bash
npm run dev:mock
```

### Observe

- Header pill is now red: **"Mock ON"**.
- The properties grid is STILL broken — same 404 error.

### Teaching point

"Env flag on" is not enough. Something in the app has to actually
bootstrap the Service Worker. Open `src/main.tsx` — you'll find
one line commented out. Keep it commented for now. We'll uncomment
it together in the next phase.

---

## Phase 2 — Start the worker (5 min)

Open `src/main.tsx`. You'll see:

```tsx
async function bootstrap() {
  // TODO (Phase 2) — uncomment to bootstrap MSW when VITE_ENABLE_MOCKING=true.
  // await initMocking();

  const container = document.getElementById('root');
  if (!container) throw new Error('Root container not found');

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
```

Uncomment the `await initMocking();` line. Save. Vite HMR reloads.

### Observe

- Properties grid populates with 12 stayvibe cards.
- Network tab: `GET /properties → 200 OK`, with an `x-powered-by: msw`
  header proving the worker intercepted it.
- Click the pill → "Mock OFF". Grid shows the 404 error again.
  Click it back to "Mock ON" → properties reload.

### Teaching point

That single line (`await initMocking()`) does four things:

1. Reads `VITE_ENABLE_MOCKING` and early-returns if it's off.
2. Dynamically imports `mocks/browser` (this is what allows
   tree-shaking in prod).
3. Starts the worker, telling it to `bypass` unhandled requests.
4. Calls `worker.use(...createHandlers(config, baseUrl))` to
   register every domain's handlers in one shot.

The runtime toggle then just calls `worker.resetHandlers()` / re-runs
`worker.use(...)` — it never restarts the worker itself.

---

## Phase 3 — Reveal the hosts strip (5 min)

Open `src/App.tsx`. Near the top you'll find the import for
`HostsSection` commented out, and further down the JSX call
(`<HostsSection />`) also commented. Uncomment both.

### Observe

- A "Meet your hosts" strip appears between the category pills and
  the property grid.
- It shows four hosts with photo avatars: **Ada Lovelace, Alan
  Turing, Grace Hopper, Margaret Hamilton**. Three of them have a
  red Superhost ★ badge on their avatar.
- Click the mock pill off → the strip refreshes with **Leanne
  Graham, Ervin Howell, Clementine Bauch, …** (ten real
  JSONPlaceholder users, no avatars, no badges).

### Teaching point

Same endpoint (`/users`), same fetch code, different data depending
on whether mocks are on. The mock layer doesn't replace the
backend — it **shadows** it. This is why MSW is the right tool for
seeded demos, deterministic tests, and "the data is ugly, I want
curated fixtures for this screenshot" scenarios.

Click the pill back on before moving to the next phase.

---

## Phase 4 — Reveal the stories section (3 min)

Still in `src/App.tsx`. Uncomment the `StoriesSection` import and
its JSX below the main grid.

### Observe

- A "Travel stories" section appears below the property grid with a
  small **UNMOCKED** badge in the corner.
- It shows four posts from JSONPlaceholder (`Sunt Aut Facere
  Repellat Provident Occaecati Excepturi…` — yes, Latin ipsum, that's
  what their /posts endpoint serves).
- Toggle the mock pill on and off. The stories **don't change**.

### Teaching point

Open `mocks/handlers.ts`. There is no `postHandlers(...)` spread
anywhere. The app's `/posts` endpoint is deliberately NOT mocked.
When the worker sees a request it has no handler for, its
`onUnhandledRequest: 'bypass'` setting (in `mocks/core/init.ts`)
tells it to let the request continue to the real network.

So "mock ON" does NOT mean "mock everything". Unmocked endpoints
are automatically hybrid. Good to know.

---

## Phase 5 — Hybrid mode (5 min)

Stop the dev server. Run:

```bash
npm run dev:hybrid
```

Look at `package.json` — `dev:hybrid` is literally
`cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS vite`.

### Observe

- Pill still says "Mock ON" (the global flag is on).
- Properties grid is still mocked (12 stayvibe cards).
- Hosts strip now shows the **real** JSONPlaceholder users — even
  though the global mock flag is on.
- Network tab: `GET /properties` has the `x-powered-by: msw` header;
  `GET /users` goes straight to `jsonplaceholder.typicode.com`.

### Teaching point

`VITE_MSW_OMIT_KEYS` is parsed into `config.omittedKeys`. The
`GET_HOSTS` handler calls `shouldMock(config, 'GET_HOSTS')` before
doing anything, and when the key is omitted, it returns
`passthrough()` — which tells MSW to let the request continue.

That means you can flip routes to the real backend one by one as
they become available, without touching any code. Zero downside
for teams running both dev and real API in parallel.

---

## Phase 6 — Add the `amenities` domain (25 min, hands-on)

This is where you drive. The goal: every property card should show
its amenities (WiFi, Pool, Kitchen, …) as small chips.

Use the recipe in `skills/msw-route/SKILL.md` — it walks through
the exact steps with copy-pasteable code.

### Target shape

```ts
type Amenity = {
  id: number;
  name: string;
  icon: string;             // emoji
  propertyIds: number[];    // which properties have this amenity
};
```

### The six steps

1. **Extend the enum.** Add `'GET_AMENITIES'` to `MockRouteKey` in
   `mocks/core/types.ts`.
2. **Write the domain factory.** Create
   `mocks/domains/amenities.mock.ts` exporting
   `amenityHandlers(config, baseUrl)` that returns a single
   `http.get('/amenities')` handler. Seed 6-8 amenities with
   `propertyIds` arrays.
3. **Register it.** Import and spread `amenityHandlers` inside
   `createHandlers()` in `mocks/handlers.ts`.
4. **Consume it.** Add `src/domains/amenities/types.ts` (the
   `Amenity` interface) and `src/domains/amenities/useAmenities.ts`
   (a hook mirroring `useProperties`). Read from `api('/amenities')`.
5. **Render chips.** Update `src/components/PropertyCard.tsx` to
   accept an optional `amenities?: Amenity[]` prop. Filter by
   `property.id` and render small chips like `📶 WiFi`.
6. **Wire the grid.** In `src/components/PropertyGrid.tsx` call
   `useAmenities()` and pass the data down to every `PropertyCard`.

### Observe at the end

- Every property card has 2-4 amenity chips under the price.
- Toggle mock off → amenities disappear (real API has no `/amenities`).

### Hybrid-mode drill (bonus)

Edit the `dev:hybrid` script's `VITE_MSW_OMIT_KEYS` to include
`GET_AMENITIES,GET_HOSTS`. Restart. Properties still mocked,
amenities AND hosts both go real (and 404 in the case of
`/amenities` — that's the signal).

### If you get stuck

Switch to the solution branch:

```bash
git switch solution
```

Diff it against `main` to see exactly which files changed and how.

---

## Phase 7 — Write a section test for amenities (5 min)

Create `src/components/PropertyGrid.test.tsx` already exists — extend
it with a test that:

1. Renders `<PropertyGrid category="all" />`.
2. Waits for a property title to appear.
3. Asserts that an amenity chip (e.g. "WiFi") is also visible.

Because section tests use `createHandlers(config, API)`, your new
`amenityHandlers` factory is already in the server — no extra setup
needed. Run:

```bash
npm run test:run
```

The suite stays green.

---

## Common gotchas

| Symptom                                   | Cause                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| Pill shows "Mock unavailable"             | You ran `npm run dev` (no flag). Use `dev:mock` or `dev:hybrid`.            |
| Pill says "Mock ON" but requests 404      | `initMocking()` is still commented in `src/main.tsx`. Uncomment it.         |
| `mockServiceWorker.js → 404` in console   | File missing from `public/`. Re-run `npx msw init public/`.                 |
| Unhandled-request error in tests          | Handler URL doesn't match the test URL — check `joinUrl(baseUrl, path)`.    |
| Hybrid omit doesn't take effect           | You changed `.env.development` but didn't restart. Or forgot `cross-env`.   |
| Mocks don't hot-reload                    | Service workers cache. `Ctrl+Shift+R` or kill + restart the dev server.     |

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

// Pass-through per script
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
