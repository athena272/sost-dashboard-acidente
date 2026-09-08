import { useEffect, useState } from 'react';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  UserRole,
} from '@sost/shared';
import { ClearFiltersButton } from '../../components/ClearFiltersButton';
import { SearchField } from '../../components/forms/SearchField';
import { PaginationBar } from '../../components/pagination/PaginationBar';
import { PaginationSummary } from '../../components/pagination/PaginationSummary';
import { api } from '../../lib/api';
import {
  DEFAULT_USERS_LIST_FILTERS,
  buildUsersListParams,
  type UsersListFilters,
} from './usersListFilters';

type UserItem = {
  _id?: string;
  id?: string;
  username: string;
  role: UserRole;
  name?: string;
  createdAt?: string;
};

type ListResponse = {
  items: UserItem[];
  total: number;
  page: number;
  totalPages: number;
};

export function UsersPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [q, setQ] = useState(DEFAULT_USERS_LIST_FILTERS.q);
  const [role, setRole] = useState(DEFAULT_USERS_LIST_FILTERS.role);
  const [createdFrom, setCreatedFrom] = useState(
    DEFAULT_USERS_LIST_FILTERS.createdFrom,
  );
  const [createdTo, setCreatedTo] = useState(
    DEFAULT_USERS_LIST_FILTERS.createdTo,
  );
  const [sortBy, setSortBy] = useState(DEFAULT_USERS_LIST_FILTERS.sortBy);
  const [sortDir, setSortDir] = useState(DEFAULT_USERS_LIST_FILTERS.sortDir);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(
    nextPage = page,
    overrides?: Partial<UsersListFilters>,
  ) {
    setLoading(true);
    setError('');
    try {
      const filters: UsersListFilters = {
        q: overrides?.q ?? q,
        role: overrides?.role ?? role,
        createdFrom: overrides?.createdFrom ?? createdFrom,
        createdTo: overrides?.createdTo ?? createdTo,
        sortBy: overrides?.sortBy ?? sortBy,
        sortDir: overrides?.sortDir ?? sortDir,
      };
      const params = buildUsersListParams(nextPage, filters);
      const result = await api<ListResponse>(`/users?${params}`);
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
    setQ(DEFAULT_USERS_LIST_FILTERS.q);
    setRole(DEFAULT_USERS_LIST_FILTERS.role);
    setCreatedFrom(DEFAULT_USERS_LIST_FILTERS.createdFrom);
    setCreatedTo(DEFAULT_USERS_LIST_FILTERS.createdTo);
    setSortBy(DEFAULT_USERS_LIST_FILTERS.sortBy);
    setSortDir(DEFAULT_USERS_LIST_FILTERS.sortDir);
    void load(1, DEFAULT_USERS_LIST_FILTERS);
  }

  async function changeRole(user: UserItem, nextRole: UserRole) {
    const id = user.id ?? user._id;
    if (!id) return;
    if (!confirm(`Alterar ${user.username} para ${ROLE_LABELS[nextRole]}?`)) return;
    await api(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: nextRole }),
    });
    await load(page);
  }

  return (
    <div className="stack">
      <div>
        <h1>Usuários</h1>
        <p className="muted">
          Busque e gerencie perfis Visualizador e Editor de registros. O Administrador não pode ser
          rebaixado por esta tela.
        </p>
      </div>

      <div className="card toolbar">
        <div className="toolbar-search">
          <div className="field">
            <label htmlFor="users-search">Busca</label>
            <SearchField
              id="users-search"
              value={q}
              onChange={setQ}
              placeholder="Digite o usuário ou o nome"
              aria-label="Buscar por usuário ou nome"
            />
          </div>
        </div>
        <div className="toolbar-controls">
          <div className="field">
            <label htmlFor="users-role">Perfil</label>
            <select
              id="users-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Todos</option>
              {Object.values(UserRole).map((value) => (
                <option key={value} value={value}>
                  {ROLE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="users-created-from">Criado de</label>
            <input
              id="users-created-from"
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="users-created-to">Criado até</label>
            <input
              id="users-created-to"
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="users-sort-by">Ordenar por</label>
            <select
              id="users-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Data de criação</option>
              <option value="username">Usuário</option>
              <option value="role">Perfil</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="users-sort-dir">Direção</label>
            <select
              id="users-sort-dir"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
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
          <PaginationSummary
            className="pagination-summary-top"
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            summaryLabel="usuário(s)"
          />
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Nome</th>
                <th>Perfil</th>
                <th>Criado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => {
                const id = item.id ?? item._id ?? item.username;
                return (
                  <tr key={id}>
                    <td>{item.username}</td>
                    <td>{item.name ?? '—'}</td>
                    <td>
                      <strong>{ROLE_LABELS[item.role]}</strong>
                      <div className="muted">{ROLE_DESCRIPTIONS[item.role]}</div>
                    </td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td>
                      {item.role === UserRole.Viewer ? (
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => void changeRole(item, UserRole.Editor)}
                        >
                          Tornar Editor de registros
                        </button>
                      ) : null}
                      {item.role === UserRole.Editor ? (
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => void changeRole(item, UserRole.Viewer)}
                        >
                          Tornar Visualizador
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <PaginationBar
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            summaryLabel="usuário(s)"
            onPageChange={(next) => void load(next)}
          />
        </div>
      ) : null}
    </div>
  );
}
