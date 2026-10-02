import { lazy, type ComponentType } from 'react';

/**
 * `React.lazy` para módulos com export nomeado: a tela vira um arquivo próprio,
 * baixado só na primeira vez em que é renderizada.
 * Precisa ficar sob um `LazyRouteBoundary`, que fornece o loader e o tratamento de erro.
 */
export function lazyPage<
  TKey extends PropertyKey,
  TModule extends Record<TKey, ComponentType>,
>(load: () => Promise<TModule>, exportName: TKey) {
  return lazy(() =>
    load().then((module) => ({ default: module[exportName] })),
  );
}
