/**
 * Simula login de um usuário (ex.: carlos_machado) na API de produção.
 * Cada login bem-sucedido gera um evento auth.login no histórico.
 *
 * O workflow dispara várias vezes ao dia; este script faz 1 login por execução,
 * com atraso aleatório e chance de pular (para variar entre ~3 e 4 logins/dia).
 *
 * Uso local:
 *   ORGANIC_API_URL=https://api-sost-dashboard.vercel.app \
 *   ORGANIC_USERNAME=carlos_machado \
 *   ORGANIC_PASSWORD='senha' \
 *   ORGANIC_SKIP_JITTER=1 \
 *   node scripts/organic-login.mjs
 *
 * Env opcionais:
 *   ORGANIC_JITTER_MAX_MS  — atraso aleatório antes do login (padrão 35 min)
 *   ORGANIC_SKIP_JITTER=1  — sem atraso (útil em teste manual)
 *   ORGANIC_SKIP_CHANCE    — chance 0..1 de não logar nesta execução (padrão 0.2)
 */

const apiUrl = (process.env.ORGANIC_API_URL || '').replace(/\/$/, '');
const username = process.env.ORGANIC_USERNAME || '';
const password = process.env.ORGANIC_PASSWORD || '';
const jitterMaxMs = Number(process.env.ORGANIC_JITTER_MAX_MS ?? 35 * 60 * 1000);
const skipJitter = process.env.ORGANIC_SKIP_JITTER === '1';
const skipChance = Number(process.env.ORGANIC_SKIP_CHANCE ?? 0.2);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function login() {
  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const detail =
      typeof body === 'object' && body && 'message' in body
        ? body.message
        : text.slice(0, 200);
    throw new Error(`Login falhou (${res.status}): ${detail}`);
  }

  const who = body?.user?.username ?? username;
  const role = body?.user?.role ?? '?';
  console.log(`[organic-login] ok — ${who} (${role})`);
  return body;
}

async function main() {
  if (!apiUrl || !username || !password) {
    console.error(
      'Defina ORGANIC_API_URL, ORGANIC_USERNAME e ORGANIC_PASSWORD.',
    );
    process.exit(1);
  }

  if (!skipJitter && Math.random() < skipChance) {
    console.log('[organic-login] pulando esta janela (variação diária)');
    return;
  }

  if (!skipJitter && jitterMaxMs > 0) {
    const wait = Math.floor(Math.random() * jitterMaxMs);
    console.log(
      `[organic-login] aguardando ${(wait / 60000).toFixed(1)} min (jitter)`,
    );
    await sleep(wait);
  }

  await login();
}

main().catch((err) => {
  console.error('[organic-login]', err.message || err);
  process.exit(1);
});
