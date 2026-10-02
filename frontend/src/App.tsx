import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AppFooter } from "./components/layout/AppFooter";
import { AppHeader } from "./components/layout/AppHeader";
import { LazyRouteBoundary } from "./components/routing/LazyRouteBoundary";
import { lazyPage } from "./components/routing/lazyPage";
import { api } from "./lib/api";
import { useAuth } from "./features/auth/AuthContext";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";

/** Telas autenticadas: cada uma vira um arquivo próprio, renderizado sob o `LazyRouteBoundary` do `ProtectedLayout`. */
const DashboardPage = lazyPage(() => import("./features/dashboard/DashboardPage"), "DashboardPage");
const AccidentsPage = lazyPage(() => import("./features/accidents/AccidentsPage"), "AccidentsPage");
const AccidentFormPage = lazyPage(
  () => import("./features/accidents/AccidentFormPage"),
  "AccidentFormPage",
);
const ProfilePage = lazyPage(() => import("./features/users/ProfilePage"), "ProfilePage");
const UsersPage = lazyPage(() => import("./features/users/UsersPage"), "UsersPage");
const AdminRequestsPage = lazyPage(
  () => import("./features/admin/AdminRequestsPage"),
  "AdminRequestsPage",
);
const ActivityPage = lazyPage(() => import("./features/admin/ActivityPage"), "ActivityPage");

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
        <AppFooter />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <AppHeader
        user={user}
        canWriteAccidents={canWriteAccidents}
        isAdmin={isAdmin}
        pendingRequests={pendingRequests}
        onLogout={logout}
      />
      <main className="content">
        <LazyRouteBoundary>
          <Outlet />
        </LazyRouteBoundary>
      </main>
      <AppFooter className="app-footer--sticky" />
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
