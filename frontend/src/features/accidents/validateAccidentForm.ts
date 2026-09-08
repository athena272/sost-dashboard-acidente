import { getZodFieldErrors } from '../../lib/formErrors';
import { accidentFormSchema } from '../../lib/formSchemas';
import type { AccidentFormValues } from './types';

export type AccidentFormValidation =
  | { ok: true }
  | {
      ok: false;
      fieldErrors: Record<string, string>;
      message: string;
    };

/** Gate used by AccidentFormPage before any create/update API call. */
export function validateAccidentForm(
  form: AccidentFormValues,
): AccidentFormValidation {
  const parsed = accidentFormSchema.safeParse(form);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: getZodFieldErrors(parsed.error),
      message: 'Preencha os campos obrigatórios destacados antes de salvar.',
    };
  }
  return { ok: true };
}
