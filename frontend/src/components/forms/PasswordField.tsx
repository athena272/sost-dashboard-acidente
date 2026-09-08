import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { FieldShell } from './TextField';

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  ariaLabel?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  required,
  error,
  hint,
  placeholder,
  ariaLabel,
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <div className="password-field">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={error ? 'field-invalid' : undefined}
          aria-label={ariaLabel ?? label}
          aria-invalid={Boolean(error)}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff size={18} strokeWidth={2} aria-hidden />
          ) : (
            <Eye size={18} strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>
    </FieldShell>
  );
}
