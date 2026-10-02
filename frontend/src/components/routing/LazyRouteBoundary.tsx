import { Suspense, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RouteErrorBoundary } from './RouteErrorBoundary';

export const ROUTE_LOADING_MESSAGE = 'Carregando tela…';

type LazyRouteBoundaryProps = {
  children: ReactNode;
};

/**
 * Envolve telas carregadas sob demanda (`lazyPage`): mostra o loader enquanto o arquivo
 * da tela é baixado e um aviso com opção de recarregar se ele não carregar.
 *
 * A `key` por rota é necessária: o React Router navega dentro de `startTransition`, e um
 * Suspense já visível manteria a tela anterior sem loader. Um boundary novo exibe o loader
 * e também descarta o erro da tela anterior.
 */
export function LazyRouteBoundary({ children }: LazyRouteBoundaryProps) {
  const { pathname } = useLocation();

  return (
    <RouteErrorBoundary key={pathname}>
      <Suspense
        fallback={
          <p className="muted" role="status" aria-live="polite">
            {ROUTE_LOADING_MESSAGE}
          </p>
        }
      >
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
}
