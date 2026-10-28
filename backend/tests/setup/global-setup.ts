import { execSync } from 'node:child_process';
import { TEST_DATABASE_URL, assertLocalDatabase } from './test-env.js';

export default function globalSetup() {
  assertLocalDatabase(TEST_DATABASE_URL);

  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'pipe',
    });
  } catch (error) {
    const output = (error as { stderr?: Buffer }).stderr?.toString() ?? '';
    throw new Error(
      'Não foi possível preparar o banco de testes. Ele está rodando? Use "npm run test:db" para subir.\n' + output
    );
  }
}
