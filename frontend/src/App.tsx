import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { acronymLabel } from '@sost/shared';
import { useAuth } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { AccidentsPage } from './features/accidents/AccidentsPage';
import { AccidentFormPage } from './features/accidents/AccidentFormPage';
import { DashboardPage } from './features/dashboard/DashboardPage';

function ProtectedLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <strong>{acronymLabel('SOST')}</strong>
          <span>Dashboard de acidentes</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/accidents">Registros</NavLink>
          <NavLink to="/accidents/new">Novo</NavLink>
          <span className="muted">{user.username}</span>
          <button className="btn secondary" type="button" onClick={logout}>
            Sair
          </button>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="accidents" element={<AccidentsPage />} />
        <Route path="accidents/new" element={<AccidentFormPage />} />
        <Route path="accidents/:id" element={<AccidentFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
