import { testConnection, closePool } from '../config/db.js';

async function main() {
  try {
    const ok = await testConnection();
    if (ok) {
      console.log('Oracle DB connection: OK');
      await closePool();
      process.exit(0);
    } else {
      console.error('Oracle DB connection: Query failed');
      await closePool();
      process.exit(2);
    }
  } catch (err) {
    console.error('Oracle DB connection: ERROR');
    console.error(err?.message || err);
    try { await closePool(); } catch (_) { /* noop */ }
    process.exit(1);
  }
}

main();
