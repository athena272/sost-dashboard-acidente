import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterX } from 'lucide-react';
import { acronymLabel } from '@sost/shared';
import { api } from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import {
  ACCIDENTS_SORT_OPTIONS,
  DEFAULT_ACCIDENTS_SORT_KEY,
  parseAccidentsSortKey,
} from './accidentsSort';
import { Accident, sexLabel, statusLabel, typeLabel } from './types';

type ListResponse = {
  items: Accident[];
  total: number;
  page: number;
  totalPages: number;
};

function normalizeDateRange(from: string, to: string) {
  if (from && to && from > to) {
    return { from: to, to: from };
  }
  return { from, to };
}

export function AccidentsPage() {
  const { canWriteAccidents } = useAuth();
  const [data, setData] = useState<ListResponse | null>(null);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState(DEFAULT_ACCIDENTS_SORT_KEY);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(
    nextPage = page,
    overrides?: {
      search?: string;
      year?: string;
      dateFrom?: string;
      dateTo?: string;
      sortKey?: string;
    },
  ) {
    setLoading(true);
    setError('');
    try {
      const nextSearch = overrides?.search ?? search;
      const nextYear = overrides?.year ?? year;
      const nextDateFrom = overrides?.dateFrom ?? dateFrom;
      const nextDateTo = overrides?.dateTo ?? dateTo;
      const nextSortKey = overrides?.sortKey ?? sortKey;

      const range = normalizeDateRange(nextDateFrom.trim(), nextDateTo.trim());
      if (
        overrides === undefined &&
        (range.from !== dateFrom || range.to !== dateTo)
      ) {
        setDateFrom(range.from);
        setDateTo(range.to);
      }

      const { sortBy, sortOrder } = parseAccidentsSortKey(nextSortKey);
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '15',
        sortBy,
        sortOrder,
      });
      if (nextSearch.trim()) params.set('search', nextSearch.trim());
      if (nextYear.trim()) params.set('year', nextYear.trim());
      if (range.from) params.set('accidentDateFrom', range.from);
      if (range.to) params.set('accidentDateTo', range.to);
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

  function clearFilters() {
    setSearch('');
    setYear('');
    setDateFrom('');
    setDateTo('');
    setSortKey(DEFAULT_ACCIDENTS_SORT_KEY);
    void load(1, {
      search: '',
      year: '',
      dateFrom: '',
      dateTo: '',
      sortKey: DEFAULT_ACCIDENTS_SORT_KEY,
    });
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
          <label htmlFor="accidents-search">Busca</label>
          <input
            id="accidents-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite vítima, função ou CID"
            aria-label="Buscar por vítima, função ou CID"
          />
        </div>
        <div className="field">
          <label htmlFor="accidents-year">Ano de emissão</label>
          <input
            id="accidents-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Digite o ano de emissão"
            inputMode="numeric"
            aria-label="Filtrar por ano de emissão"
          />
        </div>
        <div className="field">
          <label htmlFor="accidents-date-from">Data do acidente — De</label>
          <input
            id="accidents-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Data inicial do acidente"
          />
        </div>
        <div className="field">
          <label htmlFor="accidents-date-to">Data do acidente — Até</label>
          <input
            id="accidents-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Data final do acidente"
          />
        </div>
        <div className="field">
          <label htmlFor="accidents-sort">Ordenar por</label>
          <select
            id="accidents-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            aria-label="Ordenar listagem de acidentes"
          >
            {ACCIDENTS_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" type="button" onClick={() => void load(1)}>
          Filtrar
        </button>
        {canWriteAccidents ? (
          <Link className="btn" to="/accidents/new">
            Novo registro
          </Link>
        ) : null}
        <button
          className="btn secondary btn-with-icon"
          type="button"
          onClick={clearFilters}
        >
          <FilterX size={16} strokeWidth={2} aria-hidden />
          Limpar filtros
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
                      <Link
                        className="btn secondary"
                        to={`/accidents/${item._id}`}
                      >
                        {canWriteAccidents ? 'Editar' : 'Ver'}
                      </Link>
                      {canWriteAccidents ? (
                        <button
                          className="btn danger"
                          type="button"
                          onClick={() => void onDelete(item._id)}
                        >
                          Excluir
                        </button>
                      ) : null}
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
