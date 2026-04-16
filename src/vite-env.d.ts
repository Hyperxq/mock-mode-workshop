/// <reference types="vite/client" />

/**
 * The app-side mirror of `mocks/core/env.d.ts`. Kept in sync so any
 * `import.meta.env.VITE_*` read from `src/` is type-checked the
 * same way as reads from `mocks/`.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_ENABLE_MOCKING?: string;
  readonly VITE_MSW_OMIT_KEYS?: string;
  readonly VITE_MSW_ON_UNHANDLED?: 'bypass' | 'warn' | 'error';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
