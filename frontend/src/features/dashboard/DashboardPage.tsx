import { useEffect, useState } from 'react';
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

export function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [auditTrail, setAuditTrail] = useState<StatsAuditTrail | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  async function load(selectedYear: string) {
    setLoading(true);
    setError('');
    try {
      const params = selectedYear ? `?year=${selectedYear}` : '';
      const overview = await api<Overview>(`/stats/overview${params}`);
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(year);
  }, [year]);

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
        <div className="field">
          <label>Ano de emissão</label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Todos"
          />
        </div>
        <button className="btn secondary" type="button" onClick={() => setYear('')}>
          Todos os anos
        </button>
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
        year={year}
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
