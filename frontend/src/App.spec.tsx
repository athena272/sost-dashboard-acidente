/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '@sost/shared';
import { App } from './App';
import { useAuth } from './features/auth/AuthContext';

vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));

vi.mock('./features/auth/AuthContext', () => ({ useAuth: vi.fn() }));

vi.mock('./lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./lib/api')>()),
  // Never settles, so pages stay in their loading state without hitting the network.
  api: vi.fn(() => new Promise(() => {})),
}));

type AuthValue = ReturnType<typeof useAuth>;

const VIEWER: NonNullable<AuthValue['user']> = {
  id: 'u1',
  username: 'viewer_sost',
  role: UserRole.Viewer,
};

function mockAuth(overrides: Partial<AuthValue>) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    canWriteAccidents: false,
    isAdmin: false,
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    refreshMe: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    ...overrides,
  });
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function expectDeveloperFooter() {
  const footer = screen.getByRole('contentinfo');
  const nav = within(footer).getByRole('navigation', {
    name: 'Contato do desenvolvedor',
  });

  expect(within(nav).getAllByRole('link')).toHaveLength(3);
  expect(within(footer).getByText('Guilherme R. Alves')).toBeTruthy();
  return footer;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('App developer footer', () => {
  it.each(['/login', '/register'])(
    'shows a non-sticky footer on the public page %s',
    (path) => {
      mockAuth({});
      renderAt(path);

      const footer = expectDeveloperFooter();
      expect(footer.classList.contains('app-footer--sticky')).toBe(false);
    },
  );

  it('shows the footer while the session is loading', () => {
    mockAuth({ loading: true });
    renderAt('/');

    expect(screen.getByText('Carregando…')).toBeTruthy();
    const footer = expectDeveloperFooter();
    expect(footer.classList.contains('app-footer--sticky')).toBe(false);
  });

  it('shows the footer after redirecting an unknown route to login', () => {
    mockAuth({});
    renderAt('/rota-inexistente');

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeTruthy();
    expectDeveloperFooter();
  });

  it.each(['/accidents', '/profile'])(
    'shows a sticky footer on the authenticated page %s',
    (path) => {
      mockAuth({ user: VIEWER });
      renderAt(path);

      expect(screen.getByRole('banner')).toBeTruthy();
      const footer = expectDeveloperFooter();
      expect(footer.classList.contains('app-footer--sticky')).toBe(true);
    },
  );
});
