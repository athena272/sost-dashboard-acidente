import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@sost/shared';
import { UsersService } from './users.service';

describe('UsersService.updateRole', () => {
  const save = jest.fn();
  const findById = jest.fn();
  const service = Object.create(UsersService.prototype) as UsersService;

  beforeEach(() => {
    save.mockReset();
    findById.mockReset();
    (service as unknown as { findById: typeof findById }).findById = findById;
  });

  it('rejects promoting to admin', async () => {
    await expect(service.updateRole('1', UserRole.Admin)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects changing the admin user', async () => {
    findById.mockResolvedValue({
      role: UserRole.Admin,
      save,
    });
    await expect(service.updateRole('1', UserRole.Editor)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('updates viewer to editor', async () => {
    const user = { role: UserRole.Viewer, save };
    findById.mockResolvedValue(user);
    const result = await service.updateRole('1', UserRole.Editor);
    expect(result.role).toBe(UserRole.Editor);
    expect(save).toHaveBeenCalled();
  });
});
