# Mock Mode Workshop — Tutorial

Welcome. This repo is a 1-hour hands-on workshop that teaches you
to build a frontend without a backend using **MSW v2**. You'll
start from a half-wired project, progressively flip features on,
and end up adding your own mocked endpoint from scratch.

Before touching code, read this whole file once. It covers:

1. [What you'll have at the end](#what-youll-have-at-the-end)
2. [Prerequisites — Node, npm, nvm](#prerequisites)
3. [Getting the project running](#getting-the-project-running)
4. [The scripts](#the-scripts)
5. [How the mocks are wired](#how-the-mocks-are-wired)
6. [How we test](#how-we-test)
7. [What to do next](#what-to-do-next) — points you at `WORKSHOP.md`

---

## What you'll have at the end

A React 19 listings page styled after Airbnb (`stayvibe`) that:

- Fetches properties, hosts, and travel stories from what looks
  like a backend, but is actually MSW intercepting requests at
  the Service Worker layer.
- Toggles mock mode at runtime via a pill in the header.
- Runs in three modes: **off** (no mocks), **mock** (mocks on),
  **hybrid** (mocks on but specific routes go to the real API).
- Weighs **zero** bytes of MSW code in its production build,
  thanks to a dynamic-import + env-literal tree-shaking trick.
- Has a full test suite spread across three tiers
  (unit / section / mock-infrastructure).

The app itself is only the teaching vehicle. The lesson is the
mock architecture underneath it.

---

## Prerequisites

| Tool           | Version     | Why                              |
| -------------- | ----------- | -------------------------------- |
| Node.js        | **22 LTS**  | Vite 8 requires ≥ 18; 22 is the current LTS and matches the `.nvmrc` in the repo. Newer is fine (tested up to 25). |
| npm            | **10+**     | Ships with Node 22.              |
| A modern browser | Chrome / Edge / Firefox | Service worker support. |

### Check your Node version

```bash
node --version
```

If you see `v22.x.y`, jump to [Getting the project running](#getting-the-project-running).
If you see anything older than `v18`, or you want to align with the
repo, keep reading.

### Installing / switching Node with nvm

`nvm` is a Node Version Manager. It lets you have multiple Node
versions installed side by side and switch between them per project
(via the `.nvmrc` file this repo ships with).

**If you already have nvm:**

```bash
nvm install 22       # first time only
nvm use              # reads .nvmrc
node --version       # v22.x.y
```

**If you don't have nvm — install it with Homebrew (Mac / Linux):**

```bash
# 1. Install brew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install nvm
brew install nvm

# 3. Wire nvm into your shell — paste these into ~/.zshrc (Mac default) or ~/.bashrc
mkdir -p ~/.nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && \. "$(brew --prefix nvm)/nvm.sh"

# 4. Reload your shell
source ~/.zshrc   # or ~/.bashrc

# 5. Install Node 22 and activate it
nvm install 22
nvm use
```

**Windows users:** install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
instead — the Unix-style nvm does not work on native Windows. Using
WSL2 (where the Unix instructions above work as-is) is what this
repo is tested on.

---

## Getting the project running

```bash
# 1. Clone
git clone https://github.com/Hyperxq/mock-mode-workshop.git
cd mock-mode-workshop

# 2. Make sure Node 22 is active (reads .nvmrc)
nvm use

# 3. Install
npm install

# 4. Run in mock mode (the workshop default)
npm run dev:mock
```

Open [http://localhost:5173](http://localhost:5173).

> **Heads up — the repo you just cloned is intentionally
> half-wired.** Some calls are commented out so the workshop can
> reveal them one phase at a time. Expect the page to look broken
> on your first run. That's the point. `WORKSHOP.md` walks you
> through every uncomment.

---

## The scripts

All mock-related flags are **injected inline** in `package.json`
via `cross-env`. There's only one committed env file
(`.env.development`) and it only carries `VITE_API_BASE`. That way
the intent of each command is visible at the script name and a CI
pipeline can override any flag without touching any file.

| Script              | What it does                                                                            |
| ------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`       | Plain Vite. No mock flag. The header pill shows "Mock unavailable" (disabled).          |
| `npm run dev:mock`  | `cross-env VITE_ENABLE_MOCKING=true vite`. Worker registered, pill is the runtime toggle. |
| `npm run dev:hybrid`| `cross-env VITE_ENABLE_MOCKING=true VITE_MSW_OMIT_KEYS=GET_HOSTS vite`. `/users` passes through. |
| `npm run build`     | Production build **without** mocks. MSW is tree-shaken out of the bundle.               |
| `npm run build:mock`| Production build **with** mocks. For bundle-size comparison only.                       |
| `npm run test:run`  | Vitest once (handler specs + component tests + section tests).                          |
| `npm run test`      | Vitest in watch mode.                                                                   |
| `npm run lint`      | ESLint.                                                                                 |

---

## How the mocks are wired

```
mocks/
├── core/
│   ├── backend.ts        Single source of the real API URL
│   ├── env.d.ts          Typed `import.meta.env`
│   ├── errors.ts         notFound / badRequest / serverError helpers
│   ├── init.ts           initMocking() — dynamic import (tree-shakable)
│   ├── mock.config.ts    MockConfig + resolveMockConfig() + shouldMock()
│   ├── types.ts          MockRouteKey union
│   └── url.ts            URL helpers
├── domains/
│   ├── properties.mock.ts        propertyHandlers(config, baseUrl) ← factory
│   ├── properties.mock.spec.ts
│   ├── hosts.mock.ts             hostHandlers(config, baseUrl)
│   └── hosts.mock.spec.ts
├── browser.ts            setupWorker() (no initial handlers)
└── handlers.ts           createHandlers(config, baseUrl?) — composes every domain
```

### The big ideas

1. **Domains are factory functions.** Each one takes a typed
   `MockConfig` and a base URL, returns an array of handlers. That
   makes them trivially testable — a spec just constructs its own
   config and feeds any URL it wants.

2. **Handlers only carry paths.** A domain file never embeds a full
   URL. Composition happens in `handlers.ts` via `joinUrl`. The
   app runs under `https://jsonplaceholder.typicode.com` but tests
   run under `https://api.test.local` — same handlers, different
   baseUrl.

3. **Per-handler hybrid mode.** Every handler starts with
   `if (!shouldMock(config, 'GET_X')) return passthrough()`. That
   lets you send a single route to the real network without
   touching the rest. Driven by `VITE_MSW_OMIT_KEYS`.

4. **Tree-shaken in production.** `mocks/core/init.ts` starts with
   `if (import.meta.env.VITE_ENABLE_MOCKING !== 'true') return;`.
   Vite inlines the env var at build time. When mocks are off, the
   condition is a compile-time `true`, every `await import(...)`
   below it is unreachable, and Rollup removes the MSW chunks from
   the bundle entirely. `npm run build` vs `npm run build:mock`
   shows the diff (~229 KB).

### The four scenarios baked into the app

| # | Endpoint      | Mock ON                                | Mock OFF / hybrid                                 |
| - | ------------- | -------------------------------------- | ------------------------------------------------- |
| 1 | `/properties` | 12 curated stayvibe listings           | 404 (real API has no such route)                  |
| 2 | `/users`      | 4 CS pioneers with avatars + Superhost | 10 real JSONPlaceholder users, no avatars         |
| 3 | hybrid        | `npm run dev:hybrid`                   | `/properties` mocked, `/users` hits real API      |
| 4 | `/posts`      | real API (no mock handler)             | real API (auto-passthrough via `onUnhandledRequest`) |

Read `WORKSHOP.md` for the live-demo script.

---

## How we test

Tests live in three tiers. Each has a different relationship to
the mock layer:

| Tier                       | Location                                   | Couples to `mocks/`? |
| -------------------------- | ------------------------------------------ | -------------------- |
| **Unit**                   | `src/components/{PropertyCard,CategoryPills,MockToggle}.test.tsx`, `src/domains/properties/useProperties.test.ts` | **No** — `vi.mock` at the import boundary |
| **Section**                | `src/components/{HostsSection,PropertyGrid,StoriesSection}.test.tsx` | **Yes, on purpose** — MSW provides canonical fixtures |
| **Mock-infra**             | `mocks/domains/*.mock.spec.ts`             | Obviously — they test the mocks themselves |

The rule:

> Mock mode is a dev-and-demo tool. It is NOT a testing framework.
> If we deleted `mocks/` tomorrow, every **unit** test would still
> pass. Section tests lean on MSW *as a fixture library* — that
> coupling is the price for not hardcoding twelve fake properties
> in every test file.

Run everything:

```bash
npm run test:run
```

Run only the decoupled tier to prove the point:

```bash
npx vitest run src/components/PropertyCard.test.tsx \
               src/components/CategoryPills.test.tsx \
               src/components/MockToggle.test.tsx \
               src/domains/properties/useProperties.test.ts
```

---

## What to do next

You're ready for the workshop itself. Open [WORKSHOP.md](./WORKSHOP.md)
and follow the phases.

If you're a Claude Code / AI-assisted coder, the
`skills/msw-route/SKILL.md` file documents the conventions the
project uses to add a new domain — load it when asking an assistant
for help.

Stuck? Switch to the `solution` branch to see the finished state:

```bash
git switch solution
```

Good luck.
