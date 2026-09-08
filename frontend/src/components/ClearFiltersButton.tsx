import { FilterX } from 'lucide-react';

type Props = {
  onClick: () => void;
};

export function ClearFiltersButton({ onClick }: Props) {
  return (
    <button
      className="btn secondary btn-with-icon"
      type="button"
      onClick={onClick}
    >
      <FilterX size={16} strokeWidth={2} aria-hidden />
      Limpar filtros
    </button>
  );
}
