import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getPool, closePool } from '../config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../../db/schema.sql');

function parseStatements(sql) {
  const statements = [];
  const lines = sql.split('\n');

  let buffer = '';
  let inPLSQL = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // "/" on its own line = end of PL/SQL block
    if (trimmed === '/') {
      const stmt = buffer.trim();
      if (stmt) statements.push({ sql: stmt, plsql: true });
      buffer = '';
      inPLSQL = false;
      continue;
    }

    // Detect start of PL/SQL block
    if (/^CREATE\s+OR\s+REPLACE\s+(TRIGGER|FUNCTION|PROCEDURE|PACKAGE)/i.test(trimmed)) {
      inPLSQL = true;
    }

    if (inPLSQL) {
      buffer += rawLine + '\n';
    } else {
      // Skip comment-only lines when buffer is empty
      if (!buffer && (!trimmed || trimmed.startsWith('--'))) continue;

      if (!trimmed.startsWith('--')) {
        buffer += rawLine + '\n';
      }

      // Semicolon ends a regular SQL statement
      if (trimmed.endsWith(';')) {
        const stmt = buffer.replace(/--[^\n]*/g, '').trim();
        // Remove trailing semicolon (oracledb doesn't want it on DDL)
        if (stmt) statements.push({ sql: stmt.replace(/;\s*$/, ''), plsql: false });
        buffer = '';
      }
    }
  }

  // Flush remaining (e.g. commented-out INSERTs at the end)
  if (buffer.trim()) {
    const stmt = buffer.replace(/--[^\n]*/g, '').trim();
    if (stmt) statements.push({ sql: stmt.replace(/;\s*$/, ''), plsql: false });
  }

  return statements.filter(s => s.sql.length > 5);
}

async function main() {
  console.log('Leyendo schema.sql...');
  const raw = readFileSync(schemaPath, 'utf8');
  const statements = parseStatements(raw);

  console.log(`Total de sentencias a ejecutar: ${statements.length}\n`);

  const pool = await getPool();
  const conn = await pool.getConnection();

  let ok = 0;
  let skipped = 0;
  let errors = 0;

  for (const { sql, plsql } of statements) {
    const preview = sql.slice(0, 80).replace(/\n/g, ' ');
    try {
      await conn.execute(sql);
      console.log(`  OK  ${preview}`);
      ok++;
    } catch (err) {
      // ORA-00955: name already used  |  ORA-02261: constraint exists  |  ORA-01408: index exists
      if ([955, 2261, 1408, 4080].includes(err.errorNum)) {
        console.log(`  SKIP (ya existe)  ${preview}`);
        skipped++;
      } else {
        console.error(`  ERROR [ORA-${err.errorNum}] ${err.message}`);
        console.error(`        -> ${preview}`);
        errors++;
      }
    }
  }

  await conn.close();
  await closePool();

  console.log(`\n=== Resultado ===`);
  console.log(`  OK:      ${ok}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errores: ${errors}`);

  if (errors > 0) process.exit(1);
}

main().catch(async err => {
  console.error(err);
  try { await closePool(); } catch (_) {}
  process.exit(1);
});
