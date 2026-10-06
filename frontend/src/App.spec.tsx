/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { acronymLabel, ROLE_LABELS, UserRole } from '@sost/shared';
import { App } from './App';
import { DEVELOPER_CONTACTS } from './components/layout/developerProfile';
import { ROUTE_LOADING_MESSAGE } from './components/routing/LazyRouteBoundary';
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

const EDITOR: NonNullable<AuthValue['user']> = {
  id: 'u2',
  username: 'editor_sost',
  role: UserRole.Editor,
};

const ADMIN: NonNullable<AuthValue['user']> = {
  id: 'u3',
  username: 'admin_sost',
  role: UserRole.Admin,
};

const VIEWER_AUTH: Partial<AuthValue> = { user: VIEWER };
const EDITOR_AUTH: Partial<AuthValue> = { user: EDITOR, canWriteAccidents: true };
const ADMIN_AUTH: Partial<AuthValue> = {
  user: ADMIN,
  canWriteAccidents: true,
  isAdmin: true,
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

/** First import of a lazy page makes Vitest transform its module tree (e.g. recharts), which can exceed the 1s default. */
const LAZY_PAGE_TIMEOUT = { timeout: 10_000 };

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

  expect(within(nav).getAllByRole('link')).toHaveLength(
    DEVELOPER_CONTACTS.length,
  );
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

describe('App lazy-loaded authenticated pages', { timeout: 15_000 }, () => {
  it.each([
    ['/', `Dashboard — ${acronymLabel('SOST')}`, VIEWER_AUTH],
    ['/accidents', `Registros de ${acronymLabel('CAT')}`, VIEWER_AUTH],
    ['/accidents/new', `Novo registro de ${acronymLabel('CAT')}`, EDITOR_AUTH],
    ['/profile', 'Meu perfil', VIEWER_AUTH],
    ['/users', 'Usuários', ADMIN_AUTH],
    ['/admin/requests', `Pedidos de ${ROLE_LABELS[UserRole.Editor]}`, ADMIN_AUTH],
    ['/activity', 'Histórico de atividades', ADMIN_AUTH],
  ])('%s opens its own page instead of staying on the loader', async (path, title, auth) => {
    mockAuth(auth);
    renderAt(path);

    expect(
      await screen.findByRole('heading', { level: 1, name: title }, LAZY_PAGE_TIMEOUT),
    ).toBeTruthy();
    expect(screen.queryByText(ROUTE_LOADING_MESSAGE)).toBeNull();
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('opens the accident detail page, which then shows its own data loading state', async () => {
    mockAuth(VIEWER_AUTH);
    renderAt('/accidents/abc123');

    expect(await screen.findByText('Carregando…', {}, LAZY_PAGE_TIMEOUT)).toBeTruthy();
    expect(screen.queryByText(ROUTE_LOADING_MESSAGE)).toBeNull();
  });

  it('redirects a viewer away from the new accident form', async () => {
    mockAuth(VIEWER_AUTH);
    renderAt('/accidents/new');

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: `Registros de ${acronymLabel('CAT')}` },
        LAZY_PAGE_TIMEOUT,
      ),
    ).toBeTruthy();
  });

  it('redirects a non-admin away from admin pages', async () => {
    mockAuth(EDITOR_AUTH);
    renderAt('/users');

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: `Dashboard — ${acronymLabel('SOST')}` },
        LAZY_PAGE_TIMEOUT,
      ),
    ).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Usuários' })).toBeNull();
  });

  it('redirects to login without a session, rendering neither the page nor the loader', () => {
    mockAuth({});
    renderAt('/accidents');

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeTruthy();
    expect(screen.queryByText(ROUTE_LOADING_MESSAGE)).toBeNull();
    expect(
      screen.queryByRole('heading', { name: `Registros de ${acronymLabel('CAT')}` }),
    ).toBeNull();
  });
});
