import { z } from 'zod';
import { AccidentType } from '@sost/shared';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Informe o usuário'),
  password: z.string().min(1, 'Informe a senha'),
});

export const registerSchema = z.object({
  name: z.string().trim().optional(),
  username: z
    .string()
    .trim()
    .min(3, 'O usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const profileSchema = z.object({
  name: z.string().trim().max(120, 'Nome muito longo').optional(),
});

export const editorRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe o nome completo (mínimo 2 caracteres)')
    .max(120, 'Nome muito longo'),
  message: z.string().trim().max(500, 'Mensagem muito longa').optional(),
});

const requiredText = (message: string) =>
  z.string().trim().min(1, message);

export const accidentFormSchema = z.object({
  reportNumber: z.string().optional(),
  company: requiredText('Informe a empresa'),
  catNumber: z.string().optional(),
  victimName: z
    .string()
    .trim()
    .min(2, 'Informe o nome da vítima (mínimo 2 caracteres)'),
  sex: z.string().optional(),
  role: z.string().optional(),
  accidentMonth: z.string().optional(),
  sector: z.string().optional(),
  employeeAllocation: z.string().optional(),
  accidentDate: requiredText('Informe a data do acidente'),
  emissionYear: z
    .string()
    .trim()
    .min(1, 'Informe o ano de emissão')
    .regex(/^\d{4}$/, 'Informe um ano válido com 4 dígitos'),
  emissionDate: z.string().optional(),
  accidentTime: z.string().optional(),
  bodyPart: z.string().optional(),
  causingAgent: z.string().optional(),
  accidentType: z
    .string()
    .trim()
    .min(1, 'Selecione o tipo do acidente')
    .refine(
      (value) => Object.values(AccidentType).includes(value as AccidentType),
      'Selecione o tipo do acidente',
    ),
  cid: z.string().optional(),
  daysOff: z.string().optional(),
  destinationSector: z.string().optional(),
  subject: z.string().optional(),
  seiReference: z.string().optional(),
  responseDeadline: z.string().optional(),
  remainingDeadline: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type EditorRequestValues = z.infer<typeof editorRequestSchema>;
export type AccidentFormSchemaValues = z.infer<typeof accidentFormSchema>;
