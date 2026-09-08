/**
 * Substitui o symlink pnpm de @sost/shared por cópia real dentro de backend/.
 * Na Vercel (Root Directory = backend) o symlink aponta para ../shared e some do bundle
 * da função, causando FUNCTION_INVOCATION_FAILED no require('@sost/shared').
 */
const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const sharedRoot = path.resolve(backendRoot, '../shared');
const target = path.join(backendRoot, 'node_modules', '@sost', 'shared');

function main() {
  const sharedPkg = path.join(sharedRoot, 'package.json');
  const sharedDist = path.join(sharedRoot, 'dist');
  if (!fs.existsSync(sharedPkg) || !fs.existsSync(sharedDist)) {
    throw new Error(
      `Shared package build missing at ${sharedRoot}. Run pnpm --filter @sost/shared build first.`,
    );
  }

  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(sharedDist, path.join(target, 'dist'), { recursive: true });
  fs.copyFileSync(sharedPkg, path.join(target, 'package.json'));
  // eslint-disable-next-line no-console
  console.log(`Vendored @sost/shared -> ${target}`);
}

main();
