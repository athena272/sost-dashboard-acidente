import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { acronymLabel } from '@sost/shared';
import { PasswordField } from '../../components/forms/PasswordField';
import { TextField } from '../../components/forms/TextField';
import { getZodFieldErrors } from '../../lib/formErrors';
import { loginSchema } from '../../lib/formSchemas';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      setFieldErrors(getZodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await login(parsed.data.username, parsed.data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card stack" onSubmit={onSubmit} noValidate>
        <div>
          <h1>{acronymLabel('SOST')}</h1>
          <p className="muted">
            Dashboard de acidentes — acesso com usuário e senha.
          </p>
        </div>
        <TextField
          id="username"
          label="Usuário"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          placeholder="Digite seu usuário"
          required
          error={fieldErrors.username}
        />
        <PasswordField
          id="password"
          label="Senha"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Digite sua senha"
          required
          error={fieldErrors.password}
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
