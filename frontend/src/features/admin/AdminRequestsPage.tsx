import { useEffect, useState } from 'react';
import {
  EDITOR_REQUEST_STATUS_LABELS,
  EditorRequestStatus,
  ROLE_LABELS,
  UserRole,
} from '@sost/shared';
import { api } from '../../lib/api';

type EditorRequest = {
  _id: string;
  username: string;
  status: EditorRequestStatus;
  message?: string;
  createdAt?: string;
};

export function AdminRequestsPage() {
  const [items, setItems] = useState<EditorRequest[]>([]);
  const [status, setStatus] = useState<string>(EditorRequestStatus.Pending);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const result = await api<EditorRequest[]>(`/editor-requests?${params}`);
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function approve(id: string) {
    await api(`/editor-requests/${id}/approve`, { method: 'POST' });
    await load();
  }

  async function reject(id: string) {
    await api(`/editor-requests/${id}/reject`, { method: 'POST' });
    await load();
  }

  return (
    <div className="stack">
      <div>
        <h1>Pedidos de {ROLE_LABELS[UserRole.Editor]}</h1>
        <p className="muted">
          Aprove ou rejeite solicitações de Visualizadores que precisam cadastrar e alterar registros.
        </p>
      </div>

      <div className="card toolbar">
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {Object.values(EditorRequestStatus).map((value) => (
              <option key={value} value={value}>
                {EDITOR_REQUEST_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <button className="btn secondary" type="button" onClick={() => void load()}>
          Atualizar
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Carregando…</p> : null}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Status</th>
              <th>Mensagem</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.username}</td>
                <td>{EDITOR_REQUEST_STATUS_LABELS[item.status]}</td>
                <td>{item.message ?? '—'}</td>
                <td>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString('pt-BR')
                    : '—'}
                </td>
                <td>
                  {item.status === EditorRequestStatus.Pending ? (
                    <div className="actions">
                      <button
                        className="btn"
                        type="button"
                        onClick={() => void approve(item._id)}
                      >
                        Aprovar
                      </button>
                      <button
                        className="btn danger"
                        type="button"
                        onClick={() => void reject(item._id)}
                      >
                        Rejeitar
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && items.length === 0 ? (
          <p className="muted">Nenhuma solicitação neste filtro.</p>
        ) : null}
      </div>
    </div>
  );
}
