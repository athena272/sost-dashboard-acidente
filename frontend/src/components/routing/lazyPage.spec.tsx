/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { lazyPage } from './lazyPage';

afterEach(() => {
  cleanup();
});

describe('lazyPage', () => {
  it('renders the named export of the loaded module', async () => {
    const AccidentsPage = lazyPage(
      () =>
        Promise.resolve({
          AccidentsPage: () => <h1>Registros de CAT</h1>,
          OtherPage: () => <h1>Outra tela</h1>,
        }),
      'AccidentsPage',
    );

    render(
      <Suspense fallback={<p>Carregando…</p>}>
        <AccidentsPage />
      </Suspense>,
    );

    expect(await screen.findByRole('heading', { name: 'Registros de CAT' })).toBeTruthy();
    expect(screen.queryByText('Outra tela')).toBeNull();
  });
});
