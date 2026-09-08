import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  EDITOR_REQUEST_STATUS_LABELS,
  EditorRequestStatus,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  UserRole,
} from '@sost/shared';
import { api } from '../../lib/api';
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
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState<EditorRequest[]>([]);
  const [pending, setPending] = useState<EditorRequest | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadRequests() {
    const list = await api<EditorRequest[]>('/editor-requests/me');
    setRequests(list);
    setPending(list.find((item) => item.status === EditorRequestStatus.Pending) ?? null);
  }

  useEffect(() => {
    void refreshMe().catch(() => undefined);
    void loadRequests().catch((err) =>
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos'),
    );
  }, [refreshMe]);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  if (!user) return null;

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
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
    try {
      await api('/editor-requests', {
        method: 'POST',
        body: JSON.stringify({ message: message.trim() || undefined }),
      });
      setMessage('');
      await loadRequests();
      setInfo('Solicitação enviada ao administrador.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao solicitar');
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

      <form className="card stack" onSubmit={onSaveProfile}>
        <div className="field">
          <label htmlFor="profile-username">Usuário</label>
          <input id="profile-username" value={user.username} disabled />
        </div>
        <div className="field">
          <label htmlFor="profile-name">Nome</label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
                .
              </p>
              <button className="btn secondary" type="button" onClick={() => void cancelPending()}>
                Cancelar solicitação
              </button>
            </div>
          ) : (
            <div className="stack">
              <div className="field">
                <label htmlFor="request-message">Mensagem (opcional)</label>
                <textarea
                  id="request-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex.: preciso registrar CATs do meu setor"
                />
              </div>
              <button className="btn" type="button" onClick={() => void requestEditor()}>
                Solicitar perfil de Editor de registros
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
