# Workshop — Mock Mode with MSW v2

**Duration:** 1 hour · **Audience:** mid-level frontend engineers

> The repo you're in already has mocking wired for two domains:
> `properties` (fictional, only exists in the mock) and `hosts`
> (maps to JSONPlaceholder's real `/users` endpoint). Between them
> they demonstrate the three mocking scenarios every frontend team
> runs into. Your job during the workshop is to **replicate the
> pattern for a third domain** (`amenities`) — see Exercise below.

---

## Before the workshop (5 min on your own)

```bash
git clone https://github.com/Hyperxq/mock-mode-workshop.git
cd mock-mode-workshop
npm install
npm run dev:mock
```

Open [http://localhost:5173](http://localhost:5173) and keep the
browser **Network tab** open — half of the workshop is about what
you see there.

You should see:

- A "Meet your hosts" strip with 4 hosts (Ada, Alan, Grace, Margaret).
- 12 property cards in a responsive grid.
- A green `Mock ON` pill in the header.

---

## Agenda (60 min)

### 1 · Why (10 min) — whiteboard

- The pain: "waiting for the backend to start".
- Alternatives (json-server, mirage) and why MSW wins
  (same contract in dev + tests, no extra server process).
- The magic: MSW is **transparent**. Your app does
  `fetch('/properties')`. It doesn't know it's being mocked.

### 2 · The three scenarios (15 min) — live demo

Every real project hits these three situations. Show each one in
the running app with the Network tab open.

---

#### Scenario 1 · "The backend doesn't exist yet"

**The app fetches `/properties`, but JSONPlaceholder has no such
endpoint.** Without mocks, we're stuck.

1. Start on the page with `Mock ON`. Properties render.
2. Click the `Mock ON` pill → it flips to `Mock OFF`.
3. Properties grid shows `Couldn't load properties — Error: 404`.
4. In the Network tab you'll see `GET /properties → 404` hitting
   `jsonplaceholder.typicode.com`.
5. Click the pill again → properties come back.

**Teaching point:** mocks let you build the UI *before* the backend
exists. Same code path, same component, same fetch call.

---

#### Scenario 2 · "Same endpoint, different data"

**The app fetches `/users`, which JSONPlaceholder *does* have. Our
mock overrides it with curated data.**

1. With `Mock ON`, look at the hosts strip: **Ada, Alan, Grace,
   Margaret** — each with a photo avatar, some with a Superhost ★.
2. Click `Mock ON` → `Mock OFF`.
3. The hosts strip refreshes. Now you see **Leanne Graham, Ervin
   Howell, Clementine Bauch, …** — ten real JSONPlaceholder users,
   no avatars (they fall back to coloured initials), no Superhost
   badges.
4. Network tab: with `Mock ON`, the request has an
   `x-powered-by: msw` header. With `Mock OFF`, the request actually
   flies over the network to `jsonplaceholder.typicode.com/users`.

**Teaching point:** mocks aren't only for missing endpoints — they
also let you shape data for demos, tests, edge-case reproduction, or
deterministic screenshots. Same fetch, different payload.

---

#### Scenario 3 · "Hybrid mode — mock some, pass through others"

**Mock ON globally, but one route is exempt and hits the real API.**

1. Stop the dev server (`Ctrl+C`).
2. Open `.env.mock` and uncomment the last line:
   ```
   VITE_MSW_OMIT_KEYS=GET_HOSTS
   ```
3. `npm run dev:mock` again.
4. Properties still come from the mock (12 stayvibe listings).
5. The hosts strip now shows Leanne, Ervin, Clementine, … (the real
   JSONPlaceholder users) **even though `Mock ON` is still lit**.
6. Network tab confirms: `GET /properties` is intercepted by the
   worker, `GET /users` is not.

**Teaching point:** in real projects, the backend delivers endpoints
one by one. You mock what's missing and point the rest at the real
thing. One env variable, zero code changes.

---

### 3 · Tour the code (5 min)

Walk through these files in order:

1. `mocks/core/types.ts` — the `MockRouteKey` union.
2. `mocks/domains/properties.mock.ts` — only-in-mock domain.
3. `mocks/domains/hosts.mock.ts` — overrides a real endpoint.
4. `mocks/handlers.ts` — composition + omit filter.
5. `mocks/core/omit.ts` — hybrid mode in 20 lines.
6. `mocks/core/init.ts` — the **dynamic import** (tree-shaking).
7. `src/main.tsx` — the async bootstrap.
8. `src/stores/mock.store.ts` — the runtime toggle using
   `worker.use()` / `worker.resetHandlers()` (never `stop/start`).

### 4 · Hands-on (25 min)

> **Exercise — add the `amenities` domain.**

Every property card should display its amenities as small chips
(e.g. `WiFi`, `Pool`, `Kitchen`). Data shape:

```ts
type Amenity = {
  id: number;
  name: string;     // "WiFi", "Pool", "Kitchen", ...
  icon: string;     // emoji or single glyph
  propertyIds: number[];  // which properties have this amenity
};
```

Steps:

1. Create `mocks/domains/amenities.mock.ts` exporting
   `amenitiesHandlers`.
2. Add `GET_AMENITIES` to `MockRouteKey` in `mocks/core/types.ts`.
3. Seed a handful of amenities (mapping them to property ids).
4. Spread `amenitiesHandlers` into `mocks/handlers.ts`.
5. Write `amenities.mock.spec.ts` (two tests is enough).
6. Build a `useAmenities` hook and render chip pills on each
   `PropertyCard`.
7. **Hybrid-mode drill:** set
   `VITE_MSW_OMIT_KEYS=GET_AMENITIES,GET_HOSTS`, restart, and prove
   in the network tab that both of those endpoints go real while
   `GET /properties` stays mocked.

Instructor tip: keep the solution on a `solution/` branch. Don't
show it until the last 5 minutes.

### 5 · Going deeper (5 min) — tech leads

If the room is moving fast, pull out any of these:

- **The factory.** Open `mocks/core/factory.ts`. Replace the manual
  properties handlers with `createCrudHandlers(...)` live and show
  it still passes tests.
- **Runtime toggle internals.** Walk through `useMockStore.toggle()`
  and explain why we **never** call `worker.stop()/start()` — and
  why MSW docs recommend handler-swap via `worker.use()` and
  `worker.resetHandlers()` instead.
- **Ask them:** "where else would you use this pattern?" — tests,
  Storybook, demos for clients, detached UI reviews, cypress tests.

---

## Common gotchas

| Symptom                                | Cause                                                                 |
| -------------------------------------- | --------------------------------------------------------------------- |
| Requests hit the real API              | `VITE_ENABLE_MOCKING` isn't `true`, or you didn't restart Vite.       |
| `mockServiceWorker.js` 404             | File missing from `public/`. Run `npx msw init public/ --save`.       |
| Tests fail with "unhandled request"    | Handler URL doesn't match (forgot the base URL in the handler).       |
| Hybrid omit doesn't take effect        | You changed `.env.mock` but didn't restart the dev server.            |
| Mocks don't hot-reload                 | Service workers cache. Hard-reload (Ctrl+Shift+R) after editing.      |

---

## Cheatsheet

```ts
// A handler
http.get(`${API}/amenities`, async () => {
  await delay(300);
  return HttpResponse.json(amenities);
});

// Pass-through a specific key (hybrid mode)
// .env.mock
VITE_MSW_OMIT_KEYS=GET_AMENITIES,GET_HOSTS

// Toggle at runtime
useMockStore.getState().toggle();
```

That's it. You now know how to ship UI without waiting for the backend.
