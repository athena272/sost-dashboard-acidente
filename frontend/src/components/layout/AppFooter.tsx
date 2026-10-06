import { Globe } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  GitHubIcon,
  LinkedInIcon,
  WhatsAppIcon,
  type BrandIconProps,
} from '../brand/SocialBrandIcons';
import {
  DEVELOPER_CONTACTS,
  DEVELOPER_PROFILE,
  formatRightsNotice,
  type DeveloperContactId,
} from './developerProfile';

const SOCIAL_ICON_SIZE_PX = 32;

const CONTACT_ICONS: Record<DeveloperContactId, ComponentType<BrandIconProps>> =
  {
    whatsapp: WhatsAppIcon,
    linkedin: LinkedInIcon,
    github: GitHubIcon,
    portfolio: Globe,
  };

type AppFooterProps = {
  className?: string;
};

export function AppFooter({ className }: AppFooterProps) {
  const footerClassName = className ? `app-footer ${className}` : 'app-footer';

  return (
    <footer className={footerClassName}>
      <nav aria-label="Contato do desenvolvedor" className="app-footer-links">
        {DEVELOPER_CONTACTS.map(({ id, label, href, color }) => {
          const Icon = CONTACT_ICONS[id];
          return (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="app-footer-link"
              style={{ color }}
            >
              <Icon size={SOCIAL_ICON_SIZE_PX} />
              <span className="visually-hidden">{label} (abre em nova aba)</span>
            </a>
          );
        })}
      </nav>
      <p className="app-footer-credit">
        Desenvolvido por <strong>{DEVELOPER_PROFILE.name}</strong>
        <span aria-hidden> · </span>
        <span className="visually-hidden">, </span>
        <span className="app-footer-role">{DEVELOPER_PROFILE.role}</span>
      </p>
      <p className="app-footer-rights">{formatRightsNotice()}</p>
    </footer>
  );
}
