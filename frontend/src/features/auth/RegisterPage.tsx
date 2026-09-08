import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { acronymLabel, ROLE_DESCRIPTIONS, ROLE_LABELS, UserRole } from '@sost/shared';
import { PasswordField } from '../../components/forms/PasswordField';
import { TextField } from '../../components/forms/TextField';
import { getZodFieldErrors } from '../../lib/formErrors';
import { registerSchema } from '../../lib/formSchemas';
import { useAuth } from './AuthContext';

export function RegisterPage() {
  const { user, register, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const parsed = registerSchema.safeParse({
      username,
      password,
      name: name.trim() || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(getZodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({
        username: parsed.data.username,
        password: parsed.data.password,
        name: parsed.data.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card stack" onSubmit={onSubmit} noValidate>
        <div>
          <h1>Criar conta</h1>
          <p className="muted">
            A conta nasce como <strong>{ROLE_LABELS[UserRole.Viewer]}</strong>:{' '}
            {ROLE_DESCRIPTIONS[UserRole.Viewer]}
          </p>
        </div>
        <TextField
          id="name"
          label="Nome (opcional)"
          value={name}
          onChange={setName}
          autoComplete="name"
          placeholder="Digite seu nome completo"
          error={fieldErrors.name}
        />
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
          autoComplete="new-password"
          placeholder="Digite sua senha (mínimo de 6 caracteres)"
          required
          error={fieldErrors.password}
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
