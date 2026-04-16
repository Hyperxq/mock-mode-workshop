/**
 * Typed shape of the env vars the mock layer reads from Vite.
 *
 * Keep this list the SINGLE source of truth for `import.meta.env.VITE_*`
 * entries that mock-related code relies on. The app-side types in
 * `src/vite-env.d.ts` can reference the same shape for consistency.
 */
export interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_ENABLE_MOCKING?: string;
  readonly VITE_MSW_OMIT_KEYS?: string;
  readonly VITE_MSW_ON_UNHANDLED?: 'bypass' | 'warn' | 'error';
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
