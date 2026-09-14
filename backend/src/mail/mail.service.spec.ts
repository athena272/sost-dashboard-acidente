import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

describe('MailService', () => {
  let configValues: Record<string, string | undefined>;
  let service: MailService;
  let sendMock: jest.Mock;

  beforeEach(() => {
    configValues = {};
    sendMock = jest.fn().mockResolvedValue({ data: { id: 'msg_1' }, error: null });

    const config = {
      get: (key: string) => configValues[key],
    } as ConfigService;

    service = new MailService(config);
    jest.spyOn(service, 'createResendClient').mockReturnValue({
      emails: { send: sendMock },
    } as never);
  });

  it('does not call Resend when API key is missing', async () => {
    configValues.ADMIN_NOTIFICATION_EMAILS = 'admin@example.com';

    await service.notifyNewEditorRequest({
      username: 'viewer1',
      name: 'Maria',
    });

    expect(service.createResendClient).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('does not call Resend when recipient list is empty', async () => {
    configValues.RESEND_API_KEY = 're_test';
    configValues.ADMIN_NOTIFICATION_EMAILS = ' , ';

    await service.notifyNewEditorRequest({
      username: 'viewer1',
      name: 'Maria',
    });

    expect(service.createResendClient).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends HTML email to parsed recipient list', async () => {
    configValues.RESEND_API_KEY = 're_test';
    configValues.MAIL_FROM = 'SOST <alerts@example.com>';
    configValues.ADMIN_NOTIFICATION_EMAILS =
      'guilhermera272@gmail.com, other@example.com';

    await service.notifyNewEditorRequest({
      username: 'viewer1',
      name: 'Maria Silva',
      message: 'preciso cadastrar',
      requestId: 'req1',
    });

    expect(service.createResendClient).toHaveBeenCalledWith('re_test');
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'SOST <alerts@example.com>',
        to: ['guilhermera272@gmail.com', 'other@example.com'],
        subject: 'SOST — Novo pedido de Editor: viewer1',
        html: expect.stringContaining('Novo pedido de Editor'),
        text: expect.stringContaining('Usuário: viewer1'),
      }),
    );
  });

  it('swallows Resend API errors without throwing', async () => {
    configValues.RESEND_API_KEY = 're_test';
    configValues.ADMIN_NOTIFICATION_EMAILS = 'admin@example.com';
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'rate limited', name: 'rate_limit_exceeded' },
    });

    await expect(
      service.notifyNewEditorRequest({
        username: 'viewer1',
        name: 'Maria',
        requestId: 'req1',
      }),
    ).resolves.toBeUndefined();
  });

  it('swallows thrown errors without throwing', async () => {
    configValues.RESEND_API_KEY = 're_test';
    configValues.ADMIN_NOTIFICATION_EMAILS = 'admin@example.com';
    sendMock.mockRejectedValue(new Error('network down'));

    await expect(
      service.notifyNewEditorRequest({
        username: 'viewer1',
        name: 'Maria',
      }),
    ).resolves.toBeUndefined();
  });
});
