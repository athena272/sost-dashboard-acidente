import { useId, type SelectHTMLAttributes } from 'react';
import { FieldShell } from './TextField';

export type SelectOption = {
  value: string;
  label: string;
};

type Props = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'id' | 'aria-label' | 'onChange' | 'value'
> & {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  ariaLabel?: string;
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione…',
  error,
  hint,
  required,
  ariaLabel,
  className,
  ...rest
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <FieldShell
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <select
        id={inputId}
        className={`${error ? 'field-invalid' : ''}${className ? ` ${className}` : ''}`.trim()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel ?? label}
        aria-invalid={Boolean(error)}
        aria-required={required || undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
