import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'value'
> & {
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({
  value,
  onChange,
  id,
  placeholder,
  'aria-label': ariaLabel,
  ...rest
}: Props) {
  return (
    <div className="search-field">
      <span className="search-field-icon" aria-hidden>
        <Search size={18} strokeWidth={2} />
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        {...rest}
      />
    </div>
  );
}
