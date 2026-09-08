import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { acronymLabel } from '@sost/shared';
import { PasswordField } from '../../components/PasswordField';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card stack" onSubmit={onSubmit}>
        <div>
          <h1>{acronymLabel('SOST')}</h1>
          <p className="muted">
            Dashboard de acidentes — acesso com usuário e senha.
          </p>
        </div>
        <div className="field">
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <PasswordField
          label="Senha"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="muted">
          Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
