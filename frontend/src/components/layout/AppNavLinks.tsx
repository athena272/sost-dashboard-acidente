import {
  ClipboardList,
  History,
  Inbox,
  LayoutDashboard,
  Plus,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
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

type AppNavLinksProps = {
  canWriteAccidents: boolean;
  isAdmin: boolean;
  pendingRequests: number;
  onNavigate?: () => void;
};

export function AppNavLinks({
  canWriteAccidents,
  isAdmin,
  pendingRequests,
  onNavigate,
}: AppNavLinksProps) {
  const items = getNavItems({ canWriteAccidents, isAdmin });

  return (
    <>
      {items.map((item) => {
        const Icon = NAV_ICONS[item.id];
        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.end}
            className={item.showBadge ? 'nav-with-badge' : undefined}
            onClick={onNavigate}
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
    </>
  );
}
