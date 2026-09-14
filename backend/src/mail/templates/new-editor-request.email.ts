export type NewEditorRequestEmailInput = {
  username: string;
  name: string;
  message?: string;
  createdAt?: Date;
};

export type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDatePtBr(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

/**
 * Builds a presentable multipart email (HTML + plain text) for a new editor request.
 * Uses table layout and inline CSS for broad client compatibility.
 */
export function buildNewEditorRequestEmail(
  input: NewEditorRequestEmailInput,
): BuiltEmail {
  const when = input.createdAt ?? new Date();
  const whenLabel = formatDatePtBr(when);
  const username = escapeHtml(input.username.trim());
  const name = escapeHtml(input.name.trim());
  const message = input.message?.trim()
    ? escapeHtml(input.message.trim())
    : null;

  const subject = `SOST — Novo pedido de Editor: ${input.username.trim()}`;

  const messageRow = message
    ? `
                  <tr>
                    <td style="padding:10px 0 4px;font-size:12px;color:#5b6b78;text-transform:uppercase;letter-spacing:0.04em;">Mensagem</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 12px;font-size:15px;color:#15202b;line-height:1.5;">${message}</td>
                  </tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #c9d5de;">
          <tr>
            <td style="background-color:#0b5f6b;padding:20px 28px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#d7e3ea;">SOST</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">Novo pedido de Editor</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#5b6b78;">
                Um visualizador solicitou o perfil <strong style="color:#15202b;">Editor de registros</strong>. Revise o pedido no painel administrativo.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f8fa;border-radius:8px;padding:4px 16px;">
                <tr>
                  <td style="padding:16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:0 0 4px;font-size:12px;color:#5b6b78;text-transform:uppercase;letter-spacing:0.04em;">Usuário</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px;font-size:15px;color:#15202b;font-weight:600;">${username}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 4px;font-size:12px;color:#5b6b78;text-transform:uppercase;letter-spacing:0.04em;">Nome</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px;font-size:15px;color:#15202b;">${name}</td>
                      </tr>
                      ${messageRow}
                      <tr>
                        <td style="padding:10px 0 4px;font-size:12px;color:#5b6b78;text-transform:uppercase;letter-spacing:0.04em;">Data</td>
                      </tr>
                      <tr>
                        <td style="padding:0;font-size:15px;color:#15202b;">${escapeHtml(whenLabel)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#5b6b78;">
                Acesse o painel → <strong style="color:#0b5f6b;">Pedidos</strong> para aprovar ou rejeitar.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background-color:#f5f8fa;border-top:1px solid #c9d5de;">
              <p style="margin:0;font-size:12px;color:#5b6b78;line-height:1.4;">
                Alerta automático do SOST — Dashboard de Acidentes. Não responda a este e-mail.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    'SOST — Novo pedido de Editor',
    '',
    `Usuário: ${input.username.trim()}`,
    `Nome: ${input.name.trim()}`,
  ];
  if (input.message?.trim()) {
    textLines.push(`Mensagem: ${input.message.trim()}`);
  }
  textLines.push(`Data: ${whenLabel}`, '', 'Acesse o painel → Pedidos para aprovar ou rejeitar.');

  return {
    subject,
    html,
    text: textLines.join('\n'),
  };
}
