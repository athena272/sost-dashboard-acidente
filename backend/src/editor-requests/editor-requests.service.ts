import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { EditorRequestStatus, UserRole } from '@sost/shared';
import { UsersService } from '../users/users.service';
import { EditorRequest, EditorRequestDocument } from './editor-request.schema';

@Injectable()
export class EditorRequestsService {
  constructor(
    @InjectModel(EditorRequest.name)
    private readonly requestModel: Model<EditorRequestDocument>,
    private readonly usersService: UsersService,
  ) {}

  private normalizeName(name: string) {
    const trimmed = name?.trim() ?? '';
    if (trimmed.length < 2) {
      throw new BadRequestException('Informe o nome completo');
    }
    return trimmed;
  }

  async create(
    userId: string,
    username: string,
    role: UserRole,
    name: string,
    message?: string,
  ) {
    if (role !== UserRole.Viewer) {
      throw new BadRequestException(
        'Apenas Visualizadores podem solicitar o perfil de Editor de registros',
      );
    }

    const existing = await this.requestModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: EditorRequestStatus.Pending,
      })
      .exec();
    if (existing) {
      throw new ConflictException('Já existe uma solicitação pendente');
    }

    const normalizedName = this.normalizeName(name);
    await this.usersService.updateProfile(userId, normalizedName);

    return this.requestModel.create({
      userId: new Types.ObjectId(userId),
      username,
      status: EditorRequestStatus.Pending,
      message: message?.trim() || undefined,
    });
  }

  async updatePending(
    requestId: string,
    userId: string,
    name: string,
    message?: string,
  ) {
    const request = await this.requestModel.findById(requestId).exec();
    if (!request) throw new NotFoundException('Solicitação não encontrada');
    if (String(request.userId) !== userId) {
      throw new BadRequestException('Só é possível editar a própria solicitação');
    }
    if (request.status !== EditorRequestStatus.Pending) {
      throw new BadRequestException('Só é possível editar solicitações pendentes');
    }

    const normalizedName = this.normalizeName(name);
    await this.usersService.updateProfile(userId, normalizedName);
    request.message = message?.trim() || undefined;
    await request.save();
    return request;
  }

  async findMine(userId: string) {
    return this.requestModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findPendingMine(userId: string) {
    return this.requestModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: EditorRequestStatus.Pending,
      })
      .lean()
      .exec();
  }

  async findAll(status?: EditorRequestStatus) {
    const filter: FilterQuery<EditorRequestDocument> = {};
    if (status) filter.status = status;
    return this.requestModel
      .find(filter)
      .populate('userId', 'name username')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async countPending() {
    return this.requestModel
      .countDocuments({ status: EditorRequestStatus.Pending })
      .exec();
  }

  async cancel(requestId: string, userId: string) {
    const request = await this.requestModel.findById(requestId).exec();
    if (!request) throw new NotFoundException('Solicitação não encontrada');
    if (String(request.userId) !== userId) {
      throw new BadRequestException('Só é possível cancelar a própria solicitação');
    }
    if (request.status !== EditorRequestStatus.Pending) {
      throw new BadRequestException('Só é possível cancelar solicitações pendentes');
    }
    request.status = EditorRequestStatus.Cancelled;
    await request.save();
    return request;
  }

  async approve(requestId: string, adminUserId: string) {
    const request = await this.requestModel.findById(requestId).exec();
    if (!request) throw new NotFoundException('Solicitação não encontrada');
    if (request.status !== EditorRequestStatus.Pending) {
      throw new BadRequestException('Solicitação não está pendente');
    }

    await this.usersService.updateRole(String(request.userId), UserRole.Editor);
    request.status = EditorRequestStatus.Approved;
    request.reviewedBy = new Types.ObjectId(adminUserId);
    request.reviewedAt = new Date();
    await request.save();
    return request;
  }

  async reject(requestId: string, adminUserId: string) {
    const request = await this.requestModel.findById(requestId).exec();
    if (!request) throw new NotFoundException('Solicitação não encontrada');
    if (request.status !== EditorRequestStatus.Pending) {
      throw new BadRequestException('Solicitação não está pendente');
    }

    request.status = EditorRequestStatus.Rejected;
    request.reviewedBy = new Types.ObjectId(adminUserId);
    request.reviewedAt = new Date();
    await request.save();
    return request;
  }
}
