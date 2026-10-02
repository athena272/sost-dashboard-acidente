/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lazy, Suspense } from 'react';
import { reloadPage } from '../../lib/reloadPage';
import { silenceExpectedRenderErrors } from '../../testing/silenceExpectedRenderErrors';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { ROUTE_LOAD_ERROR_TITLE } from './RouteLoadError';

vi.mock('../../lib/reloadPage', () => ({ reloadPage: vi.fn() }));

/** Simulates the chunk of a page that no longer exists after a new deploy. */
const MissingChunkPage = lazy(() =>
  Promise.reject(new TypeError('Failed to fetch dynamically imported module')),
);

function renderMissingChunk(routeKey: string) {
  return render(
    <RouteErrorBoundary key={routeKey}>
      <Suspense fallback={<p>Carregando…</p>}>
        <MissingChunkPage />
      </Suspense>
    </RouteErrorBoundary>,
  );
}

describe('RouteErrorBoundary', () => {
  let restoreErrorReporting: () => void;

  beforeEach(() => {
    restoreErrorReporting = silenceExpectedRenderErrors();
  });

  afterEach(() => {
    cleanup();
    restoreErrorReporting();
    vi.clearAllMocks();
  });

  it('renders its children when nothing fails', () => {
    render(
      <RouteErrorBoundary>
        <p>Registros de CAT</p>
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('Registros de CAT')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('replaces a blank screen with a warning when the page chunk fails to load', async () => {
    renderMissingChunk('/accidents');

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(ROUTE_LOAD_ERROR_TITLE);
  });

  it('reloads the page once when the user clicks the reload button', async () => {
    const user = userEvent.setup();
    renderMissingChunk('/accidents');
    await screen.findByRole('alert');

    await user.click(screen.getByRole('button', { name: 'Recarregar página' }));

    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it('clears the error when the route changes', async () => {
    const { rerender } = renderMissingChunk('/accidents');
    await screen.findByRole('alert');

    rerender(
      <RouteErrorBoundary key="/profile">
        <p>Meu perfil</p>
      </RouteErrorBoundary>,
    );

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Meu perfil')).toBeTruthy();
  });
});
