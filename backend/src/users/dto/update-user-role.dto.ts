import { IsEnum } from 'class-validator';
import { UserRole } from '@sost/shared';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
