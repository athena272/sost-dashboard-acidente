import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatsAuditButton } from './StatsAuditDialog';

export type KpiVariant = 'total' | 'types' | 'cids';

type KpiCardProps = {
  label: ReactNode;
  value: number;
  variant: KpiVariant;
  icon: LucideIcon;
  onAudit: () => void;
};

export function KpiCard({
  label,
  value,
  variant,
  icon: Icon,
  onAudit,
}: KpiCardProps) {
  return (
    <div className={`card stack kpi-card kpi-card--${variant}`}>
      <div className="kpi-head">
        <div className="kpi-label">
          <span className="kpi-icon" aria-hidden>
            <Icon size={18} strokeWidth={2} />
          </span>
          <div className="muted">{label}</div>
        </div>
        <StatsAuditButton onClick={onAudit} />
      </div>
      <div className="stat">{value}</div>
    </div>
  );
}
