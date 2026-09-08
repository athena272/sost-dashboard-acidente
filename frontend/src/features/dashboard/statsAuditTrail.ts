import {
  ACCIDENT_TYPE_LABELS,
  AccidentType,
  SEX_LABELS,
  Sex,
  isContributorKeyCompatible,
  type StatsContributorDimension,
} from '@sost/shared';

export type Bucket = { key: string; count: number };
export type MonthBucket = { year: number; month: number; count: number };

export type StatsMeta = {
  year: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  yearFilter: string;
  formula: string;
  excludeEmpty: string;
  apiBucketLimit: number;
  chartBucketLimit: number;
  byMonthNote: string;
  metrics: Record<string, { groupField?: string; description?: string }>;
};

export type Overview = {
  total: number;
  byMonth: MonthBucket[];
  byRole: Bucket[];
  byCid: Bucket[];
  byType: Bucket[];
  bySector: Bucket[];
  byBodyPart: Bucket[];
  bySex: Bucket[];
  distinctTypes: number;
  distinctCids: number;
  meta: StatsMeta;
};

export type StatsAuditMetric =
  | 'total'
  | 'distinctTypes'
  | 'distinctCids'
  | 'byMonth'
  | 'byRole'
  | 'byCid'
  | 'byType'
  | 'bySector'
  | 'byBodyPart'
  | 'bySex';

export type StatsDimension = StatsContributorDimension;

export type AuditTrailStep = { rotulo: string; detalhe: string };

export type StatsAuditTrail = {
  titulo: string;
  intro: string;
  passos: AuditTrailStep[];
  buckets?: Array<{ key: string; label: string; count: number }>;
  dimension: StatsDimension;
  defaultKey?: string;
};

export { isContributorKeyCompatible };

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

const DIMENSION_LABELS: Record<StatsDimension, string> = {
  total: 'todos os registros do filtro',
  role: 'função',
  cid: 'CID',
  accidentType: 'tipo de acidente',
  sector: 'setor',
  bodyPart: 'parte do corpo',
  sex: 'sexo',
  month: 'mês da data do acidente',
};

export function labelType(key: string) {
  return ACCIDENT_TYPE_LABELS[key as AccidentType] ?? key;
}

export function labelSex(key: string) {
  return SEX_LABELS[key as Sex] ?? key;
}

export function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function monthLabel(year: number, month: number) {
  return `${MONTHS[month - 1]}/${year}`;
}

export function describeDimensionSelection(
  dimension: StatsDimension,
  key: string,
  label?: string,
) {
  if (dimension === 'total') {
    return 'Listando todos os registros do filtro de ano de emissão.';
  }
  if (!key) {
    return 'Selecione uma categoria na tabela acima para listar os registros.';
  }
  const shown = label ?? key;
  return `Listando registros de ${DIMENSION_LABELS[dimension]}: ${shown}.`;
}

function mapBuckets(
  items: Bucket[],
  labelFn: (key: string) => string = (key) => key,
) {
  return items.map((item) => ({
    key: item.key,
    label: labelFn(item.key),
    count: item.count,
  }));
}

export function buildStatsAuditTrail(
  metric: StatsAuditMetric,
  data: Overview,
): StatsAuditTrail {
  const { meta } = data;
  const base: AuditTrailStep[] = [
    { rotulo: 'Filtro aplicado', detalhe: meta.yearFilter },
    {
      rotulo: 'Registros considerados',
      detalhe: `${data.total} registro(s) de CAT neste filtro`,
    },
    { rotulo: 'Como contamos', detalhe: meta.formula },
  ];

  switch (metric) {
    case 'total':
      return {
        titulo: 'Total de registros',
        intro:
          'Soma de todos os registros de CAT depois de aplicar o filtro de ano de emissão.',
        passos: [
          ...base,
          {
            rotulo: 'Resultado na tela',
            detalhe: `Total = ${data.total} registro(s)`,
          },
        ],
        dimension: 'total',
      };

    case 'distinctTypes':
      return {
        titulo: 'Tipos distintos',
        intro:
          'Quantos tipos de acidente diferentes aparecem nos registros do filtro (sem limitar aos mais frequentes).',
        passos: [
          ...base,
          {
            rotulo: 'O que observamos',
            detalhe:
              'Campo “tipo de acidente”. Registros sem tipo preenchido não entram nesta contagem.',
          },
          {
            rotulo: 'Resultado na tela',
            detalhe: `${data.distinctTypes} tipo(s) diferente(s)`,
          },
          {
            rotulo: 'Diferença do gráfico',
            detalhe: `O gráfico “Por tipo de acidente” mostra no máximo os ${meta.chartBucketLimit} mais frequentes. Este indicador conta todos os tipos existentes no filtro.`,
          },
        ],
        buckets: mapBuckets(data.byType, labelType),
        dimension: 'accidentType',
        defaultKey: data.byType[0]?.key,
      };

    case 'distinctCids':
      return {
        titulo: 'CID distintos',
        intro:
          'Quantos códigos CID diferentes aparecem nos registros do filtro (sem limitar aos mais frequentes).',
        passos: [
          ...base,
          {
            rotulo: 'O que observamos',
            detalhe:
              'Campo CID. Registros sem CID preenchido não entram nesta contagem.',
          },
          {
            rotulo: 'Resultado na tela',
            detalhe: `${data.distinctCids} CID(s) diferente(s)`,
          },
          {
            rotulo: 'Diferença do gráfico',
            detalhe: `O gráfico “Por CID” mostra no máximo os ${meta.chartBucketLimit} mais frequentes. Este indicador conta todos os CIDs do filtro (${data.distinctCids}).`,
          },
        ],
        buckets: mapBuckets(data.byCid),
        dimension: 'cid',
        defaultKey: data.byCid[0]?.key,
      };

    case 'byMonth':
      return {
        titulo: 'Evolução mês a mês',
        intro:
          'Cada ponto do gráfico é quantos CATs tiveram a data do acidente naquele mês.',
        passos: [
          ...base,
          {
            rotulo: 'Atenção',
            detalhe:
              'O filtro de ano usa o ano de emissão do CAT. Já os pontos do gráfico mensal usam a data do acidente — por isso um CAT emitido em 2026 pode aparecer em outro mês ou ano civil se a data do acidente for diferente.',
          },
          {
            rotulo: 'Como agrupamos',
            detalhe:
              'Somamos os registros pela data do acidente (mês e ano civis).',
          },
          {
            rotulo: 'Série completa',
            detalhe: `${data.byMonth.length} mês(es) com registro(s) neste filtro`,
          },
        ],
        buckets: data.byMonth.map((item) => ({
          key: monthKey(item.year, item.month),
          label: monthLabel(item.year, item.month),
          count: item.count,
        })),
        dimension: 'month',
        defaultKey: data.byMonth[0]
          ? monthKey(data.byMonth[0].year, data.byMonth[0].month)
          : undefined,
      };

    case 'byRole':
      return buildDimensionTrail(
        'Por função',
        'role',
        'função',
        data.byRole,
        meta,
        base,
      );
    case 'byCid':
      return buildDimensionTrail(
        'Por CID',
        'cid',
        'CID',
        data.byCid,
        meta,
        base,
      );
    case 'byType':
      return buildDimensionTrail(
        'Por tipo de acidente',
        'accidentType',
        'tipo de acidente',
        data.byType,
        meta,
        base,
        labelType,
      );
    case 'bySector':
      return buildDimensionTrail(
        'Por setor',
        'sector',
        'setor',
        data.bySector,
        meta,
        base,
      );
    case 'byBodyPart':
      return buildDimensionTrail(
        'Por parte do corpo',
        'bodyPart',
        'parte do corpo',
        data.byBodyPart,
        meta,
        base,
      );
    case 'bySex':
      return buildDimensionTrail(
        'Por sexo',
        'sex',
        'sexo',
        data.bySex,
        meta,
        base,
        labelSex,
      );
  }
}

function buildDimensionTrail(
  titulo: string,
  dimension: Exclude<StatsDimension, 'total' | 'month'>,
  groupLabel: string,
  buckets: Bucket[],
  meta: StatsMeta,
  base: AuditTrailStep[],
  labelFn: (key: string) => string = (key) => key,
): StatsAuditTrail {
  const chartShown = Math.min(buckets.length, meta.chartBucketLimit);
  return {
    titulo,
    intro: `Agrupamos os CATs por ${groupLabel}. Cada registro com valor preenchido soma 1 na sua categoria.`,
    passos: [
      ...base,
      {
        rotulo: 'Critério de agrupamento',
        detalhe: `Categoria = ${groupLabel}`,
      },
      { rotulo: 'Exclusões', detalhe: meta.excludeEmpty },
      {
        rotulo: 'Ordenação',
        detalhe: 'Categorias ordenadas da maior para a menor quantidade',
      },
      {
        rotulo: 'Lista completa nesta tela',
        detalhe: `Até ${meta.apiBucketLimit} categorias mais frequentes (${buckets.length} nesta consulta)`,
      },
      {
        rotulo: 'O que o gráfico mostra',
        detalhe: `Somente as ${meta.chartBucketLimit} primeiras (${chartShown} barra(s) agora). A tabela abaixo traz a lista completa recebida.`,
      },
    ],
    buckets: mapBuckets(buckets, labelFn),
    dimension,
    defaultKey: buckets[0]?.key,
  };
}
