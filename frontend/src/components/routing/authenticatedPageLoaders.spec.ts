import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  authenticatedPageLoaders,
  preloadAuthenticatedPage,
  resetAuthenticatedPagePreloadCache,
} from './authenticatedPageLoaders';

afterEach(() => {
  resetAuthenticatedPagePreloadCache();
  vi.restoreAllMocks();
});

describe('authenticatedPageLoaders', () => {
  it('maps the authenticated nav paths to loaders', () => {
    expect(Object.keys(authenticatedPageLoaders).sort()).toEqual(
      [
        '/',
        '/accidents',
        '/accidents/new',
        '/activity',
        '/admin/requests',
        '/profile',
        '/users',
      ].sort(),
    );
  });
});

describe('preloadAuthenticatedPage', () => {
  it('loads a known path once when called repeatedly', async () => {
    const load = vi.fn(() => Promise.resolve({ AccidentsPage: () => null }));
    vi.spyOn(authenticatedPageLoaders, '/accidents').mockImplementation(load);

    preloadAuthenticatedPage('/accidents');
    preloadAuthenticatedPage('/accidents');

    expect(load).toHaveBeenCalledTimes(1);
    await expect(load.mock.results[0]?.value).resolves.toBeTruthy();
  });

  it('ignores unknown paths', () => {
    const load = vi.fn(() => Promise.resolve({}));
    vi.spyOn(authenticatedPageLoaders, '/').mockImplementation(load);

    preloadAuthenticatedPage('/not-a-route');

    expect(load).not.toHaveBeenCalled();
  });

  it('retries after a failed preload', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('chunk failed'))
      .mockResolvedValueOnce({ DashboardPage: () => null });
    vi.spyOn(authenticatedPageLoaders, '/').mockImplementation(load);

    preloadAuthenticatedPage('/');
    await expect(load.mock.results[0]?.value).rejects.toThrow('chunk failed');
    // Yield so the cache clears after the swallowed rejection.
    await Promise.resolve();

    preloadAuthenticatedPage('/');
    expect(load).toHaveBeenCalledTimes(2);
    await expect(load.mock.results[1]?.value).resolves.toBeTruthy();
  });
});
