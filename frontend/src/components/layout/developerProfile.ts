export const DEVELOPER_PROFILE = {
  name: 'Guilherme R. Alves',
  role: 'Engenheiro de Software',
  phone: '(79) 99900-7075',
  phoneCountryCode: '55',
  linkedinUrl: 'https://www.linkedin.com/in/guigorosario/',
  githubUrl: 'https://github.com/athena272',
} as const;

export type DeveloperContactId = 'whatsapp' | 'linkedin' | 'github';

export type DeveloperContact = {
  id: DeveloperContactId;
  label: string;
  href: string;
  color: string;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function buildWhatsAppUrl(
  maskedPhone: string,
  countryCode: string,
): string {
  return `https://wa.me/${digitsOnly(countryCode)}${digitsOnly(maskedPhone)}`;
}

export function formatRightsNotice(
  year: number = new Date().getFullYear(),
): string {
  return `© ${year} Todos os direitos reservados.`;
}

export const DEVELOPER_CONTACTS: readonly DeveloperContact[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: buildWhatsAppUrl(
      DEVELOPER_PROFILE.phone,
      DEVELOPER_PROFILE.phoneCountryCode,
    ),
    color: '#25D366',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: DEVELOPER_PROFILE.linkedinUrl,
    color: '#0A66C2',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: DEVELOPER_PROFILE.githubUrl,
    // Follows the main text color so the mark stays visible on any theme.
    color: 'var(--ink)',
  },
];
