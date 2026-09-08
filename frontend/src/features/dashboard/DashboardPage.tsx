import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { acronymLabel } from '@sost/shared';
import { api } from '../../lib/api';
import { StatsAuditButton, StatsAuditDialog } from './StatsAuditDialog';
import {
  buildStatsAuditTrail,
  labelSex,
  labelType,
  monthLabel,
  type Overview,
  type StatsAuditMetric,
  type StatsAuditTrail,
} from './statsAuditTrail';

type YearMode = 'single' | 'range' | 'all';

type YearBounds = {
  minYear: number;
  maxYear: number;
  latestRecordYear: number | null;
};

function yearsBetween(from: number, to: number) {
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  const years: number[] = [];
  for (let year = start; year <= end; year += 1) {
    years.push(year);
  }
  return years;
}

export function DashboardPage() {
  const fallbackYear = new Date().getFullYear();
  const [bounds, setBounds] = useState<YearBounds>({
    minYear: fallbackYear,
    maxYear: fallbackYear,
    latestRecordYear: null,
  });
  const [yearMode, setYearMode] = useState<YearMode>('single');
  const [year, setYear] = useState(String(fallbackYear));
  const [yearFrom, setYearFrom] = useState(String(fallbackYear));
  const [yearTo, setYearTo] = useState(String(fallbackYear));
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [auditTrail, setAuditTrail] = useState<StatsAuditTrail | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  const yearOptions = useMemo(
    () => yearsBetween(bounds.minYear, bounds.maxYear),
    [bounds.minYear, bounds.maxYear],
  );

  const yearFromOptions = useMemo(() => {
    const to = Number(yearTo) || bounds.maxYear;
    return yearsBetween(bounds.minYear, Math.min(to, bounds.maxYear));
  }, [bounds.minYear, bounds.maxYear, yearTo]);

  const yearToOptions = useMemo(() => {
    const from = Number(yearFrom) || bounds.minYear;
    return yearsBetween(Math.max(from, bounds.minYear), bounds.maxYear);
  }, [bounds.minYear, bounds.maxYear, yearFrom]);

  const yearQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (yearMode === 'single' && year.trim()) {
      params.set('year', year.trim());
    }
    if (yearMode === 'range') {
      if (yearFrom.trim()) params.set('yearFrom', yearFrom.trim());
      if (yearTo.trim()) params.set('yearTo', yearTo.trim());
    }
    return params.toString();
  }, [yearMode, year, yearFrom, yearTo]);

  useEffect(() => {
    api<YearBounds>('/stats/emission-year-bounds')
      .then((result) => {
        setBounds(result);
        setYear(String(result.maxYear));
        setYearTo(String(result.maxYear));
        setYearFrom(String(result.minYear));
      })
      .catch(() => {
        /* mantém fallback do ano atual */
      });
  }, []);

  useEffect(() => {
    if (yearMode === 'range') {
      const from = Number(yearFrom);
      const to = Number(yearTo);
      if (Number.isFinite(from) && Number.isFinite(to) && from > to) {
        setYearFrom(String(to));
        setYearTo(String(from));
      }
    }
  }, [yearMode, yearFrom, yearTo]);

  async function load(query: string) {
    setLoading(true);
    setError('');
    try {
      const overview = await api<Overview>(
        `/stats/overview${query ? `?${query}` : ''}`,
      );
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(yearQuery);
  }, [yearQuery]);

  function openAudit(metric: StatsAuditMetric) {
    if (!data) return;
    setAuditTrail(buildStatsAuditTrail(metric, data));
    setAuditOpen(true);
  }

  const monthSeries =
    data?.byMonth.map((item) => ({
      label: monthLabel(item.year, item.month),
      count: item.count,
    })) ?? [];

  return (
    <div className="stack">
      <div>
        <h1>Dashboard — {acronymLabel('SOST')}</h1>
        <p className="muted">
          Evolução mensal de acidentes, funções, {acronymLabel('CID')} e tipos
          (típico / trajeto / doença ocupacional). Use “Como chegamos nisto”
          para ver a trilha de cálculo e os registros brutos.
        </p>
      </div>

      <div className="card toolbar">
        {yearMode === 'single' ? (
          <div className="field">
            <label htmlFor="emission-year">Ano de emissão</label>
            <select
              id="emission-year"
              value={year}
              onChange={(e) => {
                setYearMode('single');
                setYear(e.target.value);
              }}
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {yearMode === 'range' ? (
          <>
            <div className="field">
              <label htmlFor="emission-year-from">De</label>
              <select
                id="emission-year-from"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
              >
                {yearFromOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="emission-year-to">Até</label>
              <select
                id="emission-year-to"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
              >
                {yearToOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        {yearMode === 'all' ? (
          <div className="field">
            <label>Ano de emissão</label>
            <input value="Todos os anos" disabled />
          </div>
        ) : null}

        <button
          className={`btn secondary${yearMode === 'range' ? ' active-filter' : ''}`}
          type="button"
          onClick={() => {
            setYearMode('range');
            setYearFrom(String(bounds.minYear));
            setYearTo(String(bounds.maxYear));
          }}
        >
          Faixa de anos
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            setYearMode('all');
            setYear('');
          }}
        >
          Todos os anos
        </button>
        {yearMode !== 'single' ? (
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              setYearMode('single');
              setYear(String(bounds.maxYear));
            }}
          >
            Ano único
          </button>
        ) : null}
      </div>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Carregando…</p> : null}

      {data ? (
        <>
          <div className="grid-3">
            <div className="card stack">
              <div className="kpi-head">
                <div className="muted">Total de registros</div>
                <StatsAuditButton onClick={() => openAudit('total')} />
              </div>
              <div className="stat">{data.total}</div>
            </div>
            <div className="card stack">
              <div className="kpi-head">
                <div className="muted">Tipos distintos</div>
                <StatsAuditButton onClick={() => openAudit('distinctTypes')} />
              </div>
              <div className="stat">{data.distinctTypes}</div>
            </div>
            <div className="card stack">
              <div className="kpi-head">
                <div className="muted">{acronymLabel('CID')} distintos</div>
                <StatsAuditButton onClick={() => openAudit('distinctCids')} />
              </div>
              <div className="stat">{data.distinctCids}</div>
            </div>
          </div>

          <div className="card stack">
            <div className="kpi-head">
              <h2>Evolução mês a mês</h2>
              <StatsAuditButton onClick={() => openAudit('byMonth')} />
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={monthSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Acidentes"
                    stroke="#0b5f6b"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            <ChartCard
              title="Por função"
              data={data.byRole.map((i) => ({ name: i.key, count: i.count }))}
              onAudit={() => openAudit('byRole')}
            />
            <ChartCard
              title={`Por ${acronymLabel('CID')}`}
              data={data.byCid.map((i) => ({ name: i.key, count: i.count }))}
              onAudit={() => openAudit('byCid')}
            />
            <ChartCard
              title="Por tipo de acidente"
              data={data.byType.map((i) => ({
                name: labelType(i.key),
                count: i.count,
              }))}
              onAudit={() => openAudit('byType')}
            />
            <ChartCard
              title="Por setor"
              data={data.bySector.map((i) => ({ name: i.key, count: i.count }))}
              onAudit={() => openAudit('bySector')}
            />
            <ChartCard
              title="Por parte do corpo"
              data={data.byBodyPart.map((i) => ({
                name: i.key,
                count: i.count,
              }))}
              onAudit={() => openAudit('byBodyPart')}
            />
            <ChartCard
              title="Por sexo"
              data={data.bySex.map((i) => ({
                name: labelSex(i.key),
                count: i.count,
              }))}
              onAudit={() => openAudit('bySex')}
            />
          </div>
        </>
      ) : null}

      <StatsAuditDialog
        open={auditOpen}
        trail={auditTrail}
        yearQuery={yearQuery}
        onClose={() => setAuditOpen(false)}
      />
    </div>
  );
}

function ChartCard({
  title,
  data,
  onAudit,
}: {
  title: string;
  data: { name: string; count: number }[];
  onAudit: () => void;
}) {
  return (
    <div className="card stack">
      <div className="kpi-head">
        <h2>{title}</h2>
        <StatsAuditButton onClick={onAudit} />
      </div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={120} />
            <Tooltip />
            <Bar dataKey="count" name="Quantidade" fill="#0b5f6b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
