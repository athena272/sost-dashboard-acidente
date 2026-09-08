import { useId, type TextareaHTMLAttributes } from 'react';
import { FieldShell } from './TextField';

type Props = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'aria-label' | 'onChange' | 'value'
> & {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  ariaLabel?: string;
};

export function TextAreaField({
  id,
  label,
  value,
  onChange,
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
      <textarea
        id={inputId}
        className={`${error ? 'field-invalid' : ''}${className ? ` ${className}` : ''}`.trim()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel ?? label}
        aria-invalid={Boolean(error)}
        aria-required={required || undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...rest}
      />
    </FieldShell>
  );
}
