import { useEffect, useState } from 'react';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  UserRole,
} from '@sost/shared';
import { api } from '../../lib/api';

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
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
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
        limit: '15',
        sortBy,
        sortDir,
      });
      if (q.trim()) params.set('q', q.trim());
      if (role) params.set('role', role);
      if (createdFrom) params.set('createdFrom', createdFrom);
      if (createdTo) params.set('createdTo', createdTo);
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
        <div className="field">
          <label>Busca</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Digite o usuário ou o nome" aria-label="Buscar por usuário ou nome" />
        </div>
        <div className="field">
          <label>Perfil</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Todos</option>
            {Object.values(UserRole).map((value) => (
              <option key={value} value={value}>
                {ROLE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Criado de</label>
          <input type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>Criado até</label>
          <input type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} />
        </div>
        <div className="field">
          <label>Ordenar por</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Data de criação</option>
            <option value="username">Usuário</option>
            <option value="role">Perfil</option>
          </select>
        </div>
        <div className="field">
          <label>Direção</label>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
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
          <div className="toolbar" style={{ marginTop: '1rem' }}>
            <span className="muted">
              {data.total} usuário(s) — página {data.page} de {data.totalPages}
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
