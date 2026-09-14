import { buildNewEditorRequestEmail } from './templates/new-editor-request.email';

describe('buildNewEditorRequestEmail', () => {
  const createdAt = new Date('2026-03-15T14:30:00.000Z');

  it('builds a stable subject with username', () => {
    const email = buildNewEditorRequestEmail({
      username: 'viewer1',
      name: 'Maria Silva',
      createdAt,
    });
    expect(email.subject).toBe('SOST — Novo pedido de Editor: viewer1');
  });

  it('includes brand and request data in HTML', () => {
    const email = buildNewEditorRequestEmail({
      username: 'viewer1',
      name: 'Maria Silva',
      message: 'Preciso cadastrar CATs',
      createdAt,
    });

    expect(email.html).toContain('SOST');
    expect(email.html).toContain('Novo pedido de Editor');
    expect(email.html).toContain('viewer1');
    expect(email.html).toContain('Maria Silva');
    expect(email.html).toContain('Preciso cadastrar CATs');
    expect(email.html).toContain('#0b5f6b');
    expect(email.html).toContain('Acesse o painel');
  });

  it('escapes HTML in user-controlled fields', () => {
    const email = buildNewEditorRequestEmail({
      username: '<script>x</script>',
      name: 'A & B <C>',
      message: '"quote"',
      createdAt,
    });

    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('A &amp; B &lt;C&gt;');
    expect(email.html).toContain('&quot;quote&quot;');
  });

  it('omits message row when message is empty', () => {
    const email = buildNewEditorRequestEmail({
      username: 'viewer1',
      name: 'Maria',
      message: '   ',
      createdAt,
    });

    expect(email.html).not.toContain('>Mensagem<');
    expect(email.text).not.toContain('Mensagem:');
  });

  it('provides a non-empty plain-text fallback', () => {
    const email = buildNewEditorRequestEmail({
      username: 'viewer1',
      name: 'Maria Silva',
      message: 'preciso cadastrar',
      createdAt,
    });

    expect(email.text.length).toBeGreaterThan(20);
    expect(email.text).toContain('Usuário: viewer1');
    expect(email.text).toContain('Nome: Maria Silva');
    expect(email.text).toContain('Mensagem: preciso cadastrar');
    expect(email.text).toContain('Pedidos');
  });
});
