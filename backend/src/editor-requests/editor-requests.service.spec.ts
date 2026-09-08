import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EditorRequestStatus, UserRole } from '@sost/shared';
import { EditorRequestsService } from './editor-requests.service';

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f1f77bcf86cd799439099';
const ADMIN_ID = '507f1f77bcf86cd799439012';

describe('EditorRequestsService', () => {
  let service: EditorRequestsService;
  let requestModel: {
    create: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
  };
  let usersService: { updateRole: jest.Mock; updateProfile: jest.Mock };

  beforeEach(() => {
    requestModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };
    usersService = {
      updateRole: jest.fn(),
      updateProfile: jest.fn().mockResolvedValue({ name: 'Maria' }),
    };
    service = new EditorRequestsService(
      requestModel as never,
      usersService as never,
    );
  });

  it('only viewers can create requests', async () => {
    await expect(
      service.create(USER_ID, 'editor', UserRole.Editor, 'Maria', 'msg'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create without a valid name', async () => {
    requestModel.findOne.mockReturnValue({
      exec: () => Promise.resolve(null),
    });
    await expect(
      service.create(USER_ID, 'viewer', UserRole.Viewer, ' '),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usersService.updateProfile).not.toHaveBeenCalled();
  });

  it('rejects when a pending request already exists', async () => {
    requestModel.findOne.mockReturnValue({
      exec: () => Promise.resolve({ _id: 'req1' }),
    });
    await expect(
      service.create(USER_ID, 'viewer', UserRole.Viewer, 'Maria'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates request and persists name on the user', async () => {
    requestModel.findOne.mockReturnValue({
      exec: () => Promise.resolve(null),
    });
    requestModel.create.mockResolvedValue({ id: 'req1' });

    await service.create(
      USER_ID,
      'viewer',
      UserRole.Viewer,
      '  Maria Silva  ',
      'preciso cadastrar',
    );

    expect(usersService.updateProfile).toHaveBeenCalledWith(
      USER_ID,
      'Maria Silva',
    );
    expect(requestModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'viewer',
        status: EditorRequestStatus.Pending,
        message: 'preciso cadastrar',
      }),
    );
  });

  it('updates pending request name and message', async () => {
    const save = jest.fn();
    requestModel.findById.mockReturnValue({
      exec: () =>
        Promise.resolve({
          status: EditorRequestStatus.Pending,
          userId: USER_ID,
          message: 'antiga',
          save,
        }),
    });

    const result = await service.updatePending(
      'req1',
      USER_ID,
      'Nome Corrigido',
      'mensagem nova',
    );

    expect(usersService.updateProfile).toHaveBeenCalledWith(
      USER_ID,
      'Nome Corrigido',
    );
    expect(result.message).toBe('mensagem nova');
    expect(save).toHaveBeenCalled();
  });

  it('rejects updatePending from another user', async () => {
    requestModel.findById.mockReturnValue({
      exec: () =>
        Promise.resolve({
          status: EditorRequestStatus.Pending,
          userId: USER_ID,
          save: jest.fn(),
        }),
    });

    await expect(
      service.updatePending('req1', OTHER_ID, 'Nome'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects updatePending when request is not pending', async () => {
    requestModel.findById.mockReturnValue({
      exec: () =>
        Promise.resolve({
          status: EditorRequestStatus.Approved,
          userId: USER_ID,
          save: jest.fn(),
        }),
    });

    await expect(
      service.updatePending('req1', USER_ID, 'Nome'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects updatePending when request is missing', async () => {
    requestModel.findById.mockReturnValue({
      exec: () => Promise.resolve(null),
    });

    await expect(
      service.updatePending('req1', USER_ID, 'Nome'),
    ).rejects.toBeInstanceOf(NotFoundException);
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
    expect(usersService.updateRole).toHaveBeenCalledWith(
      USER_ID,
      UserRole.Editor,
    );
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
