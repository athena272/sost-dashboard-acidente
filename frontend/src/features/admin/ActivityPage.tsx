import { useEffect, useState } from 'react';
import {
  ACTIVITY_ACTION_LABELS,
  ActivityAction,
} from '@sost/shared';
import { ClearFiltersButton } from '../../components/ClearFiltersButton';
import { SearchField } from '../../components/forms/SearchField';
import { api } from '../../lib/api';
import {
  DEFAULT_ACTIVITY_LIST_FILTERS,
  buildActivityListParams,
  type ActivityListFilters,
} from './activityListFilters';

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
  const [q, setQ] = useState(DEFAULT_ACTIVITY_LIST_FILTERS.q);
  const [action, setAction] = useState(DEFAULT_ACTIVITY_LIST_FILTERS.action);
  const [createdFrom, setCreatedFrom] = useState(
    DEFAULT_ACTIVITY_LIST_FILTERS.createdFrom,
  );
  const [createdTo, setCreatedTo] = useState(
    DEFAULT_ACTIVITY_LIST_FILTERS.createdTo,
  );
  const [sortDir, setSortDir] = useState(DEFAULT_ACTIVITY_LIST_FILTERS.sortDir);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(
    nextPage = page,
    overrides?: Partial<ActivityListFilters>,
  ) {
    setLoading(true);
    setError('');
    try {
      const filters: ActivityListFilters = {
        q: overrides?.q ?? q,
        action: overrides?.action ?? action,
        createdFrom: overrides?.createdFrom ?? createdFrom,
        createdTo: overrides?.createdTo ?? createdTo,
        sortDir: overrides?.sortDir ?? sortDir,
      };
      const params = buildActivityListParams(nextPage, filters);
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

  function clearFilters() {
    setQ(DEFAULT_ACTIVITY_LIST_FILTERS.q);
    setAction(DEFAULT_ACTIVITY_LIST_FILTERS.action);
    setCreatedFrom(DEFAULT_ACTIVITY_LIST_FILTERS.createdFrom);
    setCreatedTo(DEFAULT_ACTIVITY_LIST_FILTERS.createdTo);
    setSortDir(DEFAULT_ACTIVITY_LIST_FILTERS.sortDir);
    void load(1, DEFAULT_ACTIVITY_LIST_FILTERS);
  }

  return (
    <div className="stack">
      <div>
        <h1>Histórico de atividades</h1>
        <p className="muted">
          Log das ações relevantes do sistema (login, cadastros, alterações de perfil e acidentes).
        </p>
      </div>

      <div className="card toolbar">
        <div className="toolbar-search">
          <div className="field">
            <label htmlFor="activity-search">Busca</label>
            <SearchField
              id="activity-search"
              value={q}
              onChange={setQ}
              placeholder="Digite usuário, ação ou entidade"
              aria-label="Buscar no histórico de atividades"
            />
          </div>
        </div>
        <div className="toolbar-controls">
          <div className="field">
            <label htmlFor="activity-action">Ação</label>
            <select
              id="activity-action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="">Todas</option>
              {Object.values(ActivityAction).map((value) => (
                <option key={value} value={value}>
                  {ACTIVITY_ACTION_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="activity-created-from">De</label>
            <input
              id="activity-created-from"
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="activity-created-to">Até</label>
            <input
              id="activity-created-to"
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="activity-sort-dir">Ordenação</label>
            <select
              id="activity-sort-dir"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigas</option>
            </select>
          </div>
          <button className="btn" type="button" onClick={() => void load(1)}>
            Filtrar
          </button>
          <ClearFiltersButton onClick={clearFilters} />
        </div>
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
