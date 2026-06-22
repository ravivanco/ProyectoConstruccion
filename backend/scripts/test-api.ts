import '../src/loadEnv.js';
import { signToken } from '../src/utils/jwt.js';

const baseUrl = (process.argv[2] ?? process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true, detail: 'OK' });
    console.log(`✓ ${name}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, detail });
    console.error(`✗ ${name}: ${detail}`);
  }
}

async function main() {
  console.log(`\nProbando API en: ${baseUrl}\n`);

  await runTest('GET /', async () => {
    const response = await fetch(`${baseUrl}/`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const body = await response.json();
    if (body.name !== 'DK-FITT API') throw new Error('Respuesta inesperada');
  });

  await runTest('GET /health', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();
    if (!response.ok && response.status !== 503) {
      throw new Error(`Status ${response.status}`);
    }
    if (!body.uptime && body.uptime !== 0) throw new Error('Falta uptime');
    if (!['connected', 'disconnected'].includes(body.database)) {
      throw new Error(`Database: ${body.database}`);
    }
    if (body.database !== 'connected') {
      throw new Error('Base de datos desconectada');
    }
  });

  await runTest('GET /api-docs', async () => {
    const response = await fetch(`${baseUrl}/api-docs/`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const html = await response.text();
    if (!html.includes('swagger')) throw new Error('Swagger UI no detectado');
  });

  await runTest('GET /api/me con JWT', async () => {
    const token = signToken({
      id: 'test-user',
      email: 'test@dkfitt.com',
      role: 'nutricionista',
    });

    const response = await fetch(`${baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    const body = await response.json();
    if (body.email !== 'test@dkfitt.com' || body.role !== 'nutricionista') {
      throw new Error('Perfil inesperado');
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log(`\nResultado: ${passed}/${total} pruebas exitosas\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
