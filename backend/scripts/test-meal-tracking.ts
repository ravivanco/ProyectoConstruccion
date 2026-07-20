import '../src/loadEnv.js';
import { signToken } from '../src/utils/jwt.js';

const baseUrl = (process.argv[2] ?? process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const patientId = 'p-1';

const nutritionistToken = signToken({
  id: 'nutri-1',
  email: 'nutri@dkfitt.com',
  role: 'nutricionista',
});

const patientToken = signToken({
  id: patientId,
  email: 'carlos.m@gmail.com',
  role: 'paciente',
});

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`✗ ${name}: ${detail}`);
    process.exit(1);
  }
}

async function main() {
  console.log(`\nPROYEC-688 — Pruebas cumplimiento alimentario (${baseUrl})\n`);

  await runTest('POST /meal-logs/me prepara datos', async () => {
    const response = await fetch(`${baseUrl}/meal-logs/me`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mealType: 'Desayuno',
        foodName: 'Avena con fruta',
        calories: 320,
        protein: 12,
        carbs: 48,
        fat: 8,
      }),
    });

    if (response.status !== 201 && response.status !== 409) {
      throw new Error(`Status ${response.status}`);
    }
  });

  await runTest('GET /meal-tracking/patient/:id responde 200', async () => {
    const response = await fetch(`${baseUrl}/meal-tracking/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${nutritionistToken}` },
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const body = await response.json();
    if (body.patientId !== patientId) throw new Error('patientId incorrecto');
    if (!Array.isArray(body.slots) || body.slots.length !== 5) throw new Error('slots inválidos');
    if (typeof body.compliancePercentage !== 'number') throw new Error('Falta compliancePercentage');
    if (typeof body.mealsLogged !== 'number') throw new Error('Falta mealsLogged');
  });

  await runTest('GET /meal-tracking/patient/:id rechaza paciente ajeno', async () => {
    const otherPatient = signToken({
      id: 'p-2',
      email: 'ana.g@hotmail.com',
      role: 'paciente',
    });
    const response = await fetch(`${baseUrl}/meal-tracking/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${otherPatient}` },
    });
    if (response.status !== 403) throw new Error(`Se esperaba 403, recibido ${response.status}`);
  });

  console.log('\nTodas las pruebas de cumplimiento alimentario pasaron.\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
