import * as fs from 'fs';
import * as path from 'path';

/**
 * Garante que o backend na Vercel não seja tratado como site estático (Vite/public).
 * Regressão: deploy falhava com "No Output Directory named public found".
 */
describe('backend vercel.json', () => {
  const vercelPath = path.resolve(__dirname, '../vercel.json');
  const apiHandlerPath = path.resolve(__dirname, '../api/index.ts');

  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8')) as {
    framework?: string | null;
    outputDirectory?: string | null;
    functions?: Record<string, unknown>;
    rewrites?: Array<{ source: string; destination: string }>;
  };

  it('forces Framework Preset Other (null) so Vercel does not expect public/', () => {
    expect(config.framework).toBeNull();
    expect(config.framework).not.toBe('vite');
  });

  it('does not declare a static outputDirectory like public or dist', () => {
    expect(config.outputDirectory === null || config.outputDirectory === undefined).toBe(
      true,
    );
    expect(config.outputDirectory).not.toBe('public');
    expect(config.outputDirectory).not.toBe('dist');
  });

  it('exposes the Nest app via api/index.ts serverless function', () => {
    expect(fs.existsSync(apiHandlerPath)).toBe(true);
    expect(config.functions?.['api/index.ts']).toBeDefined();
    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ destination: '/api' }),
      ]),
    );
  });
});
