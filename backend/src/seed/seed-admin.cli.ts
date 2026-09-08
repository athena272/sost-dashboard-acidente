import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserRole } from '@sost/shared';
import { UserSchema } from '../users/user.schema';
import { buildAdminCreatePayload } from './build-admin-create-payload';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sost-dashboard';
  const username = (process.env.ADMIN_USERNAME ?? 'admin').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';

  await mongoose.connect(uri);
  const UserModel = mongoose.model('User', UserSchema);
  const existing = await UserModel.findOne({ username });
  if (existing) {
    console.log(`Admin already exists: ${username}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.create(buildAdminCreatePayload(username, passwordHash));
  console.log(`Admin created: ${username} (role=${UserRole.Admin})`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
