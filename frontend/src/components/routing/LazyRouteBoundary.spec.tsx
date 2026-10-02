/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lazy, type ComponentType, type ReactNode } from 'react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { silenceExpectedRenderErrors } from '../../testing/silenceExpectedRenderErrors';
import { LazyRouteBoundary, ROUTE_LOADING_MESSAGE } from './LazyRouteBoundary';
import { ROUTE_LOAD_ERROR_TITLE } from './RouteLoadError';

vi.mock('../../lib/reloadPage', () => ({ reloadPage: vi.fn() }));

type PageModule = { default: ComponentType };

/** Lazy page whose loading the test controls: it only finishes when `resolvePage` is called. */
function createDeferredPage() {
  let resolvePage!: (module: PageModule) => void;
  const pageModule = new Promise<PageModule>((resolve) => {
    resolvePage = resolve;
  });
  return { Page: lazy(() => pageModule), resolvePage };
}

function renderInRoute(children: ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/accidents']}>
      <LazyRouteBoundary>{children}</LazyRouteBoundary>
    </MemoryRouter>,
  );
}

describe('LazyRouteBoundary', () => {
  let restoreErrorReporting: () => void;

  beforeEach(() => {
    restoreErrorReporting = silenceExpectedRenderErrors();
  });

  afterEach(() => {
    cleanup();
    restoreErrorReporting();
  });

  it('tells the user the page is loading while its chunk is downloaded', () => {
    const { Page } = createDeferredPage();
    renderInRoute(<Page />);

    expect(screen.getByRole('status').textContent).toBe(ROUTE_LOADING_MESSAGE);
  });

  it('swaps the loader for the page once the chunk finishes loading', async () => {
    const { Page, resolvePage } = createDeferredPage();
    renderInRoute(<Page />);
    expect(screen.getByRole('status')).toBeTruthy();

    await act(async () => {
      resolvePage({ default: () => <h1>Registros de CAT</h1> });
    });

    expect(screen.getByRole('heading', { name: 'Registros de CAT' })).toBeTruthy();
    expect(screen.queryByText(ROUTE_LOADING_MESSAGE)).toBeNull();
  });

  it('shows the error warning, not a blank screen, when the chunk fails', async () => {
    const FailingPage = lazy(() =>
      Promise.reject(new TypeError('Failed to fetch dynamically imported module')),
    );
    renderInRoute(<FailingPage />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(ROUTE_LOAD_ERROR_TITLE);
    expect(screen.queryByText(ROUTE_LOADING_MESSAGE)).toBeNull();
  });

  it('shows the loader again when navigating to another page that is still loading', async () => {
    const user = userEvent.setup();
    const { Page: ProfilePage } = createDeferredPage();
    render(
      <MemoryRouter initialEntries={['/accidents']}>
        <Link to="/profile">Ir para perfil</Link>
        <LazyRouteBoundary>
          <Routes>
            <Route path="/accidents" element={<h1>Registros de CAT</h1>} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </LazyRouteBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Registros de CAT' })).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Ir para perfil' }));

    expect(screen.getByRole('status').textContent).toBe(ROUTE_LOADING_MESSAGE);
    expect(screen.queryByRole('heading', { name: 'Registros de CAT' })).toBeNull();
  });
});
