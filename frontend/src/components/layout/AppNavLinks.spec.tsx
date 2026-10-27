/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppNavLinks } from './AppNavLinks';

const preloadAuthenticatedPage = vi.fn();

vi.mock('../routing/authenticatedPageLoaders', () => ({
  preloadAuthenticatedPage: (...args: unknown[]) =>
    preloadAuthenticatedPage(...args),
}));

afterEach(() => {
  cleanup();
  preloadAuthenticatedPage.mockClear();
});

function renderNav(
  props: Partial<Parameters<typeof AppNavLinks>[0]> = {},
) {
  return render(
    <MemoryRouter>
      <AppNavLinks
        canWriteAccidents={false}
        isAdmin={false}
        pendingRequests={0}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('AppNavLinks preload', () => {
  it('preloads the route chunk on mouse enter', async () => {
    const user = userEvent.setup();
    renderNav();

    await user.hover(screen.getByRole('link', { name: /Registros/i }));

    expect(preloadAuthenticatedPage).toHaveBeenCalledWith('/accidents');
  });

  it('preloads the route chunk on focus', () => {
    renderNav();

    screen.getByRole('link', { name: /Perfil/i }).focus();

    expect(preloadAuthenticatedPage).toHaveBeenCalledWith('/profile');
  });

  it('only exposes links the user can see (no admin preload targets)', () => {
    renderNav({ isAdmin: false, canWriteAccidents: false });

    expect(screen.queryByRole('link', { name: /Usuários/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Pedidos/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Histórico/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /^Novo$/i })).toBeNull();
  });
});
