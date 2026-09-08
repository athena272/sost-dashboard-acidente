import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

export type FieldBaseProps = {
  id?: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  ariaLabel?: string;
  children?: ReactNode;
};

type TextFieldProps = FieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-label' | 'onChange' | 'value'> & {
    value: string;
    onChange: (value: string) => void;
  };

export function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  children,
}: FieldBaseProps & { children: ReactNode }) {
  const errorId = id ? `${id}-error` : undefined;
  const hintId = id ? `${id}-hint` : undefined;

  return (
    <div className={`field${error ? ' field-has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span className="field-required"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
      <p
        id={errorId}
        className="field-error"
        role={error ? 'alert' : undefined}
        aria-hidden={error ? undefined : true}
      >
        {error ?? ''}
      </p>
    </div>
  );
}

export function TextField({
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
}: TextFieldProps) {
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
      <input
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
