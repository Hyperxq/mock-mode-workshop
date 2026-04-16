# Workshop — Mock Mode with MSW v2

**Duration:** 1 hour · **Audience:** mid-level frontend engineers

> The repo you're in already has mocking wired for the `properties`
> domain (the Airbnb-style listings you see on screen). Your job
> during the workshop is to **replicate the pattern for a new domain**
> and then use hybrid mode to mix it with the real API.

---

## Before the workshop (5 min on your own)

```bash
git clone https://github.com/Hyperxq/mock-mode-workshop.git
cd mock-mode-workshop
npm install
npm run dev:mock
```

You should see twelve properties in a grid and a green `Mock ON`
pill in the header. Click the pill — requests start failing. Click
it again — the properties come back. That is MSW starting and
stopping live.

Open the browser devtools network tab. Notice how the Service Worker
is intercepting every request before it ever hits the network.

---

## Agenda (60 min)

### 1 · Why (10 min) — whiteboard

- The pain: "waiting for the backend to start".
- Alternatives (json-server, mirage) and why MSW wins
  (same contract in dev + tests, no extra server process).
- The magic: MSW is **transparent**. Your app does
  `fetch('/properties')`. It doesn't know it's being mocked.

### 2 · Tour (10 min) — reading the repo

Walk through these files in order:

1. `mocks/core/types.ts` — the `MockRouteKey` union.
2. `mocks/domains/properties.mock.ts` — a concrete handler map.
3. `mocks/handlers.ts` — composition + omit filter.
4. `mocks/core/omit.ts` — hybrid mode.
5. `mocks/core/init.ts` — the **dynamic import** (tree-shaking).
6. `src/main.tsx` — the async bootstrap.
7. `src/stores/mock.store.ts` — the runtime toggle.

Key concepts to call out:

- **Handler keys are first-class.** That's what makes hybrid mode clean.
- **Dynamic import is not a detail.** It is the reason MSW can ship
  next to production code without bloating the bundle.
- **Same handlers in dev and test.** See `tests/setup.ts` using
  `msw/node` with the identical `handlers` export.

### 3 · Hands-on (30 min)

> **Exercise — add the `hosts` domain.**

Each property has a `host` string today. Your job is to make it a
first-class resource so the app can fetch host profiles on demand.

The target shape:

```ts
type Host = {
  id: number;
  name: string;
  bio: string;
  isSuperhost: boolean;
  joinedYear: number;
  avatarUrl: string;
};
```

Steps:

1. Create `mocks/domains/hosts.mock.ts` exporting `hostsHandlers`
   for `GET /hosts`, `GET /hosts/:id`, `POST /hosts`.
2. Add `GET_HOSTS`, `GET_HOST`, `CREATE_HOST` to `MockRouteKey` in
   `mocks/core/types.ts`.
3. Spread `hostsHandlers` into `mocks/handlers.ts`.
4. Write `hosts.mock.spec.ts` next to the handler (3 tests is plenty).
5. Build a `HostBadge` component that fetches `/hosts/:id` and shows
   the host's name + Superhost pill on each `PropertyCard`.
6. **Hybrid-mode drill:** set `VITE_MSW_OMIT_KEYS=GET_HOSTS` and prove
   in the network tab that `GET /hosts` hits jsonplaceholder.typicode.com
   (and 404s — because there is no real `/hosts`) while `GET /properties`
   is still mocked. That 404 is the whole point: it proves the route
   is leaving the mock layer.

Instructor tip: keep the solution on a `solution/` branch. Don't show
it until the 30 minutes are up.

### 4 · Going deeper (10 min) — tech leads

If the room is moving fast, pull out any of these:

- **The factory.** Open `mocks/core/factory.ts`. Replace the manual
  properties handlers with `createCrudHandlers(...)` live and show it
  still passes tests.
- **Runtime toggle internals.** Walk through `useMockStore.toggle()`
  and explain why `worker.start()` is async but `worker.stop()` is not.
- **Ask them:** "where else would you use this pattern?" — tests,
  Storybook, demos for clients, detached UI reviews.

---

## Common gotchas

| Symptom                                | Cause                                                                 |
| -------------------------------------- | --------------------------------------------------------------------- |
| Requests hit the real API              | `VITE_ENABLE_MOCKING` isn't `true`, or you didn't restart Vite.       |
| `mockServiceWorker.js` 404             | File missing from `public/`. Run `npx msw init public/ --save`.       |
| Tests fail with "unhandled request"    | Handler URL doesn't match (forgot the base URL in the handler).      |
| Mocks don't hot-reload                 | Service workers cache. Hard-reload (Ctrl+Shift+R) after editing.      |

---

## Cheatsheet

```ts
// A handler
http.get(`${API}/hosts`, async () => {
  await delay(300);
  return HttpResponse.json(hosts);
});

// Pass-through a specific key (hybrid mode)
// .env.mock
VITE_MSW_OMIT_KEYS=GET_HOSTS

// Toggle at runtime
useMockStore.getState().toggle();
```

That's it. You now know how to ship UI without waiting for the backend.
