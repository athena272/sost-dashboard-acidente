import { useEffect, useState, type ReactNode } from "react";
import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { acronymLabel, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@sost/shared";
import { api } from "./lib/api";
import { useAuth } from "./features/auth/AuthContext";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { AccidentsPage } from "./features/accidents/AccidentsPage";
import { AccidentFormPage } from "./features/accidents/AccidentFormPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ProfilePage } from "./features/users/ProfilePage";
import { UsersPage } from "./features/users/UsersPage";
import { AdminRequestsPage } from "./features/admin/AdminRequestsPage";
import { ActivityPage } from "./features/admin/ActivityPage";

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <p className="muted">Carregando…</p>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function WriteRoute({ children }: { children: ReactNode }) {
  const { canWriteAccidents, loading } = useAuth();
  if (loading) return <p className="muted">Carregando…</p>;
  if (!canWriteAccidents) return <Navigate to="/accidents" replace />;
  return children;
}

function ProtectedLayout() {
  const { user, loading, logout, canWriteAccidents, isAdmin } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      setPendingRequests(0);
      return;
    }
    let cancelled = false;
    const load = () => {
      api<{ pendingEditorRequests: number }>("/notifications/summary")
        .then((summary) => {
          if (!cancelled) setPendingRequests(summary.pendingEditorRequests);
        })
        .catch(() => {
          if (!cancelled) setPendingRequests(0);
        });
    };
    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isAdmin]);

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
          <strong>{acronymLabel("SOST")}</strong>
          <span>Dashboard de acidentes</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/accidents">Registros</NavLink>
          {canWriteAccidents ? (
            <NavLink to="/accidents/new">Novo</NavLink>
          ) : null}
          <NavLink to="/profile">Perfil</NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/users">Usuários</NavLink>
              <NavLink to="/admin/requests" className="nav-with-badge">
                Pedidos
                {pendingRequests > 0 ? (
                  <span
                    className="badge"
                    aria-label={`${pendingRequests} pendentes`}
                  >
                    {pendingRequests}
                  </span>
                ) : null}
              </NavLink>
              <NavLink to="/activity">Histórico</NavLink>
            </>
          ) : null}
          <span className="role-chip" title={ROLE_DESCRIPTIONS[user.role]}>
            {user.username}
            <small>{ROLE_LABELS[user.role]}</small>
          </span>
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
    <>
      <Analytics />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="accidents" element={<AccidentsPage />} />
          <Route
            path="accidents/new"
            element={
              <WriteRoute>
                <AccidentFormPage />
              </WriteRoute>
            }
          />
          <Route path="accidents/:id" element={<AccidentFormPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/requests"
            element={
              <AdminRoute>
                <AdminRequestsPage />
              </AdminRoute>
            }
          />
          <Route
            path="activity"
            element={
              <AdminRoute>
                <ActivityPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
