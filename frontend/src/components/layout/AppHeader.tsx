import { useEffect, useId, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type UserRole,
} from '@sost/shared';
import { BrandMark } from '../brand/BrandMark';
import { AppNavLinks } from './AppNavLinks';

type AppHeaderProps = {
  user: {
    username: string;
    role: UserRole;
  };
  canWriteAccidents: boolean;
  isAdmin: boolean;
  pendingRequests: number;
  onLogout: () => void;
};

export function AppHeader({
  user,
  canWriteAccidents,
  isAdmin,
  pendingRequests,
  onLogout,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navPanelId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <header className={`topbar${menuOpen ? ' topbar--menu-open' : ''}`}>
      <div className="topbar-bar">
        <BrandMark />
        <button
          className="topbar-toggle btn secondary btn-with-icon"
          type="button"
          aria-expanded={menuOpen}
          aria-controls={navPanelId}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={toggleMenu}
        >
          {menuOpen ? (
            <X size={18} strokeWidth={2} aria-hidden />
          ) : (
            <Menu size={18} strokeWidth={2} aria-hidden />
          )}
          <span className="topbar-toggle-label">
            {menuOpen ? 'Fechar' : 'Menu'}
          </span>
        </button>
      </div>

      <nav
        id={navPanelId}
        className={`nav nav-panel${menuOpen ? ' nav-panel--open' : ''}`}
      >
        <AppNavLinks
          canWriteAccidents={canWriteAccidents}
          isAdmin={isAdmin}
          pendingRequests={pendingRequests}
          onNavigate={closeMenu}
        />
        <span className="role-chip" title={ROLE_DESCRIPTIONS[user.role]}>
          {user.username}
          <small>{ROLE_LABELS[user.role]}</small>
        </span>
        <button
          className="btn secondary btn-with-icon"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={16} strokeWidth={2} aria-hidden />
          Sair
        </button>
      </nav>
    </header>
  );
}
