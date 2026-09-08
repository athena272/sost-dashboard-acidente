import { BadRequestException, ConflictException } from '@nestjs/common';
import { EditorRequestStatus, UserRole } from '@sost/shared';
import { EditorRequestsService } from './editor-requests.service';

const USER_ID = '507f1f77bcf86cd799439011';
const ADMIN_ID = '507f1f77bcf86cd799439012';

describe('EditorRequestsService', () => {
  let service: EditorRequestsService;
  let requestModel: {
    create: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
  };
  let usersService: { updateRole: jest.Mock };

  beforeEach(() => {
    requestModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };
    usersService = { updateRole: jest.fn() };
    service = new EditorRequestsService(
      requestModel as never,
      usersService as never,
    );
  });

  it('only viewers can create requests', async () => {
    await expect(
      service.create(USER_ID, 'editor', UserRole.Editor, 'msg'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when a pending request already exists', async () => {
    requestModel.findOne.mockReturnValue({
      exec: () => Promise.resolve({ _id: 'req1' }),
    });
    await expect(
      service.create(USER_ID, 'viewer', UserRole.Viewer),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('approves pending request and promotes to editor', async () => {
    const save = jest.fn();
    requestModel.findById.mockReturnValue({
      exec: () =>
        Promise.resolve({
          status: EditorRequestStatus.Pending,
          userId: USER_ID,
          save,
        }),
    });
    usersService.updateRole.mockResolvedValue({ role: UserRole.Editor });

    const result = await service.approve('req1', ADMIN_ID);
    expect(usersService.updateRole).toHaveBeenCalledWith(USER_ID, UserRole.Editor);
    expect(result.status).toBe(EditorRequestStatus.Approved);
    expect(save).toHaveBeenCalled();
  });

  it('rejects pending request without changing role', async () => {
    const save = jest.fn();
    requestModel.findById.mockReturnValue({
      exec: () =>
        Promise.resolve({
          status: EditorRequestStatus.Pending,
          userId: USER_ID,
          save,
        }),
    });

    const result = await service.reject('req1', ADMIN_ID);
    expect(usersService.updateRole).not.toHaveBeenCalled();
    expect(result.status).toBe(EditorRequestStatus.Rejected);
  });
});
