import * as fs from 'fs';
import * as path from 'path';

/**
 * Dual Express 4+5 causa `'app.router' is deprecated` no bootstrap Nest na Vercel.
 */
describe('express major alignment', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const backendPkg = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'backend/package.json'), 'utf8'),
  ) as { dependencies: Record<string, string> };
  const workspaceYaml = fs.readFileSync(
    path.join(repoRoot, 'pnpm-workspace.yaml'),
    'utf8',
  );
  const lockfile = fs.readFileSync(path.join(repoRoot, 'pnpm-lock.yaml'), 'utf8');

  it('declares express major 5 in backend package.json', () => {
    const range = backendPkg.dependencies.express;
    expect(range).toBeDefined();
    expect(range.startsWith('^5.') || range.startsWith('5.')).toBe(true);
  });

  it('pins express 5 via pnpm-workspace overrides', () => {
    expect(workspaceYaml).toMatch(/overrides:[\s\S]*express:\s*"?\^?5/);
  });

  it('does not keep express@4 as a resolved package in the lockfile', () => {
    expect(lockfile).not.toMatch(/^ {2}express@4\./m);
    expect(lockfile).toMatch(/^ {2}express@5\./m);
  });
});
