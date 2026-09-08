import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@sost/shared';
import { User, UserDocument } from './user.schema';

export type CreateUserInput = {
  username: string;
  password: string;
  role: UserRole;
  name?: string;
};

export type QueryUsersInput = {
  page?: number;
  limit?: number;
  q?: string;
  role?: UserRole;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'username' | 'createdAt' | 'role';
  sortDir?: 'asc' | 'desc';
};

type PublicUserSource = {
  id?: string;
  _id?: { toString(): string };
  username: string;
  role: UserRole;
  name?: string;
  createdAt?: Date;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByUsername(username: string) {
    return this.userModel.findOne({ username: username.toLowerCase() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.userModel.create({
      username: input.username.toLowerCase(),
      passwordHash,
      role: input.role,
      name: input.name?.trim() || undefined,
    });
  }

  async count() {
    return this.userModel.countDocuments().exec();
  }

  async updateProfile(userId: string, name?: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { name: name?.trim() || undefined },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async updateRole(userId: string, role: UserRole) {
    if (role === UserRole.Admin) {
      throw new BadRequestException('Não é permitido atribuir o perfil Administrador');
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (user.role === UserRole.Admin) {
      throw new BadRequestException('Não é permitido alterar o perfil do Administrador');
    }

    user.role = role;
    await user.save();
    return user;
  }

  async findAll(query: QueryUsersInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: FilterQuery<UserDocument> = {};

    if (query.role) {
      filter.role = query.role;
    }
    if (query.q?.trim()) {
      const regex = new RegExp(query.q.trim(), 'i');
      filter.$or = [{ username: regex }, { name: regex }];
    }
    if (query.createdFrom || query.createdTo) {
      filter.createdAt = {};
      if (query.createdFrom) {
        filter.createdAt.$gte = new Date(`${query.createdFrom}T00:00:00.000Z`);
      }
      if (query.createdTo) {
        filter.createdAt.$lte = new Date(`${query.createdTo}T23:59:59.999Z`);
      }
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortDir: SortOrder = query.sortDir === 'asc' ? 1 : -1;
    const sort: Record<string, SortOrder> = { [sortBy]: sortDir };

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((item) => this.toPublic(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async migrateMissingRoles(adminUsername: string) {
    const users = await this.userModel
      .find({ $or: [{ role: { $exists: false } }, { role: null }] })
      .exec();
    for (const user of users) {
      user.role =
        user.username === adminUsername.toLowerCase()
          ? UserRole.Admin
          : UserRole.Viewer;
      await user.save();
    }

    const adminCount = await this.userModel.countDocuments({ role: UserRole.Admin });
    if (adminCount === 0) {
      const bootstrap = await this.findByUsername(adminUsername);
      if (bootstrap) {
        bootstrap.role = UserRole.Admin;
        await bootstrap.save();
      }
    }
  }

  toPublic(user: PublicUserSource) {
    const id = user.id ? String(user.id) : user._id ? String(user._id) : '';
    return {
      id,
      username: user.username,
      role: user.role,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
