import { useEffect, useState } from 'react';
import {
  ACTIVITY_ACTION_LABELS,
  ActivityAction,
} from '@sost/shared';
import { api } from '../../lib/api';

type ActivityItem = {
  _id: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  actorUsername: string;
  details?: Record<string, unknown>;
  createdAt?: string;
};

type ListResponse = {
  items: ActivityItem[];
  total: number;
  page: number;
  totalPages: number;
};

export function ActivityPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(nextPage = page) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '20',
        sortDir,
      });
      if (q.trim()) params.set('q', q.trim());
      if (action) params.set('action', action);
      if (createdFrom) params.set('createdFrom', createdFrom);
      if (createdTo) params.set('createdTo', createdTo);
      const result = await api<ListResponse>(`/activity-logs?${params}`);
      setData(result);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stack">
      <div>
        <h1>Histórico de atividades</h1>
        <p className="muted">
          Log das ações relevantes do sistema (login, cadastros, alterações de perfil e acidentes).
        </p>
      </div>

      <div className="card toolbar">
        <div className="field">
          <label>Busca</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Usuário, ação, entidade…"
          />
        </div>
        <div className="field">
          <label>Ação</label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Todas</option>
            {Object.values(ActivityAction).map((value) => (
              <option key={value} value={value}>
                {ACTIVITY_ACTION_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>De</label>
          <input type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>Até</label>
          <input type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} />
        </div>
        <div className="field">
          <label>Ordenação</label>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigas</option>
          </select>
        </div>
        <button className="btn" type="button" onClick={() => void load(1)}>
          Filtrar
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Carregando…</p> : null}

      {data ? (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Ação</th>
                <th>Usuário</th>
                <th>Entidade</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString('pt-BR')
                      : '—'}
                  </td>
                  <td>{ACTIVITY_ACTION_LABELS[item.action] ?? item.action}</td>
                  <td>{item.actorUsername}</td>
                  <td>
                    {item.entityType}
                    {item.entityId ? ` · ${item.entityId}` : ''}
                  </td>
                  <td>
                    <code className="muted">
                      {item.details ? JSON.stringify(item.details) : '—'}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="toolbar" style={{ marginTop: '1rem' }}>
            <span className="muted">
              {data.total} evento(s) — página {data.page} de {data.totalPages}
            </span>
            <button
              className="btn secondary"
              type="button"
              disabled={page <= 1}
              onClick={() => void load(page - 1)}
            >
              Anterior
            </button>
            <button
              className="btn secondary"
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => void load(page + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
