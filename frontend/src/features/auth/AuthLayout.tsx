import type { ReactNode } from 'react';
import { acronymLabel } from '@sost/shared';
import { BrandMark } from '../../components/brand/BrandMark';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-hero">
        <img
          src="/auth-hero.png"
          alt=""
          className="auth-hero-image"
        />
        <div className="auth-hero-overlay">
          <BrandMark
            tone="onDark"
            subtitle="Saúde ocupacional e segurança do trabalho"
          />
          <p className="auth-hero-lead">
            Acompanhe registros de {acronymLabel('CAT')} com clareza, auditoria
            e visão mensal.
          </p>
        </div>
      </aside>
      <div className="auth-form-panel">{children}</div>
    </div>
  );
}
