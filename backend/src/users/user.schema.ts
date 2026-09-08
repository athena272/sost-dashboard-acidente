import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '@sost/shared';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, required: true, unique: true, trim: true, lowercase: true })
  username!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({ type: String, enum: UserRole, required: true, default: UserRole.Viewer })
  role!: UserRole;

  @Prop({ type: String, trim: true })
  name?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ role: 1, createdAt: -1 });
