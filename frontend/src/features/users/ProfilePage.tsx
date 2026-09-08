import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  EDITOR_REQUEST_STATUS_LABELS,
  EditorRequestStatus,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  UserRole,
} from '@sost/shared';
import { TextAreaField } from '../../components/forms/TextAreaField';
import { TextField } from '../../components/forms/TextField';
import { api } from '../../lib/api';
import { getZodFieldErrors } from '../../lib/formErrors';
import { editorRequestSchema, profileSchema } from '../../lib/formSchemas';
import { useAuth } from '../auth/AuthContext';

type EditorRequest = {
  _id: string;
  status: EditorRequestStatus;
  message?: string;
  createdAt?: string;
};

export function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [requestName, setRequestName] = useState(user?.name ?? '');
  const [message, setMessage] = useState('');
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>(
    {},
  );
  const [requests, setRequests] = useState<EditorRequest[]>([]);
  const [pending, setPending] = useState<EditorRequest | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savingRequest, setSavingRequest] = useState(false);

  async function loadRequests() {
    const list = await api<EditorRequest[]>('/editor-requests/me');
    setRequests(list);
    const nextPending =
      list.find((item) => item.status === EditorRequestStatus.Pending) ?? null;
    setPending(nextPending);
    if (nextPending) {
      setMessage(nextPending.message ?? '');
    }
  }

  useEffect(() => {
    void refreshMe().catch(() => undefined);
    void loadRequests().catch((err) =>
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos'),
    );
  }, [refreshMe]);

  useEffect(() => {
    setName(user?.name ?? '');
    setRequestName(user?.name ?? '');
  }, [user?.name]);

  if (!user) return null;

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault();
    setError('');
    setInfo('');
    const parsed = profileSchema.safeParse({ name });
    if (!parsed.success) {
      setFieldErrors(getZodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: parsed.data.name }),
      });
      await refreshMe();
      setInfo('Perfil atualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function requestEditor() {
    setError('');
    setInfo('');
    const parsed = editorRequestSchema.safeParse({
      name: requestName,
      message: message.trim() || undefined,
    });
    if (!parsed.success) {
      setRequestErrors(getZodFieldErrors(parsed.error));
      return;
    }
    setRequestErrors({});
    setSavingRequest(true);
    try {
      await api('/editor-requests', {
        method: 'POST',
        body: JSON.stringify({
          name: parsed.data.name,
          message: parsed.data.message || undefined,
        }),
      });
      setMessage('');
      await refreshMe();
      await loadRequests();
      setInfo('Solicitação enviada ao administrador.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao solicitar');
    } finally {
      setSavingRequest(false);
    }
  }

  async function savePendingRequest() {
    if (!pending) return;
    setError('');
    setInfo('');
    const parsed = editorRequestSchema.safeParse({
      name: requestName,
      message: message.trim() || undefined,
    });
    if (!parsed.success) {
      setRequestErrors(getZodFieldErrors(parsed.error));
      return;
    }
    setRequestErrors({});
    setSavingRequest(true);
    try {
      await api(`/editor-requests/${pending._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: parsed.data.name,
          message: parsed.data.message || undefined,
        }),
      });
      await refreshMe();
      await loadRequests();
      setInfo('Solicitação atualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar');
    } finally {
      setSavingRequest(false);
    }
  }

  async function cancelPending() {
    if (!pending) return;
    await api(`/editor-requests/${pending._id}/cancel`, { method: 'POST' });
    await loadRequests();
    setInfo('Solicitação cancelada.');
  }

  return (
    <div className="stack">
      <div>
        <h1>Meu perfil</h1>
        <p className="muted">
          Perfil atual: <strong>{ROLE_LABELS[user.role]}</strong>
        </p>
        <p className="muted">{ROLE_DESCRIPTIONS[user.role]}</p>
      </div>

      <form className="card stack" onSubmit={onSaveProfile} noValidate>
        <TextField
          id="profile-username"
          label="Usuário"
          value={user.username}
          onChange={() => undefined}
          disabled
          readOnly
          hint="Este campo não é editável."
          title="Este campo não é editável"
          ariaLabel="Usuário (somente leitura)"
        />
        <TextField
          id="profile-name"
          label="Nome"
          value={name}
          onChange={setName}
          placeholder="Digite seu nome completo"
          error={fieldErrors.name}
        />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar perfil'}
        </button>
      </form>

      {user.role === UserRole.Viewer ? (
        <div className="card stack">
          <h2>O que muda se eu for Editor de registros?</h2>
          <div className="grid-2">
            <div>
              <h3>Você passa a poder</h3>
              <ul>
                <li>Cadastrar novos acidentes (CATs)</li>
                <li>Editar registros existentes</li>
                <li>Excluir registros quando necessário</li>
              </ul>
            </div>
            <div>
              <h3>Continua igual</h3>
              <ul>
                <li>Consultar dashboard e filtros</li>
                <li>Buscar e abrir detalhes</li>
                <li>Sem acesso à gestão de usuários e histórico</li>
              </ul>
            </div>
          </div>
          <p className="muted">{ROLE_DESCRIPTIONS[UserRole.Editor]}</p>
          {pending ? (
            <div className="stack">
              <p>
                Solicitação <strong>pendente</strong> desde{' '}
                {pending.createdAt
                  ? new Date(pending.createdAt).toLocaleString('pt-BR')
                  : '—'}
                . Você pode corrigir o nome ou a mensagem enquanto aguarda.
              </p>
              <TextField
                id="pending-request-name"
                label="Nome"
                value={requestName}
                onChange={setRequestName}
                placeholder="Digite seu nome completo"
                required
                error={requestErrors.name}
              />
              <TextAreaField
                id="pending-request-message"
                label="Mensagem (opcional)"
                value={message}
                onChange={setMessage}
                rows={3}
                placeholder="Digite uma mensagem para o administrador, se desejar"
                error={requestErrors.message}
              />
              <div className="actions">
                <button
                  className="btn"
                  type="button"
                  disabled={savingRequest}
                  onClick={() => void savePendingRequest()}
                >
                  {savingRequest ? 'Salvando…' : 'Salvar alterações'}
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => void cancelPending()}
                >
                  Cancelar solicitação
                </button>
              </div>
            </div>
          ) : (
            <div className="stack">
              <TextField
                id="request-name"
                label="Nome"
                value={requestName}
                onChange={setRequestName}
                placeholder="Digite seu nome completo"
                required
                error={requestErrors.name}
              />
              <TextAreaField
                id="request-message"
                label="Mensagem (opcional)"
                value={message}
                onChange={setMessage}
                rows={3}
                placeholder="Digite uma mensagem para o administrador, se desejar. Ex.: preciso registrar CATs do meu setor"
                ariaLabel="Mensagem opcional para solicitar perfil de editor"
                error={requestErrors.message}
              />
              <button
                className="btn"
                type="button"
                disabled={savingRequest}
                onClick={() => void requestEditor()}
              >
                {savingRequest
                  ? 'Enviando…'
                  : 'Solicitar perfil de Editor de registros'}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {requests.length > 0 ? (
        <div className="card stack">
          <h2>Histórico das minhas solicitações</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Mensagem</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <tr key={item._id}>
                    <td>{EDITOR_REQUEST_STATUS_LABELS[item.status]}</td>
                    <td>{item.message ?? '—'}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
      {info ? <p className="ok">{info}</p> : null}
    </div>
  );
}
