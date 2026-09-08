import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { acronymLabel } from '@sost/shared';
import { api } from '../../lib/api';
import { AccidentFormFields } from './AccidentFormFields';
import {
  Accident,
  accidentToForm,
  emptyForm,
  formToPayload,
  AccidentFormValues,
} from './types';

export function AccidentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<AccidentFormValues>(emptyForm());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<Accident>(`/accidents/${id}`)
      .then((accident) => setForm(accidentToForm(accident)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = formToPayload(form);
      if (isEdit && id) {
        await api(`/accidents/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/accidents', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      navigate('/accidents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Carregando…</p>;

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div>
        <h1>
          {isEdit ? 'Editar' : 'Novo'} registro de {acronymLabel('CAT')}
        </h1>
        <p className="muted">
          Cadastro organizado de acidentes do {acronymLabel('SOST')}.
        </p>
      </div>
      <div className="card">
        <AccidentFormFields value={form} onChange={setForm} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="actions">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <Link className="btn secondary" to="/accidents">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
