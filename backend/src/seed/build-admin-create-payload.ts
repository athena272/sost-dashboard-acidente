import { UserRole } from '@sost/shared';

/** Payload used by seed:admin — locked so the CLI never falls back to Viewer. */
export function buildAdminCreatePayload(username: string, passwordHash: string) {
  return {
    username: username.toLowerCase(),
    passwordHash,
    role: UserRole.Admin,
  };
}
