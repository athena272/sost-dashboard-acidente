import { IsEnum, IsOptional } from 'class-validator';
import { EditorRequestStatus } from '@sost/shared';

export class QueryEditorRequestsDto {
  @IsOptional()
  @IsEnum(EditorRequestStatus)
  status?: EditorRequestStatus;
}
