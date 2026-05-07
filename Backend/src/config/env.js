import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',

  // --- Oracle Database (Cloud / Autonomous DB) ---
  // Para Autonomous DB: descargar el wallet desde la consola de OCI,
  // descomprimirlo en una carpeta y apuntar ORACLE_WALLET_DIR allí.
  // El servicio se obtiene del archivo tnsnames.ora dentro del wallet
  // (ej: midb_high, midb_medium, midb_low).
  ORACLE_USER: process.env.ORACLE_USER || 'admin',
  ORACLE_PASSWORD: process.env.ORACLE_PASSWORD || '',
  ORACLE_CONNECT_STRING: process.env.ORACLE_CONNECT_STRING || '',
  ORACLE_WALLET_DIR: process.env.ORACLE_WALLET_DIR || '',
  ORACLE_WALLET_PASSWORD: process.env.ORACLE_WALLET_PASSWORD || '',

  // Tamaño del pool
  ORACLE_POOL_MIN: process.env.ORACLE_POOL_MIN ? Number(process.env.ORACLE_POOL_MIN) : 2,
  ORACLE_POOL_MAX: process.env.ORACLE_POOL_MAX ? Number(process.env.ORACLE_POOL_MAX) : 10,
  ORACLE_POOL_INCREMENT: process.env.ORACLE_POOL_INCREMENT ? Number(process.env.ORACLE_POOL_INCREMENT) : 1,

  // Modo de cliente: 'thin' (default, sin Oracle Client) o 'thick' (requiere Instant Client).
  // El modo thin de node-oracledb ya soporta Autonomous DB con mTLS por wallet.
  ORACLE_CLIENT_MODE: process.env.ORACLE_CLIENT_MODE || 'thin',
  ORACLE_CLIENT_LIB_DIR: process.env.ORACLE_CLIENT_LIB_DIR || '',

  // --- IA (opcional) ---
  AI_PROVIDER: process.env.AI_PROVIDER || 'heuristic',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
};
