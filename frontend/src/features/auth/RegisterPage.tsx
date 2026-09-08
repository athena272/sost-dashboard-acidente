import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { acronymLabel, ROLE_DESCRIPTIONS, ROLE_LABELS, UserRole } from '@sost/shared';
import { PasswordField } from '../../components/PasswordField';
import { useAuth } from './AuthContext';

export function RegisterPage() {
  const { user, register, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register({
        username,
        password,
        name: name.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card stack" onSubmit={onSubmit}>
        <div>
          <h1>Criar conta</h1>
          <p className="muted">
            A conta nasce como <strong>{ROLE_LABELS[UserRole.Viewer]}</strong>:{' '}
            {ROLE_DESCRIPTIONS[UserRole.Viewer]}
          </p>
        </div>
        <div className="field">
          <label htmlFor="name">Nome (opcional)</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            minLength={3}
            required
          />
        </div>
        <PasswordField
          label="Senha"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          minLength={6}
        />
        <p className="muted">
          Depois, no perfil, você pode solicitar o perfil de{' '}
          {ROLE_LABELS[UserRole.Editor]} se precisar cadastrar ou alterar{' '}
          {acronymLabel('CAT')}.
        </p>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Cadastrando…' : 'Cadastrar'}
        </button>
        <p className="muted">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
