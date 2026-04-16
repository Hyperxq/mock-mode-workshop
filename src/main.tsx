import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initMocking } from '../mocks/core/init';
import App from './App';
import './index.css';

/**
 * Async bootstrap.
 *
 * We MUST await `initMocking()` before the first render. If we
 * don't, the component tree might fire requests before the service
 * worker has finished registering, and those early requests will
 * hit the network instead of the mock.
 *
 * When `VITE_ENABLE_MOCKING` is off, `initMocking` returns
 * immediately and this is a no-op.
 */
async function bootstrap() {
  await initMocking();

  const container = document.getElementById('root');
  if (!container) throw new Error('Root container not found');

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
