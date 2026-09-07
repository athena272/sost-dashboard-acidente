import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByUsername(username: string) {
    return this.userModel.findOne({ username: username.toLowerCase() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(username: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.userModel.create({
      username: username.toLowerCase(),
      passwordHash,
    });
  }

  async count() {
    return this.userModel.countDocuments().exec();
  }
}
