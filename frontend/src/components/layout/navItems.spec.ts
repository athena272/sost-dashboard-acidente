import { describe, expect, it } from 'vitest';
import { getNavItems } from './navItems';

describe('getNavItems', () => {
  it('shows core links for a viewer', () => {
    const ids = getNavItems({
      canWriteAccidents: false,
      isAdmin: false,
    }).map((item) => item.id);

    expect(ids).toEqual(['dashboard', 'accidents', 'profile']);
  });

  it('adds the create-accident link for editors', () => {
    const ids = getNavItems({
      canWriteAccidents: true,
      isAdmin: false,
    }).map((item) => item.id);

    expect(ids).toEqual(['dashboard', 'accidents', 'new', 'profile']);
  });

  it('adds admin links without dropping write access', () => {
    const items = getNavItems({
      canWriteAccidents: true,
      isAdmin: true,
    });

    expect(items.map((item) => item.id)).toEqual([
      'dashboard',
      'accidents',
      'new',
      'profile',
      'users',
      'requests',
      'activity',
    ]);
    expect(items.find((item) => item.id === 'dashboard')?.end).toBe(true);
    expect(items.find((item) => item.id === 'requests')?.showBadge).toBe(true);
    expect(items.find((item) => item.id === 'requests')?.to).toBe(
      '/admin/requests',
    );
  });

  it('does not show admin links for non-admins even if they can write', () => {
    const ids = getNavItems({
      canWriteAccidents: true,
      isAdmin: false,
    }).map((item) => item.id);

    expect(ids).not.toContain('users');
    expect(ids).not.toContain('requests');
    expect(ids).not.toContain('activity');
  });
});
