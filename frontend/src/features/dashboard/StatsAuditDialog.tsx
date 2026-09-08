import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PaginationBar } from '../../components/pagination/PaginationBar';
import { api } from '../../lib/api';
import {
  describeDimensionSelection,
  isContributorKeyCompatible,
  type StatsAuditTrail,
} from './statsAuditTrail';

type Contributor = {
  _id: string;
  accidentDate?: string;
  catNumber?: string;
  victimName?: string;
  role?: string;
  cid?: string;
  accidentType?: string;
  sector?: string;
  emissionYear?: number;
};

type ContributorsResponse = {
  items: Contributor[];
  total: number;
  page: number;
  totalPages: number;
};

type Props = {
  open: boolean;
  trail: StatsAuditTrail | null;
  yearQuery: string;
  onClose: () => void;
};

export function StatsAuditDialog({ open, trail, yearQuery, onClose }: Props) {
  const [selectedKey, setSelectedKey] = useState('');
  const [data, setData] = useState<ContributorsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trailSyncId = trail
    ? `${trail.dimension}::${trail.defaultKey ?? ''}::${trail.titulo}`
    : '';

  useEffect(() => {
    if (!open || !trail) return;
    setSelectedKey(trail.defaultKey ?? '');
    setPage(1);
    setData(null);
    setError('');
  }, [open, trailSyncId, trail]);

  const requestKey = useMemo(() => {
    if (!trail) return '';
    if (trail.dimension === 'total') return '';
    if (isContributorKeyCompatible(trail.dimension, selectedKey)) {
      return selectedKey;
    }
    return '';
  }, [trail, selectedKey]);

  const selectedLabel = trail?.buckets?.find(
    (bucket) => bucket.key === requestKey,
  )?.label;

  useEffect(() => {
    if (!open || !trail) return;
    if (trail.dimension !== 'total' && !requestKey) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      dimension: trail.dimension,
      page: String(page),
      limit: '15',
    });
    if (yearQuery) {
      const yearParams = new URLSearchParams(yearQuery);
      yearParams.forEach((value, key) => params.set(key, value));
    }
    if (trail.dimension !== 'total') {
      params.set('key', requestKey);
    }

    api<ContributorsResponse>(`/stats/contributors?${params}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, trail, requestKey, page, yearQuery]);

  if (!open || !trail) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog card stack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-audit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <div>
            <h2 id="stats-audit-title">{trail.titulo}</h2>
            <p className="muted">{trail.intro}</p>
          </div>
          <button className="btn secondary" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <section className="stack">
          <h3>Passo a passo</h3>
          <dl className="audit-trail">
            {trail.passos.map((passo) => (
              <div key={passo.rotulo} className="audit-trail-item">
                <dt>{passo.rotulo}</dt>
                <dd>{passo.detalhe}</dd>
              </div>
            ))}
          </dl>
        </section>

        {trail.buckets && trail.buckets.length > 0 ? (
          <section className="stack">
            <h3>Categorias desta estatística</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Quantidade</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {trail.buckets.map((bucket) => (
                    <tr key={bucket.key}>
                      <td>{bucket.label}</td>
                      <td>{bucket.count}</td>
                      <td>
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => {
                            setSelectedKey(bucket.key);
                            setPage(1);
                          }}
                        >
                          Ver registros
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="stack">
          <h3>Registros que entram nesta conta</h3>
          <p className="muted">
            {describeDimensionSelection(
              trail.dimension,
              requestKey,
              selectedLabel,
            )}
          </p>
          {error ? <p className="error">{error}</p> : null}
          {loading ? <p className="muted">Carregando registros…</p> : null}
          {data ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>CAT</th>
                      <th>Vítima</th>
                      <th>Função</th>
                      <th>CID</th>
                      <th>Emissão</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          {item.accidentDate
                            ? new Date(item.accidentDate).toLocaleDateString(
                                'pt-BR',
                              )
                            : '—'}
                        </td>
                        <td>{item.catNumber ?? '—'}</td>
                        <td>{item.victimName ?? '—'}</td>
                        <td>{item.role ?? '—'}</td>
                        <td>{item.cid ?? '—'}</td>
                        <td>{item.emissionYear ?? '—'}</td>
                        <td>
                          <Link
                            className="btn secondary"
                            to={`/accidents/${item._id}`}
                            onClick={onClose}
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                summaryLabel="registro(s)"
                onPageChange={setPage}
              />
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function StatsAuditButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      className="btn secondary audit-btn"
      type="button"
      onClick={onClick}
      title="Como chegamos nisto"
      aria-label="Como chegamos nisto"
    >
      Como chegamos nisto
    </button>
  );
}
