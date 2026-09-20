export type NavItemId =
  | 'dashboard'
  | 'accidents'
  | 'new'
  | 'profile'
  | 'users'
  | 'requests'
  | 'activity';

export type NavItem = {
  id: NavItemId;
  to: string;
  label: string;
  end?: boolean;
  showBadge?: boolean;
};

export function getNavItems(options: {
  canWriteAccidents: boolean;
  isAdmin: boolean;
}): NavItem[] {
  const items: NavItem[] = [
    { id: 'dashboard', to: '/', label: 'Dashboard', end: true },
    { id: 'accidents', to: '/accidents', label: 'Registros' },
  ];

  if (options.canWriteAccidents) {
    items.push({ id: 'new', to: '/accidents/new', label: 'Novo' });
  }

  items.push({ id: 'profile', to: '/profile', label: 'Perfil' });

  if (options.isAdmin) {
    items.push(
      { id: 'users', to: '/users', label: 'Usuários' },
      {
        id: 'requests',
        to: '/admin/requests',
        label: 'Pedidos',
        showBadge: true,
      },
      { id: 'activity', to: '/activity', label: 'Histórico' },
    );
  }

  return items;
}
