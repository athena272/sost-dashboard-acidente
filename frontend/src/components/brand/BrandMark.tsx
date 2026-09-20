import { acronymLabel } from '@sost/shared';

type BrandMarkProps = {
  subtitle?: string;
  tone?: 'default' | 'onDark';
};

export function BrandMark({
  subtitle = 'Dashboard de acidentes',
  tone = 'default',
}: BrandMarkProps) {
  const className = tone === 'onDark' ? 'brand brand--on-dark' : 'brand';

  return (
    <div className={className}>
      <img
        src="/brand-mark.png"
        alt=""
        className="brand-mark-img"
        width={44}
        height={44}
      />
      <div className="brand-text">
        <strong>{acronymLabel('SOST')}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </div>
  );
}
