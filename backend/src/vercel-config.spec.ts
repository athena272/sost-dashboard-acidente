import * as fs from 'fs';
import * as path from 'path';

/**
 * Alinha o backend ao padrão Nest na Vercel (Gestão de Salas):
 * framework null + api/index.js (JS puro → dist/) + public/ estático mínimo.
 */
describe('backend vercel Nest serverless layout', () => {
  const backendRoot = path.resolve(__dirname, '..');
  const vercelPath = path.join(backendRoot, 'vercel.json');
  const apiHandlerPath = path.join(backendRoot, 'api/index.js');
  const legacyTsHandler = path.join(backendRoot, 'api/index.ts');
  const publicIndex = path.join(backendRoot, 'public/index.html');

  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8')) as {
    framework?: string | null;
    outputDirectory?: string | null;
    functions?: Record<string, unknown>;
    rewrites?: Array<{ source: string; destination: string }>;
  };

  const handlerSource = fs.readFileSync(apiHandlerPath, 'utf8');

  it('forces Framework Preset Other (null), not Vite or NestJS auto-preset', () => {
    expect(config.framework).toBeNull();
    expect(config.framework).not.toBe('vite');
    expect(config.framework).not.toBe('nestjs');
  });

  it('keeps a static public/index.html so Vercel has an output without exposing dist', () => {
    expect(fs.existsSync(publicIndex)).toBe(true);
    expect(fs.readFileSync(publicIndex, 'utf8')).toContain('SOST');
  });

  it('uses api/index.js that requires compiled dist/serverless (Nest decorator metadata)', () => {
    expect(fs.existsSync(apiHandlerPath)).toBe(true);
    expect(fs.existsSync(legacyTsHandler)).toBe(false);
    expect(config.functions?.['api/index.js']).toBeDefined();
    expect(config.functions?.['api/index.ts']).toBeUndefined();
    expect(handlerSource).toMatch(/require\(['"]\.\.\/dist\/serverless['"]\)/);
    expect(handlerSource).not.toMatch(/@nestjs\//);
    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ destination: '/api' }),
      ]),
    );
  });
});
