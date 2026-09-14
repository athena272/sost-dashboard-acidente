import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { parseNotificationEmails } from './parse-notification-emails';
import {
  buildNewEditorRequestEmail,
  type NewEditorRequestEmailInput,
} from './templates/new-editor-request.email';

export type NotifyNewEditorRequestInput = NewEditorRequestEmailInput & {
  requestId?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Sends an HTML alert when a viewer requests the Editor role.
   * No-ops when RESEND_API_KEY or ADMIN_NOTIFICATION_EMAILS are missing.
   * Never throws — email failure must not break request creation.
   */
  async notifyNewEditorRequest(
    input: NotifyNewEditorRequestInput,
  ): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
    const from =
      this.config.get<string>('MAIL_FROM')?.trim() ||
      'SOST Dashboard <onboarding@resend.dev>';
    const recipients = parseNotificationEmails(
      this.config.get<string>('ADMIN_NOTIFICATION_EMAILS'),
    );

    if (!apiKey || recipients.length === 0) {
      this.logger.debug(
        'Skipping editor-request email: RESEND_API_KEY or ADMIN_NOTIFICATION_EMAILS not configured',
      );
      return;
    }

    const { subject, html, text } = buildNewEditorRequestEmail(input);

    try {
      const resend = this.createResendClient(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: recipients,
        subject,
        html,
        text,
      });

      if (error) {
        this.logger.warn(
          `Failed to send editor-request email (requestId=${input.requestId ?? 'n/a'}): ${error.message}`,
        );
        return;
      }

      this.logger.log(
        `Editor-request email sent to ${recipients.length} recipient(s) (requestId=${input.requestId ?? 'n/a'})`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed to send editor-request email (requestId=${input.requestId ?? 'n/a'}): ${message}`,
      );
    }
  }

  /** Exposed for tests — override via prototype or spy. */
  createResendClient(apiKey: string): Resend {
    return new Resend(apiKey);
  }
}
