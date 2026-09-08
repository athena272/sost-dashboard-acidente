import { UserRole } from '@sost/shared';
import { buildAdminCreatePayload } from './build-admin-create-payload';

describe('buildAdminCreatePayload', () => {
  it('creates admin with explicit Admin role (not schema Viewer default)', () => {
    const payload = buildAdminCreatePayload('Admin_SOST', 'hash');
    expect(payload).toEqual({
      username: 'admin_sost',
      passwordHash: 'hash',
      role: UserRole.Admin,
    });
    expect(payload.role).not.toBe(UserRole.Viewer);
  });
});
