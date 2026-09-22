/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentProps } from 'react';
import { UserRole } from '@sost/shared';
import { AppHeader } from './AppHeader';

afterEach(() => {
  cleanup();
});

function renderHeader(
  props: Partial<ComponentProps<typeof AppHeader>> = {},
  initialEntries: string[] = ['/'],
) {
  const onLogout = vi.fn();
  const result = render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppHeader
        user={{ username: 'admin_sost', role: UserRole.Admin }}
        canWriteAccidents
        isAdmin
        pendingRequests={2}
        onLogout={onLogout}
        {...props}
      />
    </MemoryRouter>,
  );

  return { ...result, onLogout };
}

describe('AppHeader mobile menu', () => {
  it('starts closed and toggles aria-expanded', async () => {
    const user = userEvent.setup();
    renderHeader();

    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('.nav-panel--open')).toBeNull();

    await user.click(toggle);

    const closeToggle = screen.getByRole('button', { name: 'Fechar menu' });
    expect(closeToggle.getAttribute('aria-expanded')).toBe('true');
    expect(closeToggle.classList.contains('topbar-toggle')).toBe(true);
    expect(document.querySelector('.nav-panel--open')).not.toBeNull();

    await user.click(closeToggle);

    expect(
      screen
        .getByRole('button', { name: 'Abrir menu' })
        .getAttribute('aria-expanded'),
    ).toBe('false');
    expect(document.querySelector('.nav-panel--open')).toBeNull();
  });

  it('closes the menu after navigating via a nav link', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(document.querySelector('.nav-panel--open')).not.toBeNull();

    await user.click(screen.getByRole('link', { name: /Registros/i }));

    expect(
      screen
        .getByRole('button', { name: 'Abrir menu' })
        .getAttribute('aria-expanded'),
    ).toBe('false');
    expect(document.querySelector('.nav-panel--open')).toBeNull();
  });

  it('keeps admin links available when isAdmin is true', () => {
    renderHeader({ isAdmin: true, canWriteAccidents: true });

    expect(screen.getByRole('link', { name: /Usuários/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Pedidos/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Histórico/i })).toBeTruthy();
  });

  it('closes the menu when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(document.querySelector('.nav-panel--open')).not.toBeNull();

    await user.keyboard('{Escape}');

    expect(
      screen
        .getByRole('button', { name: 'Abrir menu' })
        .getAttribute('aria-expanded'),
    ).toBe('false');
  });
});
