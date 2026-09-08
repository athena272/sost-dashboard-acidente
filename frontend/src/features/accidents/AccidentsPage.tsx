import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { acronymLabel } from '@sost/shared';
import { api } from '../../lib/api';
import { Accident, sexLabel, statusLabel, typeLabel } from './types';

type ListResponse = {
  items: Accident[];
  total: number;
  page: number;
  totalPages: number;
};

export function AccidentsPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
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
      });
      if (search.trim()) params.set('search', search.trim());
      if (year.trim()) params.set('year', year.trim());
      const result = await api<ListResponse>(`/accidents?${params}`);
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

  async function onDelete(id: string) {
    if (!confirm('Excluir este registro?')) return;
    await api(`/accidents/${id}`, { method: 'DELETE' });
    await load(page);
  }

  return (
    <div className="stack">
      <div>
        <h1>Registros de {acronymLabel('CAT')}</h1>
        <p className="muted">
          Lista filtrável dos acidentes acompanhados pelo {acronymLabel('SOST')}.
        </p>
      </div>

      <div className="card toolbar">
        <div className="field">
          <label>Busca</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vítima, função, CID…"
          />
        </div>
        <div className="field">
          <label>Ano de emissão</label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2025"
          />
        </div>
        <button className="btn" type="button" onClick={() => void load(1)}>
          Filtrar
        </button>
        <Link className="btn" to="/accidents/new">
          Novo registro
        </Link>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Carregando…</p> : null}

      {data ? (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>{acronymLabel('CAT')}</th>
                <th>Vítima</th>
                <th>Função</th>
                <th>Tipo</th>
                <th>{acronymLabel('CID')}</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.accidentDate
                      ? new Date(item.accidentDate).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td>{item.catNumber ?? '—'}</td>
                  <td>
                    {item.victimName ?? '—'}
                    <div className="muted">{sexLabel(item.sex)}</div>
                  </td>
                  <td>
                    {item.role ?? '—'}
                    <div className="muted">{item.sector ?? '—'}</div>
                  </td>
                  <td>{typeLabel(item.accidentType)}</td>
                  <td>{item.cid ?? '—'}</td>
                  <td>{statusLabel(item.status)}</td>
                  <td>
                    <div className="actions">
                      <Link className="btn secondary" to={`/accidents/${item._id}`}>
                        Editar
                      </Link>
                      <button
                        className="btn danger"
                        type="button"
                        onClick={() => void onDelete(item._id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="toolbar" style={{ marginTop: '1rem' }}>
            <span className="muted">
              {data.total} registro(s) — página {data.page} de {data.totalPages}
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
