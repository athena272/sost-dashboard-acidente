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
import {
  ACCIDENT_TYPE_LABELS,
  AccidentType,
  SEX_LABELS,
  Sex,
  acronymLabel,
} from '@sost/shared';
import { api } from '../../lib/api';

type Bucket = { key: string; count: number };
type MonthBucket = { year: number; month: number; count: number };

type Overview = {
  total: number;
  byMonth: MonthBucket[];
  byRole: Bucket[];
  byCid: Bucket[];
  byType: Bucket[];
  bySector: Bucket[];
  byBodyPart: Bucket[];
  bySex: Bucket[];
};

const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function labelType(key: string) {
  return ACCIDENT_TYPE_LABELS[key as AccidentType] ?? key;
}

function labelSex(key: string) {
  return SEX_LABELS[key as Sex] ?? key;
}

export function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  const monthSeries =
    data?.byMonth.map((item) => ({
      label: `${MONTHS[item.month - 1]}/${item.year}`,
      count: item.count,
    })) ?? [];

  return (
    <div className="stack">
      <div>
        <h1>Dashboard — {acronymLabel('SOST')}</h1>
        <p className="muted">
          Evolução mensal de acidentes, funções, {acronymLabel('CID')} e tipos
          (típico / trajeto / doença ocupacional).
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
            <div className="card">
              <div className="muted">Total de registros</div>
              <div className="stat">{data.total}</div>
            </div>
            <div className="card">
              <div className="muted">Tipos distintos</div>
              <div className="stat">{data.byType.length}</div>
            </div>
            <div className="card">
              <div className="muted">{acronymLabel('CID')} distintos</div>
              <div className="stat">{data.byCid.length}</div>
            </div>
          </div>

          <div className="card">
            <h2>Evolução mês a mês</h2>
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
            />
            <ChartCard
              title={`Por ${acronymLabel('CID')}`}
              data={data.byCid.map((i) => ({ name: i.key, count: i.count }))}
            />
            <ChartCard
              title="Por tipo de acidente"
              data={data.byType.map((i) => ({
                name: labelType(i.key),
                count: i.count,
              }))}
            />
            <ChartCard
              title="Por setor"
              data={data.bySector.map((i) => ({ name: i.key, count: i.count }))}
            />
            <ChartCard
              title="Por parte do corpo"
              data={data.byBodyPart.map((i) => ({
                name: i.key,
                count: i.count,
              }))}
            />
            <ChartCard
              title="Por sexo"
              data={data.bySex.map((i) => ({
                name: labelSex(i.key),
                count: i.count,
              }))}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function ChartCard({
  title,
  data,
}: {
  title: string;
  data: { name: string; count: number }[];
}) {
  return (
    <div className="card">
      <h2>{title}</h2>
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
