/**
 * Loaders das telas autenticadas (mesmo `import()` usado por `lazyPage` em `App.tsx`).
 * Paths alinham com o menu (`navItems`) para preload no hover/focus.
 */
export const authenticatedPageLoaders = {
  '/': () => import('../../features/dashboard/DashboardPage'),
  '/accidents': () => import('../../features/accidents/AccidentsPage'),
  '/accidents/new': () => import('../../features/accidents/AccidentFormPage'),
  '/profile': () => import('../../features/users/ProfilePage'),
  '/users': () => import('../../features/users/UsersPage'),
  '/admin/requests': () => import('../../features/admin/AdminRequestsPage'),
  '/activity': () => import('../../features/admin/ActivityPage'),
} as const;

export type AuthenticatedPagePath = keyof typeof authenticatedPageLoaders;

const preloadCache = new Map<string, Promise<unknown>>();

/**
 * Dispara o `import()` do chunk da rota (idempotente). Paths fora do mapa são ignorados.
 */
export function preloadAuthenticatedPage(path: string): void {
  if (!Object.hasOwn(authenticatedPageLoaders, path)) return;
  if (preloadCache.has(path)) return;

  const load = authenticatedPageLoaders[path as AuthenticatedPagePath];
  const pending = load().catch(() => {
    preloadCache.delete(path);
  });
  preloadCache.set(path, pending);
}

/** Limpa o cache de preload (apenas testes). */
export function resetAuthenticatedPagePreloadCache(): void {
  preloadCache.clear();
}
