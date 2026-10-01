/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { AppFooter } from './AppFooter';

afterEach(() => {
  cleanup();
});

const EXPECTED_LINKS = [
  {
    name: 'WhatsApp (abre em nova aba)',
    href: 'https://wa.me/5579999007075',
  },
  {
    name: 'LinkedIn (abre em nova aba)',
    href: 'https://www.linkedin.com/in/guigorosario/',
  },
  {
    name: 'GitHub (abre em nova aba)',
    href: 'https://github.com/athena272',
  },
];

describe('AppFooter', () => {
  it('groups the contact links in a labelled navigation landmark', () => {
    render(<AppFooter />);

    const nav = screen.getByRole('navigation', {
      name: 'Contato do desenvolvedor',
    });
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      EXPECTED_LINKS.map((link) => link.href),
    );
  });

  it.each(EXPECTED_LINKS)(
    'renders $name opening safely in a new tab',
    ({ name, href }) => {
      render(<AppFooter />);

      const link = screen.getByRole('link', { name });

      expect(link.getAttribute('href')).toBe(href);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
        'true',
      );
    },
  );

  it('shows the credit with the separator hidden from screen readers', () => {
    render(<AppFooter />);

    const name = screen.getByText('Guilherme R. Alves');
    const credit = name.closest('p');

    expect(name.tagName).toBe('STRONG');
    expect(screen.getByText('Engenheiro de Software')).toBeTruthy();
    expect(credit?.textContent).toBe(
      'Desenvolvido por Guilherme R. Alves · , Engenheiro de Software',
    );
    expect(screen.getByText('·').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText(',').classList.contains('visually-hidden')).toBe(
      true,
    );
  });

  it('shows the rights notice with the current year', () => {
    render(<AppFooter />);

    expect(
      screen.getByText(
        `© ${new Date().getFullYear()} Todos os direitos reservados.`,
      ),
    ).toBeTruthy();
  });

  it('appends the given className to the base class', () => {
    const { container } = render(<AppFooter className="app-footer--sticky" />);
    const footer = container.querySelector('footer');

    expect(footer?.className).toBe('app-footer app-footer--sticky');
    expect(screen.getByRole('contentinfo')).toBe(footer);
  });
});
