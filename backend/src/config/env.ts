export interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  isProduction: boolean;
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Variable de entorno requerida: ${name}`);
  }
  return value.trim();
}

export function loadEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  const jwtSecret = isProduction
    ? requireEnv('JWT_SECRET', process.env.JWT_SECRET)
    : (process.env.JWT_SECRET ?? 'dev-secret-change-me');

  const databaseUrl = isProduction
    ? requireEnv('DATABASE_URL', process.env.DATABASE_URL)
    : (process.env.DATABASE_URL ??
      'postgresql://dkfitt:dkfitt@localhost:5432/dkfitt');

  return {
    port: Number(process.env.PORT) || 3000,
    nodeEnv,
    databaseUrl,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
    isProduction,
  };
}

export const env = loadEnv();
