import oracledb from 'oracledb';
import { env } from './env.js';

// Configuración global del driver
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;
// Para que NUMBER se devuelva como Number JS y no como string cuando es seguro
oracledb.fetchAsString = [];

let initialized = false;

/**
 * Inicializa el cliente en modo thick si se solicitó (requiere Oracle Instant Client).
 * En modo thin (default) no hace falta nada extra: el driver puro JS se conecta
 * directo a Autonomous DB usando el wallet (mTLS).
 */
function initClientIfNeeded() {
  if (initialized) return;
  initialized = true;

  if ((env.ORACLE_CLIENT_MODE || 'thin').toLowerCase() === 'thick') {
    const opts = {};
    if (env.ORACLE_CLIENT_LIB_DIR) opts.libDir = env.ORACLE_CLIENT_LIB_DIR;
    oracledb.initOracleClient(opts);
  }
}

let poolPromise = null;

/**
 * Devuelve el pool global de conexiones. Inicialización perezosa e idempotente.
 */
export async function getPool() {
  if (poolPromise) return poolPromise;

  initClientIfNeeded();

  if (!env.ORACLE_CONNECT_STRING) {
    throw new Error(
      'ORACLE_CONNECT_STRING no está definido. Configura la cadena de conexión ' +
        '(p.ej. el alias del tnsnames.ora del wallet de Autonomous DB).'
    );
  }

  const config = {
    user: env.ORACLE_USER,
    password: env.ORACLE_PASSWORD,
    connectString: env.ORACLE_CONNECT_STRING,
    poolMin: env.ORACLE_POOL_MIN,
    poolMax: env.ORACLE_POOL_MAX,
    poolIncrement: env.ORACLE_POOL_INCREMENT,
  };

  // Autonomous DB con wallet (modo thin acepta configDir + walletLocation/walletPassword)
  if (env.ORACLE_WALLET_DIR) {
    config.configDir = env.ORACLE_WALLET_DIR;
    config.walletLocation = env.ORACLE_WALLET_DIR;
    if (env.ORACLE_WALLET_PASSWORD) {
      config.walletPassword = env.ORACLE_WALLET_PASSWORD;
    }
  }

  poolPromise = oracledb.createPool(config);
  return poolPromise;
}

/**
 * Ejecuta una sentencia SQL contra el pool. Devuelve el objeto result tal cual
 * lo entrega node-oracledb: { rows, rowsAffected, outBinds, ... }.
 *
 * Por defecto usa autoCommit. Para transacciones manuales pasar { autoCommit: false }
 * y manejar la conexión por separado con getConnection().
 */
export async function query(sql, binds = {}, options = {}) {
  const pool = await getPool();
  let conn;
  try {
    conn = await pool.getConnection();
    return await conn.execute(sql, binds, options);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (_) {
        /* noop */
      }
    }
  }
}

/**
 * INSERT que devuelve el id generado por la columna IDENTITY.
 * El SQL DEBE terminar con `RETURNING id INTO :outId`.
 */
export async function insertReturningId(sql, binds = {}) {
  const fullBinds = {
    ...binds,
    outId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
  };
  const result = await query(sql, fullBinds);
  const arr = result?.outBinds?.outId;
  return Array.isArray(arr) ? arr[0] : arr;
}

/**
 * Convierte las claves de un row (que en Oracle vienen en MAYÚSCULA por defecto)
 * a minúsculas, para mantener compatibilidad con el shape histórico.
 * Las columnas con alias entre comillas ("camelCase") conservan su case.
 */
export function lowercaseRow(row) {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const k of Object.keys(row)) {
    // Si el alias ya tenía minúsculas/camel (porque venía entre comillas), respetarlo.
    // Si toda la clave es UPPER, pasarla a lower.
    out[k === k.toUpperCase() ? k.toLowerCase() : k] = row[k];
  }
  return out;
}

export function lowercaseRows(rows) {
  return Array.isArray(rows) ? rows.map(lowercaseRow) : rows;
}

/**
 * Convierte un valor que llega como string ISO (YYYY-MM-DD) a Date para
 * binding contra columnas DATE. Devuelve null si el valor es vacío.
 */
export function toDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function testConnection() {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    const result = await conn.execute('SELECT 1 AS ok FROM dual');
    return result?.rows?.[0]?.OK === 1 || result?.rows?.[0]?.ok === 1;
  } finally {
    await conn.close();
  }
}

export async function closePool() {
  if (!poolPromise) return;
  try {
    const pool = await poolPromise;
    await pool.close(10);
  } finally {
    poolPromise = null;
  }
}
