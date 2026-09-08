import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEditorRequestDto {
  @IsString({ message: 'Informe o nome completo' })
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres' })
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
