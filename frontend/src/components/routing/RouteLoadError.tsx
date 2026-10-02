import { RefreshCw } from 'lucide-react';
import { reloadPage } from '../../lib/reloadPage';

export const ROUTE_LOAD_ERROR_TITLE = 'Não foi possível abrir esta tela.';

/** Aviso exibido no lugar de uma tela que não conseguiu abrir (ex.: arquivo removido por um novo deploy). */
export function RouteLoadError() {
  return (
    <div className="card route-load-error" role="alert">
      <h2>{ROUTE_LOAD_ERROR_TITLE}</h2>
      <p className="muted">
        Uma nova versão do sistema pode ter sido publicada ou a conexão falhou.
        Recarregue a página.
      </p>
      <button className="btn btn-with-icon" type="button" onClick={reloadPage}>
        <RefreshCw size={16} strokeWidth={2} aria-hidden />
        Recarregar página
      </button>
    </div>
  );
}
