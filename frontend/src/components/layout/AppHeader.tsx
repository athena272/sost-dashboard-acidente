import {
  ClipboardList,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Plus,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type UserRole,
} from '@sost/shared';
import { BrandMark } from '../brand/BrandMark';
import { getNavItems, type NavItemId } from './navItems';

const NAV_ICONS: Record<NavItemId, LucideIcon> = {
  dashboard: LayoutDashboard,
  accidents: ClipboardList,
  new: Plus,
  profile: User,
  users: Users,
  requests: Inbox,
  activity: History,
};

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
  const items = getNavItems({ canWriteAccidents, isAdmin });

  return (
    <header className="topbar">
      <BrandMark />
      <nav className="nav">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.id];
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className={item.showBadge ? 'nav-with-badge' : undefined}
            >
              <Icon size={16} strokeWidth={2} aria-hidden />
              {item.label}
              {item.showBadge && pendingRequests > 0 ? (
                <span
                  className="badge"
                  aria-label={`${pendingRequests} pendentes`}
                >
                  {pendingRequests}
                </span>
              ) : null}
            </NavLink>
          );
        })}
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
