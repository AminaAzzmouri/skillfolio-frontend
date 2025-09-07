import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import 'whatwg-fetch';

/** Reset all module mocks between tests (important for withStore + router mocks) */
beforeEach(() => {
  vi.resetModules();
});

/* =========================
   MSW (shared server with handlers)
   Make sure you created src/test/mswServer.js from my previous message.
   ========================= */
import { server } from './mswServer';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' })); // <- no more hard crashes
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

/* =========================
   JSDOM shims (quiet down UI libs)
   ========================= */
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!window.ResizeObserver) {
  window.ResizeObserver = RO;
}

/* =========================
   React Router: global navigate spy
   All tests can assert via: globalThis.__navigateSpy
   ========================= */
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig();
  const navigateSpy = vi.fn();
  globalThis.__navigateSpy = navigateSpy;
  return {
    __esModule: true,
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

/* =========================
   Optional: silence framer-motion during tests
   ========================= */
vi.mock('framer-motion', async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    motion: new Proxy(
      {},
      { get: () => (props) => props?.children ?? null }
    ),
  };
});